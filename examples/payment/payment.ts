import { createFlashKit } from '@flashkit/core'
import { parseEther } from 'viem'

async function main() {
  console.log('⚡ FlashKit Fast Payment Example — GIWA Sepolia')
  const flashkit = createFlashKit()

  // Simulate payment pre-flight
  const sim = await flashkit.simulate({
    account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    value: parseEther('0.0001')
  })

  if (!sim.success) {
    console.log(`[Safety Check]: Pre-flight simulation successfully protected user from failed tx: ${sim.revertReason}`)
  } else {
    console.log(`Estimated Gas: ${sim.gasUsed}`)
  }
  console.log(`Latency: ${sim.durationMs}ms`)
}

main().catch(console.error)
