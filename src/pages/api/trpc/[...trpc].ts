import { createContext } from '@/server/api/trpc/context'
import { appRouter } from '@/server/api/trpc/root'
import * as trpcNext from '@trpc/server/adapters/next'

const handler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: async () => {
    const ctx = await createContext()
    return ctx
  },
})

export default handler
