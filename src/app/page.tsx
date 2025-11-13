'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with auth buttons */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">RIGWISE</h1>
            <p className="mt-2 text-slate-300">LLM Compatibility Analyzer</p>
          </div>
          <div className="flex gap-4">
            {status === 'loading' ? (
              <div className="text-slate-400">Loading...</div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/check"
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 font-semibold"
                >
                  Check Compatibility
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero section */}
        <div className="mt-16 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Check if your hardware can run any LLM
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Analyze your system's compatibility with large language models including MoE architectures
          </p>
          <Link
            href="/check"
            className="inline-block px-8 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 font-semibold text-lg"
          >
            Start Checking →
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Fast Analysis</h3>
            <p className="text-slate-400">
              Get instant compatibility results for your hardware setup
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Accurate Estimates</h3>
            <p className="text-slate-400">
              VRAM, RAM, and storage calculations with MoE support
            </p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-slate-400">
              Get upgrade suggestions when hardware doesn't meet requirements
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
