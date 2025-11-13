'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 left-6 p-3 rounded-lg transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700'
            : 'bg-white hover:bg-slate-50 border border-slate-300 shadow-lg'
        }`}
      >
        {isDark ? (
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Dashboard
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Welcome back, {session.user?.name || session.user?.email}!
            </p>
          </div>

          {/* User Info Card */}
          <div className={`rounded-2xl p-8 mb-6 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
              : 'bg-white border border-slate-200 shadow-xl'
          }`}>
            <div className="flex items-center gap-6 mb-6">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-blue-500"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                </div>
              )}
              <div>
                <h2 className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {session.user?.name || 'User'}
                </h2>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className={`border-t pt-6 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/check"
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Check Compatibility
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Test your hardware
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/"
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Home
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Return to homepage
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDark
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
