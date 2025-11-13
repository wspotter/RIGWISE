"use client"

import React, { useState, useEffect } from 'react'
import { trpc } from '../../utils/trpc'

export default function CheckPage() {
  const [isDark, setIsDark] = useState(true)
  const [cpuCores, setCpuCores] = useState(8)
  const [vramGB, setVramGB] = useState(16)
  const [ramGB, setRamGB] = useState(32)
  const [storageGB, setStorageGB] = useState(512)

  const [parameterCount, setParameterCount] = useState(7)
  const [quantization, setQuantization] = useState('8-bit')
  const [contextLength, setContextLength] = useState(4096)
  const [batchSize, setBatchSize] = useState(1)
  const [isMoE, setIsMoE] = useState(false)
  const [activeExperts, setActiveExperts] = useState(2)
  const [totalExperts, setTotalExperts] = useState(8)

  const [result, setResult] = useState<any | null>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const analyzeMutation = trpc.compatibility.analyze.useMutation()
  const createHardwareMutation = trpc.hardware.create.useMutation()
  const hardwareListQuery = trpc.hardware.list.useQuery(undefined, {
    enabled: false, // Don't auto-fetch on mount
  })

  // Load theme preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      setIsDark(saved === 'dark')
    }
  }, [])

  // Save theme preference
  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const hardware = {
      cpuCores: Number(cpuCores),
      vramGB: Number(vramGB),
      ramGB: Number(ramGB),
      storageGB: Number(storageGB),
    }

    const model = {
      parameterCount: Number(parameterCount),
      quantization,
      minStorageGB: Math.ceil((Number(parameterCount) * 1e9 * 4) / 1e9) // rough
    }

    try {
      // Use trpc mutation to analyze compatibility
      const analysis = await analyzeMutation.mutateAsync({ 
        profile: hardware, 
        model, 
        contextLength: Number(contextLength), 
        batchSize: Number(batchSize),
        isMoE,
        activeExperts: isMoE ? Number(activeExperts) : undefined,
        totalExperts: isMoE ? Number(totalExperts) : undefined
      })
      setResult(analysis)
    } catch (err:any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function loadProfiles() {
    try {
      const result = await hardwareListQuery.refetch()
      setProfiles(result.data || [])
    } catch (err) {
      console.error('Failed to load profiles:', err)
    }
  }

  async function saveProfile() {
    if (!profileName.trim()) {
      setSaveMessage('Please enter a profile name')
      return
    }

    const hardware = {
      name: profileName.trim(),
      cpuCores: Number(cpuCores),
      cpuThreads: Number(cpuCores) * 2, // Estimate
      vramGB: Number(vramGB),
      ramGB: Number(ramGB),
      storageGB: Number(storageGB),
      cpuBrand: 'Custom',
      cpuModel: 'Custom CPU',
      gpuBrand: 'Custom',
      gpuModel: 'Custom GPU',
      ramType: 'DDR4',
      ramSpeed: 3200,
      storageType: 'SSD',
      isDefault: false
    }
    
    try {
      await createHardwareMutation.mutateAsync(hardware)
      await loadProfiles()
      setSaveMessage('Profile saved successfully!')
      setProfileName('')
      setTimeout(() => {
        setShowSaveDialog(false)
        setSaveMessage('')
      }, 2000)
    } catch (err) {
      setSaveMessage('Failed to save profile')
      console.error('Save error:', err)
    }
  }

  function loadProfile(profile: any) {
    setCpuCores(profile.cpuCores)
    setVramGB(profile.vramGB)
    setRamGB(profile.ramGB)
    setStorageGB(profile.storageGB)
    setSelectedProfileId(profile.id)
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center relative">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`absolute left-0 top-0 p-3 rounded-lg transition-all shadow-lg ${
              isDark 
                ? 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50' 
                : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-md'
            }`}
            aria-label="Toggle theme"
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
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            RIGWISE
          </h1>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>LLM Hardware Compatibility Analyzer</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Input Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Hardware Section */}
              <section className={`backdrop-blur-sm rounded-xl p-6 shadow-xl border ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Hardware Configuration</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>CPU Cores</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={cpuCores} 
                      onChange={(e)=>setCpuCores(Number(e.target.value))} 
                      min={1} 
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>VRAM (GB)</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={vramGB} 
                      onChange={(e)=>setVramGB(Number(e.target.value))} 
                      min={1} 
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>RAM (GB)</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={ramGB} 
                      onChange={(e)=>setRamGB(Number(e.target.value))} 
                      min={1} 
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Storage (GB)</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={storageGB} 
                      onChange={(e)=>setStorageGB(Number(e.target.value))} 
                      min={1} 
                    />
                  </label>
                </div>
              </section>

              {/* Model Section */}
              <section className={`backdrop-blur-sm rounded-xl p-6 shadow-xl border ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Model Parameters</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Parameter Count (B)</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={parameterCount} 
                      onChange={(e)=>setParameterCount(Number(e.target.value))} 
                      min={1} 
                      step={0.1} 
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Quantization</span>
                    <select 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      value={quantization} 
                      onChange={(e)=>setQuantization(e.target.value)}
                    >
                      <option value="4-bit">4-bit</option>
                      <option value="8-bit">8-bit</option>
                      <option value="FP16">FP16</option>
                      <option value="FP32">FP32</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Context Length</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={contextLength} 
                      onChange={(e)=>setContextLength(Number(e.target.value))} 
                      min={512} 
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Batch Size</span>
                    <input 
                      className={`px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      type="number" 
                      value={batchSize} 
                      onChange={(e)=>setBatchSize(Number(e.target.value))} 
                      min={1} 
                    />
                  </label>
                </div>
                
                {/* MoE Settings */}
                <div className={`mt-4 p-4 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-900/30 border-slate-700/50' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <label className="flex items-center gap-3 mb-3">
                    <input 
                      type="checkbox" 
                      checked={isMoE}
                      onChange={(e) => setIsMoE(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 text-purple-500 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Mixture of Experts (MoE) Model
                    </span>
                  </label>
                  
                  {isMoE && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <label className="flex flex-col">
                        <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Active Experts
                        </span>
                        <input 
                          className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all border text-sm ${
                            isDark 
                              ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          type="number" 
                          value={activeExperts} 
                          onChange={(e)=>setActiveExperts(Number(e.target.value))} 
                          min={1}
                          max={totalExperts}
                        />
                      </label>
                      <label className="flex flex-col">
                        <span className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Total Experts
                        </span>
                        <input 
                          className={`px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all border text-sm ${
                            isDark 
                              ? 'bg-slate-900/50 border-slate-600/50 text-slate-100' 
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          type="number" 
                          value={totalExperts} 
                          onChange={(e)=>setTotalExperts(Number(e.target.value))} 
                          min={activeExperts}
                        />
                      </label>
                      <div className={`col-span-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        💡 Examples: Mixtral 8x7B (2/8), DeepSeek-V2 (6/160), Qwen2.5 MoE (8/64)
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-end">
                <button 
                  className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/50 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Analyze Compatibility
                    </>
                  )}
                </button>
                <button 
                  className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                  type="button" 
                  onClick={() => setShowSaveDialog(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Profile
                </button>
              </div>
            </form>

            {/* Save Profile Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl p-6 max-w-md w-full shadow-2xl ${
                  isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Save Hardware Profile
                  </h3>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter profile name..."
                    className={`w-full px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border ${
                      isDark
                        ? 'bg-slate-900/50 border-slate-600/50 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    autoFocus
                  />
                  {saveMessage && (
                    <p className={`mb-4 text-sm ${
                      saveMessage.includes('success') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {saveMessage}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={saveProfile}
                      className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false)
                        setProfileName('')
                        setSaveMessage('')
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                        isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div className={`backdrop-blur-sm rounded-xl p-6 shadow-xl border ${
                isDark 
                  ? 'bg-slate-800/50 border-slate-700/50' 
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analysis Results
                </h3>
                
                {result.error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                
                {result.isCompatible !== undefined && (
                  <div className="space-y-4">
                    {/* Compatibility Status */}
                    <div className={`p-4 rounded-lg border-2 ${result.isCompatible ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                      <div className="flex items-center gap-3">
                        {result.isCompatible ? (
                          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <div>
                          <div className={`text-xl font-bold ${result.isCompatible ? 'text-green-400' : 'text-red-400'}`}>
                            {result.isCompatible ? 'Compatible! Your rig can run this model.' : 'Not Compatible'}
                          </div>
                          <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Compatibility Score: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{result.compatibilityScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resource Requirements */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className={`rounded-lg p-4 border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-700/50' 
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Estimated VRAM</div>
                        <div className="text-2xl font-bold text-cyan-400">{result.estimatedVramGB.toFixed(1)} GB</div>
                      </div>
                      <div className={`rounded-lg p-4 border ${
                        isDark 
                          ? 'bg-slate-900/50 border-slate-700/50' 
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Estimated RAM</div>
                        <div className="text-2xl font-bold text-purple-400">{result.estimatedRamGB.toFixed(1)} GB</div>
                      </div>
                    </div>

                    {/* Bottlenecks */}
                    {result.bottlenecks && result.bottlenecks.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <div className="font-semibold text-yellow-400">Bottlenecks Detected</div>
                            <div className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{result.bottlenecks.join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Recommended Upgrades
                        </h4>
                        <div className="space-y-3">
                          {result.recommendations.map((r:any) => (
                            <div key={r.product.id} className={`rounded-lg p-4 hover:border-blue-500/50 transition-all border ${
                              isDark 
                                ? 'bg-slate-900/50 border-slate-700/50' 
                                : 'bg-slate-50 border-slate-200 hover:border-blue-400'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className={`font-semibold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{r.product.brand} {r.product.model}</div>
                                  <div className="text-sm text-blue-400 font-medium mt-1">{r.type}</div>
                                  <div className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{r.reason}</div>
                                </div>
                                <div className="flex gap-2">
                                  {r.product.amazonLink && (
                                    <a 
                                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-lg text-black font-semibold transition-all text-sm flex items-center gap-1 shadow-lg" 
                                      href={r.product.amazonLink} 
                                      target="_blank" 
                                      rel="noreferrer"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.61-4.516.61-2.265 0-4.442-.353-6.544-1.062-2.134-.718-4.096-1.726-5.874-3.024-.214-.16-.293-.31-.235-.45z"/>
                                        <path d="M21.48 16.336c-.314-.2-.623-.41-.93-.63-.82-.586-1.473-1.112-1.955-1.582-.37-.355-.556-.82-.556-1.397 0-.452.18-.866.538-1.244.357-.377.82-.733 1.387-1.066 1.02-.59 1.755-1.12 2.204-1.585.45-.466.673-1.026.673-1.68 0-.615-.23-1.12-.69-1.515-.46-.395-1.04-.593-1.74-.593-.66 0-1.21.18-1.65.54-.44.36-.66.84-.66 1.44h-1.35c0-.99.39-1.81 1.17-2.46.78-.65 1.77-.975 2.97-.975 1.14 0 2.07.3 2.79.9.72.6 1.08 1.38 1.08 2.34 0 .87-.3 1.62-.9 2.25-.6.63-1.47 1.26-2.61 1.89-.87.48-1.47.87-1.8 1.17-.33.3-.495.645-.495 1.035v.15h5.58v1.35h-7.425c0-.705.165-1.305.495-1.8z"/>
                                      </svg>
                                      Amazon
                                    </a>
                                  )}
                                  {r.product.neweggLink && (
                                    <a 
                                      className="px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-white font-semibold transition-all text-sm flex items-center gap-1 shadow-lg" 
                                      href={r.product.neweggLink} 
                                      target="_blank" 
                                      rel="noreferrer"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2 6h20v12H2z"/>
                                      </svg>
                                      Newegg
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Saved Profiles */}
          <div className="lg:col-span-1">
            <div className={`backdrop-blur-sm rounded-xl p-6 shadow-xl sticky top-6 border ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700/50' 
                : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Saved Profiles
              </h3>
              <button 
                className={`w-full px-4 py-2 rounded-lg transition-all mb-4 flex items-center justify-center gap-2 text-sm ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
                onClick={loadProfiles}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {profiles.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div className="text-sm">No saved profiles</div>
                </div>
              )}
              {profiles.length > 0 && (
                <>
                  <select 
                    className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm border mb-3 ${
                      isDark
                        ? 'bg-slate-900/50 border-slate-600/50 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    value={selectedProfileId || ''} 
                    onChange={(e)=> setSelectedProfileId(e.target.value)}
                  >
                    <option value="">Select a profile</option>
                    {profiles.map((p)=> (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const profile = profiles.find(p => p.id === selectedProfileId)
                      if (profile) loadProfile(profile)
                    }}
                    disabled={!selectedProfileId}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedProfileId
                        ? isDark
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : isDark
                          ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Load Profile
                  </button>
                  {selectedProfileId && profiles.find(p => p.id === selectedProfileId) && (
                    <div className={`mt-4 p-4 rounded-lg text-sm ${
                      isDark ? 'bg-slate-900/50' : 'bg-slate-50'
                    }`}>
                      {(() => {
                        const p = profiles.find(pr => pr.id === selectedProfileId)
                        return p ? (
                          <div className="space-y-2">
                            <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              <span className="font-semibold">CPU:</span> {p.cpuCores} cores
                            </div>
                            <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              <span className="font-semibold">VRAM:</span> {p.vramGB} GB
                            </div>
                            <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              <span className="font-semibold">RAM:</span> {p.ramGB} GB
                            </div>
                            <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              <span className="font-semibold">Storage:</span> {p.storageGB} GB
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
