import { initTRPC } from '@trpc/server'
import type { Context } from './context'
import { z } from 'zod'

const t = initTRPC.context<Context>().create()

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

export const appRouter = createTRPCRouter({})

export type AppRouter = typeof appRouter
