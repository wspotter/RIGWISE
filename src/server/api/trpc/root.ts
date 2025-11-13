import { createTRPCRouter } from './trpc'
import { helloRouter } from './routers/hello'
import { modelRouter } from './routers/model'
import { hardwareRouter } from './routers/hardware'
import { compatibilityRouter } from './routers/compatibility'

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  model: modelRouter,
  hardware: hardwareRouter,
  compatibility: compatibilityRouter,
})

export type AppRouter = typeof appRouter
