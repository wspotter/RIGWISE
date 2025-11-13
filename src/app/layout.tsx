import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '../components/Providers'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RIGWISE - LLM Compatibility Analyzer',
  description: 'Check if your hardware can run a given LLM',
}

function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
  <Providers>{children}</Providers>
      </body>
    </html>
  )
}
