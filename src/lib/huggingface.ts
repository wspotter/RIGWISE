export async function parseModelCard(url: string) {
  const modelIdMatch = url.match(/huggingface.co\/(.+)$/)
  if (!modelIdMatch) return null
  const modelId = modelIdMatch[1]

  try {
    const res = await fetch(`https://huggingface.co/api/models/${modelId}`)
    if (!res.ok) return null
    const data = await res.json()
    const siblings = data.siblings || []
    let totalWeight = 0
    let quantization = null
    for (const s of siblings) {
      const fname = s.filename || s.rfilename || ''
      const size = s.size || 0
      if (/\.(bin|pt|safetensors|gguf|pth|ckpt)$/i.test(fname)) totalWeight += size
      if (/q4|4bit/i.test(fname)) quantization = '4-bit'
      else if (/q8|8bit/i.test(fname)) quantization = '8-bit'
    }
    const parameterCount = totalWeight ? +(totalWeight / 4 / 1e9).toFixed(3) : null
    const configRes = await fetch(`https://huggingface.co/${modelId}/raw/main/config.json`)
    const config = configRes.ok ? await configRes.json() : null
    const maxContextLength = config?.max_position_embeddings || config?.n_ctx || null
    return {
      modelId,
      name: data.modelId || data.id || modelId,
      parameterCount,
      quantization,
      maxContextLength,
    }
  } catch (err) {
    return null
  }
}

export default parseModelCard
