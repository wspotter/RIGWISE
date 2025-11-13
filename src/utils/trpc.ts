import { createTRPCReact } from '@trpc/react-query'

// For early dev, keep the client side trpc as `any` to avoid compiler complaints
// and to prevent type collisions; ensure this is tightened later in production.
export const trpc: any = createTRPCReact<any>()
