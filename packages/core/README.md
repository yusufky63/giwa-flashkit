# @flashkit/core ⚡

**Core transaction lifecycle, preconfirmation, simulation, and metrics engine for GIWA Flashblocks.**

Part of the [FlashKit](https://github.com/yusufky63/giwa-flashkit) developer toolkit for GIWA.

## Installation

```bash
npm install @flashkit/core viem
# or
pnpm add @flashkit/core viem
```

## Quickstart

```typescript
import { createFlashKit } from '@flashkit/core'

const flashkit = createFlashKit({
  network: 'giwaSepolia'
})

// Track any transaction hash from your wallet
const tracker = flashkit.trackTransaction(hash)

tracker.on('preconfirmed', ({ state }) => {
  console.log(`⚡ Preconfirmed in ${state.timeline.preconfirmationMs}ms!`)
})

tracker.on('included', ({ state }) => {
  console.log(`📦 Included in Canonical Block #${state.blockNumber}`)
})
```

## Pre-Flight Simulation (`eth_simulateV1`)

```typescript
const result = await flashkit.simulate({
  to: '0x...',
  value: 1000000000000000n
})

console.log('Success:', result.success, 'Gas:', result.gasUsed)
```

## License

MIT © FlashKit Contributors
