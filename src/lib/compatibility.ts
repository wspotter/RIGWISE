export function bytesPerParamForQuant(quantization: string | null) {
  switch (quantization) {
    case '4-bit':
      return 0.5
    case '8-bit':
      return 1
    case 'FP16':
      return 2
    default:
      return 4
  }
}

export function calculateVRAMRequirement(
  parameterBillions: number, 
  quantization: string | null, 
  contextLength: number, 
  batchSize = 1,
  options?: { isMoE?: boolean; activeExperts?: number; totalExperts?: number }
) {
  const bytesPerParam = bytesPerParamForQuant(quantization)
  
  // For MoE models, calculate based on active parameters
  let effectiveParams = parameterBillions
  if (options?.isMoE && options.activeExperts && options.totalExperts) {
    // Only active experts need to be loaded in VRAM, shared params + active experts
    // Typical: 2 active out of 8 experts = ~25% of expert params + 100% of shared params
    const expertRatio = options.activeExperts / options.totalExperts
    // Assume 20% shared params, 80% expert params
    effectiveParams = parameterBillions * (0.2 + (0.8 * expertRatio))
  }
  
  const modelWeightsGB = (effectiveParams * 1e9 * bytesPerParam) / 1e9

  const kvCacheGB = (effectiveParams * contextLength / 1000) * 0.1 * batchSize
  const overheadGB = effectiveParams * 0.2

  return modelWeightsGB + kvCacheGB + overheadGB
}

export function calculateRAMRequirement(parameterBillions: number, contextLength: number) {
  const baseSystemGB = 4
  const modelBufferGB = parameterBillions * 0.2
  const contextBufferGB = contextLength / 2000

  return baseSystemGB + modelBufferGB + contextBufferGB
}

export function analyzeCompatibility(hardware: any, model: any, options:any) {
  const requiredVram = calculateVRAMRequirement(
    model.parameterCount, 
    model.quantization, 
    options.contextLength, 
    options.batchSize,
    { 
      isMoE: options.isMoE, 
      activeExperts: options.activeExperts, 
      totalExperts: options.totalExperts 
    }
  )
  const requiredRam = calculateRAMRequirement(model.parameterCount, options.contextLength)

  const bottlenecks: string[] = []
  let isCompatible = true
  let score = 100

  if (hardware.vramGB < requiredVram) {
    isCompatible = false
    bottlenecks.push(`Insufficient VRAM: Need ${requiredVram.toFixed(1)}GB, have ${hardware.vramGB}GB`)
    score -= 40
  } else if (hardware.vramGB < requiredVram * 1.2) {
    bottlenecks.push('VRAM usage will be very high (>80%)')
    score -= 15
  }

  if (hardware.ramGB < requiredRam) {
    isCompatible = false
    bottlenecks.push(`Insufficient RAM: Need ${requiredRam.toFixed(1)}GB, have ${hardware.ramGB}GB`)
    score -= 30
  }

  if (hardware.storageGB < model.minStorageGB) {
    isCompatible = false
    bottlenecks.push(`Insufficient storage: Need ${model.minStorageGB}GB, have ${hardware.storageGB}GB`)
    score -= 20
  }

  if (hardware.cpuCores < 8 && model.parameterCount > 13) {
    bottlenecks.push('CPU may bottleneck with fewer than 8 cores')
    score -= 10
  }

  return {
    isCompatible,
    compatibilityScore: Math.max(0, score),
    estimatedVramGB: requiredVram,
    estimatedRamGB: requiredRam,
    estimatedStorageGB: model.minStorageGB,
    bottlenecks,
  }
}
