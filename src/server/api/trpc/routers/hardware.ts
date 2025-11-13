import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const hardwareRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(64),
        cpuBrand: z.string(),
        cpuModel: z.string(),
        cpuCores: z.number().int().min(1),
        cpuThreads: z.number().int().min(1),
        gpuBrand: z.string(),
        gpuModel: z.string(),
        vramGB: z.number().int().min(1),
        ramGB: z.number().int().min(1),
        ramType: z.string(),
        ramSpeed: z.number().int().optional(),
        storageGB: z.number().int().min(1),
        storageType: z.string(),
        isDefault: z.boolean().optional(),
      })
    )
  .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const profile = await ctx.prisma.hardwareProfile.create({ data: input })
      return profile
    }),

  list: publicProcedure.query(async ({ ctx }: { ctx: any }) => {
    const profiles = await ctx.prisma.hardwareProfile.findMany({ orderBy: { createdAt: 'desc' } })
    return profiles
  }),
})
