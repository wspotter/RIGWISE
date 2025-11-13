'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDark(savedTheme === 'dark')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Welcome Back
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Log in to your RIGWISE account
            </p>
          </div>

          {/* Card */}
          <div className={`rounded-2xl p-8 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
              : 'bg-white border border-slate-200 shadow-xl'
          }`}>
            {error && (
              <div className={`mb-6 p-4 rounded-lg ${
                isDark ? 'bg-red-900/20 border border-red-700/50 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block mb-2 font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-300 ${
                    isDark
                      ? 'bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
                  } focus:outline-none`}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className={`block mb-2 font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-300 ${
                    isDark
                      ? 'bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
                  } focus:outline-none`}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className={`absolute inset-0 flex items-center`}>
                  <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-4 ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-white text-slate-600'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Log in with Google
              </button>
            </div>

            <p className={`mt-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Don't have an account?{' '}
              <Link
                href="/signup"
                className={`font-semibold ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
