import { createFlashKit } from '@flashkit/core'
import { parseAbi } from 'viem'

const COUNTER_ABI = parseAbi([
  'function count() view returns (uint256)',
  'function increment() returns (uint256)',
  'event Incremented(address indexed caller, uint256 newCount, uint256 timestamp)'
])

async function main() {
  console.log('⚡ FlashKit Counter Example — GIWA Sepolia')
  const flashkit = createFlashKit()

  // 1. Simulate increment on pending block
  console.log('Simulating counter increment on pending Flashblock...')
  const sim = await flashkit.simulate({
    to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    data: '0xd09de08a' // increment() selector
  })

  console.log(`Simulation result: ${sim.success ? 'SUCCESS' : 'REVERTED'}`)
  console.log(`Estimated Gas: ${sim.gasUsed}`)
  console.log(`Latency: ${sim.durationMs}ms`)
}

main().catch(console.error)
