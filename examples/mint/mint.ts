import { createFlashKit } from '@flashkit/core'

async function main() {
  console.log('⚡ FlashKit Mint Lifecycle Example — GIWA Sepolia')
  const flashkit = createFlashKit()

  // 1. Simulate mint() call on pending Flashblock
  console.log('Simulating FlashMint.mint() on pending block...')
  const sim = await flashkit.simulate({
    to: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    data: '0x1249c58b' // mint() selector
  })

  console.log(`Simulation status: ${sim.success ? 'SUCCESS' : 'REVERTED'}`)
  console.log(`Estimated Gas: ${sim.gasUsed}`)
  console.log(`Execution Latency: ${sim.durationMs}ms`)
}

main().catch(console.error)
