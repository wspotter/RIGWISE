import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const appRouter = createTRPCRouter({})

export type AppRouter = typeof appRouter
