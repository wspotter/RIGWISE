'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful, but login failed. Please try logging in.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
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
              Create Account
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Join RIGWISE to check your hardware compatibility
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
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-300 ${
                    isDark
                      ? 'bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
                  } focus:outline-none`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className={`block mb-2 font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Email *
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
                  Password *
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
                  minLength={6}
                />
              </div>

              <div>
                <label className={`block mb-2 font-medium ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg transition-colors duration-300 ${
                    isDark
                      ? 'bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-blue-500'
                  } focus:outline-none`}
                  placeholder="••••••••"
                  minLength={6}
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
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className={`mt-6 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Already have an account?{' '}
              <Link
                href="/login"
                className={`font-semibold ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
