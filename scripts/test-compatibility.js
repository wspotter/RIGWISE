const { calculateVRAMRequirement, calculateRAMRequirement, analyzeCompatibility } = require('../src/lib/compatibility')

function pretty(obj) { console.log(JSON.stringify(obj, null, 2)) }

console.log('Testing VRAM calc for 7B, 8-bit, 4096 ctx:')
pretty({ vramGB: calculateVRAMRequirement(7, '8-bit', 4096, 1) })

console.log('Testing RAM calc for 7B, 4096 ctx:')
pretty({ ramGB: calculateRAMRequirement(7, 4096) })

console.log('Testing analyzeCompatibility:')
pretty(analyzeCompatibility({ vramGB: 16, ramGB: 32, storageGB: 400, cpuCores: 8 }, { parameterCount: 7, quantization: '8-bit', minStorageGB: 40 }, { contextLength: 4096, batchSize: 1 }))
