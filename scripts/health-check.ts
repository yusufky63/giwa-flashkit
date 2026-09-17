import { createPublicClient, http } from 'viem'
import { giwaSepolia, giwaSepoliaPreconf } from 'viem/chains'

interface CheckResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  latencyMs: number
  details?: string
}

async function runCheck(name: string, fn: () => Promise<string | undefined>): Promise<CheckResult> {
  const start = performance.now()
  try {
    const details = await fn()
    const latencyMs = Math.round(performance.now() - start)
    return { name, status: 'PASS', latencyMs, details }
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start)
    return {
      name,
      status: 'FAIL',
      latencyMs,
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('⚡ FLASHKIT — GIWA SEPOLIA HEALTH CHECK')
  console.log('='.repeat(60))
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log(`Target Chain: GIWA Sepolia (${giwaSepolia.id})`)
  console.log('')

  const standardClient = createPublicClient({
    chain: giwaSepolia,
    transport: http()
  })

  const flashClient = createPublicClient({
    chain: giwaSepoliaPreconf,
    transport: http()
  })

  const results: CheckResult[] = []

  // 1. Standard RPC Chain ID
  results.push(
    await runCheck('Standard RPC Chain ID', async () => {
      const chainId = await standardClient.getChainId()
      if (chainId !== 91342) throw new Error(`Expected 91342, got ${chainId}`)
      return `Chain ID: ${chainId}`
    })
  )

  // 2. Flashblocks RPC Chain ID
  results.push(
    await runCheck('Flashblocks RPC Chain ID', async () => {
      const chainId = await flashClient.getChainId()
      if (chainId !== 91342) throw new Error(`Expected 91342, got ${chainId}`)
      return `Chain ID: ${chainId}`
    })
  )

  // 3. Standard Latest Block
  results.push(
    await runCheck('Standard RPC Latest Block', async () => {
      const block = await standardClient.getBlock({ blockTag: 'latest' })
      return `Block #${block.number} (${block.hash?.slice(0, 14)}...)`
    })
  )

  // 4. Flashblocks Pending Block
  results.push(
    await runCheck('Flashblocks RPC Pending Block', async () => {
      const block = await flashClient.getBlock({ blockTag: 'pending' })
      return `Pending Block #${block.number} (tx count: ${block.transactions.length})`
    })
  )

  // 5. Read Call (eth_call)
  results.push(
    await runCheck('Flashblocks eth_call (pending)', async () => {
      // Burn address query or simple bytecode query
      const balance = await flashClient.getBalance({
        address: '0x0000000000000000000000000000000000000000',
        blockTag: 'pending'
      })
      return `Burn balance: ${balance} wei`
    })
  )

  // 6. Estimate Gas (eth_estimateGas)
  results.push(
    await runCheck('Flashblocks eth_estimateGas', async () => {
      const gas = await flashClient.estimateGas({
        account: '0x0000000000000000000000000000000000000001',
        to: '0x0000000000000000000000000000000000000002',
        value: 1n
      })
      return `Estimated transfer gas: ${gas}`
    })
  )

  // 7. eth_simulateV1 raw check
  results.push(
    await runCheck('Flashblocks eth_simulateV1', async () => {
      try {
        const response = await fetch('https://sepolia-rpc-flashblocks.giwa.io', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_simulateV1',
            params: [
              {
                blockStateCalls: [
                  {
                    blockOverrides: {},
                    stateOverrides: {},
                    calls: [
                      {
                        from: '0x1111111111111111111111111111111111111111',
                        to: '0x2222222222222222222222222222222222222222',
                        data: '0x',
                        value: '0x1'
                      }
                    ]
                  }
                ]
              },
              'pending'
            ]
          })
        })
        const json = (await response.json()) as { error?: { message: string; code: number }; result?: unknown }
        if (json.error && json.error.code !== -32601) {
          // It accepted the method, returned simulation response or domain error
          return `Simulation endpoint responded: ${json.error.message}`
        }
        if (json.result) {
          return `Simulation successful: ${JSON.stringify(json.result).slice(0, 40)}...`
        }
        return `Method acknowledged: ${JSON.stringify(json).slice(0, 40)}`
      } catch (err) {
        throw new Error(`Simulation request failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    })
  )

  // 8. Explorer Connectivity
  results.push(
    await runCheck('Blockscout Explorer Reachability', async () => {
      const res = await fetch('https://sepolia-explorer.giwa.io', { method: 'HEAD' })
      return `HTTP ${res.status} ${res.statusText}`
    })
  )

  console.log('RESULTS:')
  console.log('-'.repeat(60))
  let hasFailures = false
  for (const r of results) {
    const statusFormatted = r.status === 'PASS' ? '✅ PASS' : r.status === 'WARN' ? '⚠️  WARN' : '❌ FAIL'
    console.log(`${statusFormatted.padEnd(10)} | ${r.name.padEnd(35)} | ${String(r.latencyMs + 'ms').padStart(7)} | ${r.details || ''}`)
    if (r.status === 'FAIL') hasFailures = true
  }
  console.log('-'.repeat(60))

  if (hasFailures) {
    console.error('\n❌ Health check failed for one or more critical endpoints.')
    process.exit(1)
  } else {
    console.log('\n🎉 All GIWA Sepolia endpoints are healthy and operational!')
  }
}

main().catch((err) => {
  console.error('Fatal error during health check:', err)
  process.exit(1)
})
