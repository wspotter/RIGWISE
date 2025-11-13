/* Simple script to make a tRPC call to the local dev server to verify the API works */
const { createTRPCProxyClient, httpBatchLink } = require('@trpc/client')
global.fetch = global.fetch || require('node-fetch')

async function main() {
  const url = process.env.TRPC_URL || 'http://localhost:3005/api/trpc'
  const client = createTRPCProxyClient({ links: [httpBatchLink({ url })] })
  try {
    const res = await client.compatibility.analyze.mutate({
      profile: { cpuCores: 8, vramGB: 16, ramGB: 32, storageGB: 512 },
      model: { parameterCount: 7, quantization: '8-bit', minStorageGB: 40 },
      contextLength: 4096,
      batchSize: 1,
    })
    console.log('trpc test response:', res)
  } catch (err) {
    console.error('Error calling trpc:', err)
    process.exit(1)
  }
}

main()
