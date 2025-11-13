#!/usr/bin/env node
const net = require('net')
const { spawn } = require('child_process')

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => {
      resolve(false)
    })
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

async function findFreePort(startPort = 3000, max = 3050) {
  for (let p = startPort; p <= max; p++) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(p)
    if (free) return p
  }
  return null
}

async function main() {
  const startAtEnv = process.env.PORT ? Number(process.env.PORT) : 3000
  const startPort = Number.isNaN(startAtEnv) ? 3000 : startAtEnv
  const requestedPortArg = process.argv.find((a) => a.startsWith('--port='))
  const requestedPort = requestedPortArg ? Number(requestedPortArg.split('=')[1]) : null

  let port = requestedPort || (await findFreePort(startPort, startPort + 50))
  if (!port) {
    console.error('No free port found between', startPort, 'and', startPort + 50)
    process.exit(1)
  }

  console.log(`Starting dev server on port ${port}`)
  const args = ['next', 'dev', '--port', String(port)]
  const extra = process.argv.slice(2).filter((a) => !a.startsWith('--port='))
  const spawnArgs = [...args, ...extra]
  // Spawn 'npx' with arguments directly
  const child = spawn('npx', spawnArgs, { stdio: 'inherit', shell: false })

  child.on('close', (code) => {
    process.exit(code)
  })
}

main().catch((err) => {
  console.error('Error starting dev server', err)
  process.exit(1)
})
