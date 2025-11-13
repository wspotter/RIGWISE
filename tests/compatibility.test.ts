import { describe, it, expect } from 'vitest'
import { bytesPerParamForQuant, calculateVRAMRequirement, calculateRAMRequirement, analyzeCompatibility } from '@/lib/compatibility'

describe('compatibility calculations', () => {
  it('bytes per parameter for quantization are correct', () => {
    expect(bytesPerParamForQuant('4-bit')).toBe(0.5)
    expect(bytesPerParamForQuant('8-bit')).toBe(1)
    expect(bytesPerParamForQuant('FP16')).toBe(2)
    expect(bytesPerParamForQuant('FP32')).toBe(4)
    expect(bytesPerParamForQuant(null)).toBe(4)
  })

  it('VRAM calculation returns greater-than-zero for common models', () => {
    const vram = calculateVRAMRequirement(7, '8-bit', 4096, 1)
    expect(vram).toBeGreaterThan(0)
    expect(vram).toBeLessThan(200)
  })

  it('RAM calculation returns ranges in expected envelope', () => {
    const ram = calculateRAMRequirement(7, 4096)
    expect(ram).toBeGreaterThan(0)
    expect(ram).toBeLessThan(256)
  })

  it('analyzeCompatibility identifies insufficient vram', () => {
    const result = analyzeCompatibility({ vramGB: 4, ramGB: 32, storageGB: 100, cpuCores: 8 }, { parameterCount: 7, quantization: '8-bit', minStorageGB: 40 }, { contextLength: 4096, batchSize: 1 })
    expect(result.isCompatible).toBe(false)
    expect(result.bottlenecks).toEqual(expect.arrayContaining([expect.stringContaining('Insufficient VRAM')]))
  })
})
