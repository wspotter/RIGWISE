"use client"

import React, { useState } from 'react'
import { trpc } from '../../utils/trpc'

export default function CheckPage() {
  const [cpuCores, setCpuCores] = useState(8)
  const [vramGB, setVramGB] = useState(16)
  const [ramGB, setRamGB] = useState(32)
  const [storageGB, setStorageGB] = useState(512)

  const [parameterCount, setParameterCount] = useState(7)
  const [quantization, setQuantization] = useState('8-bit')
  const [contextLength, setContextLength] = useState(4096)
  const [batchSize, setBatchSize] = useState(1)

  const [result, setResult] = useState<any | null>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeMutation = trpc.compatibility.analyze.useMutation()

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
      const analysis = await analyzeMutation.mutateAsync({ profile: hardware, model, contextLength: Number(contextLength), batchSize: Number(batchSize) })
      setResult(analysis)
    } catch (err:any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function loadProfiles() {
  try {
    const data = await trpc.hardware.list.query()
    setProfiles(data || [])
  } catch (err) {
      // noop
    }
  }

  async function saveProfile() {
    const hardware = {
      name: `Profile ${new Date().toISOString()}`,
      cpuCores: Number(cpuCores),
      vramGB: Number(vramGB),
      ramGB: Number(ramGB),
      storageGB: Number(storageGB),
      cpuBrand: 'Unknown',
      cpuModel: 'Unknown',
      gpuBrand: 'Unknown',
      gpuModel: 'Unknown',
      storageType: 'SSD'
    }
  const createMutation = trpc.hardware.create.useMutation()
  try {
    await createMutation.mutateAsync(hardware)
    await loadProfiles()
  } catch (err) {
      // noop
    }
  }

  return (
    <main className="min-h-screen p-8 bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">LLM Compatibility Check</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <section className="p-4 bg-slate-800 rounded">
            <h2 className="font-semibold">Hardware</h2>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="flex flex-col">
                CPU Cores
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={cpuCores} onChange={(e)=>setCpuCores(Number(e.target.value))} min={1} />
              </label>
              <label className="flex flex-col">
                VRAM (GB)
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={vramGB} onChange={(e)=>setVramGB(Number(e.target.value))} min={1} />
              </label>
              <label className="flex flex-col">
                RAM (GB)
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={ramGB} onChange={(e)=>setRamGB(Number(e.target.value))} min={1} />
              </label>
              <label className="flex flex-col">
                Storage (GB)
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={storageGB} onChange={(e)=>setStorageGB(Number(e.target.value))} min={1} />
              </label>
            </div>
          </section>

          <section className="p-4 bg-slate-800 rounded">
            <h2 className="font-semibold">Model</h2>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="flex flex-col">
                Parameter Count (B)
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={parameterCount} onChange={(e)=>setParameterCount(Number(e.target.value))} min={1} step={0.1} />
              </label>
              <label className="flex flex-col">
                Quantization
                <select className="mt-1 p-2 bg-slate-700 rounded" value={quantization} onChange={(e)=>setQuantization(e.target.value)}>
                  <option value="4-bit">4-bit</option>
                  <option value="8-bit">8-bit</option>
                  <option value="FP16">FP16</option>
                  <option value="FP32">FP32</option>
                </select>
              </label>
              <label className="flex flex-col">
                Context Length
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={contextLength} onChange={(e)=>setContextLength(Number(e.target.value))} min={512} />
              </label>
              <label className="flex flex-col">
                Batch Size
                <input className="mt-1 p-2 bg-slate-700 rounded" type="number" value={batchSize} onChange={(e)=>setBatchSize(Number(e.target.value))} min={1} />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 mr-2" type="submit" disabled={loading}>{loading ? 'Running...' : 'Analyze'}</button>
            <button className="bg-slate-600 px-4 py-2 rounded hover:bg-slate-500" type="button" onClick={saveProfile}>Save Profile</button>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-slate-800 rounded">
            <h3 className="font-semibold">Result</h3>
            {result.error && <div className="text-red-400">Error: {result.error}</div>}
            {result.isCompatible !== undefined && (
              <div className="mt-3">
                <div className="text-lg font-semibold">{result.isCompatible ? 'Great News! It Can Run ✅' : 'Not Compatible ❌'}</div>
                <div className="mt-2">Compatibility Score: {result.compatibilityScore}</div>
                <div className="mt-2">Estimated VRAM: {result.estimatedVramGB.toFixed(1)} GB</div>
                <div className="mt-2">Estimated RAM: {result.estimatedRamGB.toFixed(1)} GB</div>
                <div className="mt-2">Bottlenecks: {result.bottlenecks?.join(', ') || 'None'}</div>
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold">Recommended Upgrades</h4>
                    <ul className="mt-2 space-y-2">
                      {result.recommendations.map((r:any) => (
                        <li key={r.product.id} className="p-2 bg-slate-700 rounded flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{r.product.brand} {r.product.model}</div>
                            <div className="text-slate-400 text-sm">{r.type} — {r.reason}</div>
                          </div>
                          <div className="ml-4">
                            {r.product.amazonLink && <a className="bg-yellow-500 px-3 py-1 rounded text-black mr-2" href={r.product.amazonLink} target="_blank" rel="noreferrer">Amazon</a>}
                            {r.product.neweggLink && <a className="bg-orange-500 px-3 py-1 rounded text-black" href={r.product.neweggLink} target="_blank" rel="noreferrer">Newegg</a>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className="mt-4 p-4 bg-slate-800 rounded">
          <h3 className="font-semibold">Saved Profiles</h3>
          <div className="mt-2">
            <button className="mr-2 p-2 bg-slate-700 rounded" onClick={loadProfiles}>Refresh</button>
            {profiles.length === 0 && <div className="mt-2 text-slate-400">No saved profiles</div>}
            {profiles.length > 0 && (
              <select className="mt-2 p-2 bg-slate-700 rounded" value={selectedProfileId || ''} onChange={(e)=> setSelectedProfileId(e.target.value)}>
                <option value="">Select a profile</option>
                {profiles.map((p)=> <option key={p.id} value={p.id}>{p.name} ({p.vramGB}GB VRAM, {p.ramGB}GB RAM)</option>)}
              </select>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
