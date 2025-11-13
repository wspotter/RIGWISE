'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

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
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [status, router, session])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
        // Refresh the session
        window.location.reload()
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setMessage('An error occurred')
    } finally {
      setLoading(false)
    }
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

      {/* Back Button */}
      <Link
        href="/dashboard"
        className={`fixed top-6 right-6 p-3 rounded-lg transition-colors duration-300 ${
          isDark
            ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700'
            : 'bg-white hover:bg-slate-50 border border-slate-300 shadow-lg'
        }`}
      >
        <svg className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </Link>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Profile
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage your account settings
            </p>
          </div>

          {/* Profile Card */}
          <div className={`rounded-2xl p-8 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
              : 'bg-white border border-slate-200 shadow-xl'
          }`}>
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                </div>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                    } border-2 focus:outline-none`}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className={`px-4 py-3 rounded-lg ${
                    isDark ? 'bg-slate-700/50 text-white' : 'bg-slate-50 text-slate-900'
                  }`}>
                    {session.user?.name || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Email
                </label>
                <div className={`px-4 py-3 rounded-lg ${
                  isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-600'
                }`}>
                  {session.user?.email}
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Account Created
                </label>
                <div className={`px-4 py-3 rounded-lg ${
                  isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-50 text-slate-600'
                }`}>
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.includes('success')
                    ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                    : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              {isEditing ? (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setName(session.user?.name || '')
                      setMessage('')
                    }}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Edit Profile
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
