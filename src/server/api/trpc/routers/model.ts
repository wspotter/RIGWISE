import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { parseModelCard } from '../../../../lib/huggingface'

export const modelRouter = createTRPCRouter({
  parseHuggingFace: publicProcedure
    .input(z.object({ url: z.string().url() }))
  .query(async ({ input }: { input: any }) => {
      const { url } = input
  const parsed = await parseModelCard(url)
      if (parsed) return parsed
      // Simple extraction of modelId from URL
      const modelIdMatch = url.match(/huggingface.co\/(.+)$/)
      if (!modelIdMatch) return { error: 'Invalid URL' }
      const modelId = modelIdMatch[1]
      // Try Hugging Face API
      // fallback if parseModelCard didn't return
      return { error: 'Failed to parse model' }
    }),
})
