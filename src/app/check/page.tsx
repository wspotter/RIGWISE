"use client"

import React, { useState } from 'react'

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
  const [loading, setLoading] = useState(false)

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
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hardware, model, contextLength: Number(contextLength), batchSize: Number(batchSize) })
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'API error')
      setResult(data.result)
    } catch (err:any) {
      setResult({ error: err.message })
    } finally {
      setLoading(false)
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
            <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500" type="submit" disabled={loading}>{loading ? 'Running...' : 'Analyze'}</button>
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
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
