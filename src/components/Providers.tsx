"use client"

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '../utils/trpc'
import { httpBatchLink, createTRPCProxyClient } from '@trpc/client'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // relative
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())

  const [trpcClient] = React.useState(() =>
    createTRPCProxyClient<any>({
      links: [
        httpBatchLink({ url: `${getBaseUrl()}/api/trpc` }),
      ],
    })
  )

  const TrpcProvider = (trpc as any).Provider
  return (
    <TrpcProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TrpcProvider>
  )
}
