import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { calculateRAMRequirement, calculateVRAMRequirement } from '@/lib/compatibility'
import { recommendUpgrades } from '@/lib/recommendations'

export const compatibilityRouter = createTRPCRouter({
  analyze: publicProcedure
    .input(
      z.object({
        profile: z.object({
          cpuCores: z.number().int().min(1),
          vramGB: z.number().int().min(1),
          ramGB: z.number().int().min(1),
          storageGB: z.number().int().min(1),
        }),
        model: z.object({
          parameterCount: z.number().min(0),
          quantization: z.string().nullable(),
          minStorageGB: z.number().min(0),
        }),
        contextLength: z.number().int().min(512).default(4096),
        batchSize: z.number().int().min(1).default(1),
      })
    )
  .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { profile, model, contextLength, batchSize } = input

      const estimatedVram = calculateVRAMRequirement(model.parameterCount, model.quantization, contextLength, batchSize)
      const estimatedRam = calculateRAMRequirement(model.parameterCount, contextLength)

      const bottlenecks: string[] = []
      let isCompatible = true
      let score = 100

      if (profile.vramGB < estimatedVram) {
        isCompatible = false
        bottlenecks.push(`Insufficient VRAM: Need ${estimatedVram.toFixed(1)}GB, have ${profile.vramGB}GB`)
        score -= 40
      } else if (profile.vramGB < estimatedVram * 1.2) {
        bottlenecks.push('VRAM usage will be very high (>80%)')
        score -= 15
      }

      if (profile.ramGB < estimatedRam) {
        isCompatible = false
        bottlenecks.push(`Insufficient RAM: Need ${estimatedRam.toFixed(1)}GB, have ${profile.ramGB}GB`)
        score -= 30
      }

      if (profile.storageGB < model.minStorageGB) {
        isCompatible = false
        bottlenecks.push(`Insufficient storage: Need ${model.minStorageGB}GB, have ${profile.storageGB}GB`)
        score -= 20
      }

      if (profile.cpuCores < 8 && model.parameterCount > 13) {
        bottlenecks.push('CPU may bottleneck with fewer than 8 cores')
        score -= 10
      }

  const recommended = await recommendUpgrades(ctx.prisma, { estimatedVramGB: estimatedVram, estimatedRamGB: estimatedRam }, profile)

      return {
        isCompatible,
        compatibilityScore: Math.max(0, score),
        estimatedVramGB: estimatedVram,
        estimatedRamGB: estimatedRam,
        estimatedStorageGB: model.minStorageGB,
        bottlenecks,
        recommendations: recommended,
      }
    }),
})
