import { publicProcedure } from '../trpc'

export const helloRouter = { 
  hello: publicProcedure
    .query(() => {
      return { message: 'Hello from RIGWISE tRPC' }
    })
}
