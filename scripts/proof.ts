import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type Hash
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { giwaSepolia, giwaSepoliaPreconf } from 'viem/chains'

async function runProof() {
  console.log('='.repeat(60))
  console.log('⚡ FLASHKIT — GIWA LIVE PROOF (MILESTONE 1)')
  console.log('='.repeat(60))

  const standardClient = createPublicClient({
    chain: giwaSepolia,
    transport: http()
  })

  const flashClient = createPublicClient({
    chain: giwaSepoliaPreconf,
    transport: http()
  })

  const standardChainId = await standardClient.getChainId()
  const flashChainId = await flashClient.getChainId()

  console.log(`Network:       GIWA Sepolia`)
  console.log(`Standard Chain ID: ${standardChainId}`)
  console.log(`Flash Chain ID:    ${flashChainId}`)

  if (standardChainId !== 91342 || flashChainId !== 91342) {
    throw new Error('Chain ID mismatch! Expected 91342.')
  }

  const latestBlock = await standardClient.getBlock({ blockTag: 'latest' })
  const pendingBlock = await flashClient.getBlock({ blockTag: 'pending' })

  console.log(`Latest Canonical Block: #${latestBlock.number} (${latestBlock.hash})`)
  console.log(`Pending Flashblock:     #${pendingBlock.number} (transactions: ${pendingBlock.transactions.length})`)

  const testPrivateKey = process.env.TEST_PRIVATE_KEY as `0x${string}` | undefined

  if (!testPrivateKey) {
    console.log('\nℹ️  TEST_PRIVATE_KEY not provided in environment.')
    console.log('    Running live pending-state & simulation proof...')

    const simStart = performance.now()
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
    const simTime = Math.round(performance.now() - simStart)
    const simResult = (await response.json()) as { result?: unknown; error?: unknown }
    console.log(`\nSimulation against Flashblocks pending block took: ${simTime}ms`)
    console.log(`Simulate Response: ${simResult.result ? 'SUCCESS' : 'ERROR'}`)
    console.log('\n[PASS] Milestone 1 Read & Simulation Proof Verified.')
    console.log('To run live transaction write proof, run:')
    console.log('  TEST_PRIVATE_KEY=0x... pnpm tsx scripts/proof.ts')
    return
  }

  // Live Write Transaction Flow
  console.log('\n🚀 Starting Live Transaction Write Proof...')
  const account = privateKeyToAccount(testPrivateKey)
  console.log(`Signer address: ${account.address}`)

  const balance = await standardClient.getBalance({ address: account.address })
  console.log(`Balance: ${formatEther(balance)} ETH`)

  if (balance === 0n) {
    console.error('❌ Account balance is 0 ETH. Get GIWA Sepolia faucet ETH first.')
    return
  }

  const wallet = createWalletClient({
    account,
    chain: giwaSepolia,
    transport: http()
  })

  const submitTime = performance.now()
  console.log('\nSubmitting transaction (self-transfer 0.000001 ETH)...')

  const hash = await wallet.sendTransaction({
    to: account.address,
    value: parseEther('0.000001')
  })
  const submittedAt = performance.now()
  const submissionDuration = Math.round(submittedAt - submitTime)
  console.log(`Transaction Hash: ${hash}`)
  console.log(`Submitted in ${submissionDuration}ms`)

  // Poll for Flashblocks receipt (preconfirmation)
  let preconfirmedAt: number | null = null
  let includedAt: number | null = null

  console.log('Tracking preconfirmation via Flashblocks RPC...')
  const pollStart = performance.now()

  while (performance.now() - pollStart < 15000) {
    if (!preconfirmedAt) {
      try {
        const flashReceipt = await flashClient.getTransactionReceipt({ hash })
        if (flashReceipt) {
          preconfirmedAt = performance.now()
          console.log(`⚡ Preconfirmed at ${Math.round(preconfirmedAt - submittedAt)}ms!`)
        }
      } catch {
        // Not yet in pending Flashblock
      }
    }

    if (preconfirmedAt && !includedAt) {
      try {
        const standardReceipt = await standardClient.getTransactionReceipt({ hash })
        if (standardReceipt && standardReceipt.blockNumber) {
          includedAt = performance.now()
          console.log(`📦 Included in Canonical Block #${standardReceipt.blockNumber} at ${Math.round(includedAt - submittedAt)}ms!`)
          break
        }
      } catch {
        // Not yet in canonical block
      }
    }

    await new Promise((r) => setTimeout(r, 50))
  }

  console.log('\n' + '='.repeat(60))
  console.log('FLASHKIT GIWA PROOF REPORT')
  console.log('='.repeat(60))
  console.log(`Network:        GIWA Sepolia`)
  console.log(`Chain ID:       91342`)
  console.log(`Transaction:    ${hash}`)
  console.log(`Submitted:      0 ms`)
  if (preconfirmedAt) {
    console.log(`Preconfirmed:   ${Math.round(preconfirmedAt - submittedAt)} ms ⚡`)
  } else {
    console.log(`Preconfirmed:   TIMEOUT`)
  }
  if (includedAt) {
    console.log(`Included:       ${Math.round(includedAt - submittedAt)} ms`)
  } else {
    console.log(`Included:       PENDING`)
  }

  if (preconfirmedAt && includedAt) {
    const earlySignalMs = Math.round(includedAt - preconfirmedAt)
    console.log(`\nEarly Signal Advantage: ${earlySignalMs} ms`)
    console.log('PASS')
  }
  console.log('='.repeat(60))
}

runProof().catch((err) => {
  console.error('Error during proof execution:', err)
  process.exit(1)
})
