import { createTRPCRouter } from './trpc'
import { helloRouter } from './routers/hello'

export const appRouter = createTRPCRouter({
  hello: helloRouter,
})

export type AppRouter = typeof appRouter
