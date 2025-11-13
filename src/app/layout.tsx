import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '../components/Providers'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RIGWISE - LLM Compatibility Analyzer',
  description: 'Check if your hardware can run a given LLM',
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
