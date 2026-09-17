# FlashKit for GIWA ⚡

**The open-source transaction experience layer for GIWA.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Network: GIWA Sepolia](https://img.shields.io/badge/Network-GIWA%20Sepolia%20(91342)-black.svg)](https://sepolia-explorer.giwa.io)
[![Flashblocks: ~200ms](https://img.shields.io/badge/Flashblocks-~200ms%20Preconf-yellow.svg)](https://docs.giwa.io)
[![npm: core](https://img.shields.io/npm/v/@flashkit/core.svg?label=@flashkit/core&color=blue)](https://www.npmjs.com/package/@flashkit/core)
[![npm: react](https://img.shields.io/npm/v/@flashkit/react.svg?label=@flashkit/react&color=blue)](https://www.npmjs.com/package/@flashkit/react)
[![npm: ui](https://img.shields.io/npm/v/@flashkit/ui.svg?label=@flashkit/ui&color=blue)](https://www.npmjs.com/package/@flashkit/ui)
[![npm: testing](https://img.shields.io/npm/v/@flashkit/testing.svg?label=@flashkit/testing&color=blue)](https://www.npmjs.com/package/@flashkit/testing)
[![Website](https://img.shields.io/badge/Live%20Demo-giwa--flashkit.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://giwa-flashkit.vercel.app)

FlashKit turns GIWA's **Flashblocks** (~200ms preconfirmations) into developer-friendly TypeScript & React APIs. Add instant transaction feedback, pending-state simulation, and OP Stack finality tracking to your dApps in minutes.

### 🌐 Live Portal & Interactive Tools
- 🚀 **Interactive Playground:** [giwa-flashkit.vercel.app/playground](https://giwa-flashkit.vercel.app/playground)
- 📖 **Developer Documentation:** [giwa-flashkit.vercel.app/docs](https://giwa-flashkit.vercel.app/docs)
- 🔬 **Transaction Inspector:** [giwa-flashkit.vercel.app/inspector](https://giwa-flashkit.vercel.app/inspector)
- ⚡ **Live RPC Benchmark:** [giwa-flashkit.vercel.app/benchmark](https://giwa-flashkit.vercel.app/benchmark)
- 🚰 **GIWA Sepolia Faucets:** [giwa-flashkit.vercel.app/faucets](https://giwa-flashkit.vercel.app/faucets)

---

## ⚡ The GIWA-Native Advantage

GIWA produces full canonical blocks roughly every **1 second**. Flashblocks expose an early preconfirmation view of transaction ordering in the **~200ms** range before standard blocks seal.

FlashKit orchestrates this dual-state model:

```text
User Wallet
    │ (Signs & Submits)
    ▼
FlashKit Engine
    ├── Flashblocks RPC (sepolia-rpc-flashblocks.giwa.io)
    │      ↓
    │   ⚡ PRECONFIRMED (~187 ms)  ──► Instant UI update (unlocked state)
    │
    └── Canonical RPC (sepolia-rpc.giwa.io)
           ↓
        📦 INCLUDED (~986 ms)      ──► Canonical Block Receipt
           ↓
        🔒 SAFE                    ──► Published to Ethereum L1
           ↓
        🏛️ FINALIZED               ──► L1 Finality Confirmed
```

> **Cardinal Rule:** *Preconfirmation is never finality.* FlashKit treats preconfirmation as an optimistic sequencer signal and canonical OP Stack blocks as the ultimate source of truth.

---

## 📦 Packages

| Package | Version | NPM | Description |
|---|---|---|---|
| [`@flashkit/core`](./packages/core) | `0.1.1` | [![npm](https://img.shields.io/npm/v/@flashkit/core.svg)](https://www.npmjs.com/package/@flashkit/core) | Framework-agnostic dual RPC engine, state machine, simulation & metrics |
| [`@flashkit/react`](./packages/react) | `0.1.1` | [![npm](https://img.shields.io/npm/v/@flashkit/react.svg)](https://www.npmjs.com/package/@flashkit/react) | React hooks (`useFlashTransaction`, `useFlashSimulation`, `useFlashStatus`) |
| [`@flashkit/ui`](./packages/ui) | `0.1.1` | [![npm](https://img.shields.io/npm/v/@flashkit/ui.svg)](https://www.npmjs.com/package/@flashkit/ui) | Developer UI components (`TransactionTimeline`, `FlashBadge`, `FlashLatency`) |
| [`@flashkit/testing`](./packages/testing) | `0.1.1` | [![npm](https://img.shields.io/npm/v/@flashkit/testing.svg)](https://www.npmjs.com/package/@flashkit/testing) | Mock RPC engine, 429 rate limit injection, delay simulation & fixtures |

---

## 🚀 Quickstart

### 1. Install

```bash
pnpm add @flashkit/core viem
# or for React:
pnpm add @flashkit/core @flashkit/react @flashkit/ui viem
```

### 2. Basic Core Usage

```typescript
import { createFlashKit } from '@flashkit/core'

// 1. Initialize for GIWA Sepolia
const flashkit = createFlashKit()

// 2. Track any transaction hash from your wallet
const tracker = flashkit.trackTransaction(hash)

tracker.on('preconfirmed', ({ state }) => {
  console.log(`⚡ Preconfirmed in ${state.timeline.preconfirmationMs}ms!`)
})

tracker.on('included', ({ state }) => {
  console.log(`📦 Included in Canonical Block #${state.blockNumber}`)
})

tracker.on('finalized', () => {
  console.log('🏛️ Transaction finalized on L1')
})
```

### 3. React Hook & UI Components

```tsx
import { useFlashTransaction } from '@flashkit/react'
import { TransactionTimeline, FlashLatency, FlashBadge } from '@flashkit/ui'

export function TransactionTrackerCard({ hash }: { hash: `0x${string}` }) {
  const { status, preconfirmationMs, state } = useFlashTransaction({ hash })

  return (
    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
      <div className="flex justify-between items-center mb-4">
        <span>Status: {status}</span>
        <FlashBadge type="preconfirmed" latencyMs={preconfirmationMs} />
      </div>

      <TransactionTimeline state={state} />
      <FlashLatency
        preconfirmationMs={state?.timeline.preconfirmationMs}
        inclusionMs={state?.timeline.inclusionMs}
        timeSavedMs={state?.timeline.timeSavedMs}
      />
    </div>
  )
}
```

---

## 🔬 Pre-Flight Simulation (`eth_simulateV1`)

Simulate transaction calls against the latest pending Flashblock state before requesting wallet signatures:

```typescript
const result = await flashkit.simulate({
  account: '0x...',
  to: '0x...',
  value: 1000000000000000n // 0.001 ETH
})

if (result.success) {
  console.log(`Estimated gas: ${result.gasUsed}`)
} else {
  console.error(`Simulation reverted: ${result.revertReason}`)
}
```

---

## 🛡️ Non-Negotiable Guarantees

1. **Zero Key Custody:** FlashKit never signs transactions, asks for seed phrases, or touches private keys.
2. **Graceful Degradation:** If the GIWA Flashblocks RPC experiences downtime or HTTP 429 rate limits, FlashKit degrades automatically to standard canonical RPC tracking. Transactions never fail because of preconfirmation downtime.
3. **Telemetry Off By Default:** No wallet addresses, IP addresses, or hashes are sent to external services.
4. **Self-Hosted Ready:** Easily pass custom RPC URLs to connect your self-hosted `op-reth` node (`FLASHBLOCKS_WEBSOCKET_URL`).

---

## 🌐 Network Reference (GIWA Sepolia)

- **Network:** GIWA Sepolia
- **Chain ID:** `91342`
- **Standard RPC:** `https://sepolia-rpc.giwa.io`
- **Flashblocks RPC:** `https://sepolia-rpc-flashblocks.giwa.io`
- **Blockscout Explorer:** `https://sepolia-explorer.giwa.io`

---

## 🚀 Live Onchain Testnet Proof (GIWA Sepolia)

FlashKit has been verified on live GIWA Sepolia (Chain ID: `91342`) with real funded onchain transactions:

- **Signer Address:** `0xb21C0800d76fB66154B9786F7daC4BBDE0534Cf9`
- **Verified Transaction Hash:** [`0x110556c14948c5836dfddf5a1b1c90c9016a920315ac5352a5fc4ed9c6601065`](https://sepolia-explorer.giwa.io/tx/0x110556c14948c5836dfddf5a1b1c90c9016a920315ac5352a5fc4ed9c6601065)
- **Canonical Block:** `#36338336`
- **Execution Telemetry:**
  - Sequencer Preconfirmation: `~952ms`
  - Canonical Block Inclusion: `1245ms`
  - Early-Signal Advantage: `+293ms`
  - Gas Used: `21,000` | Status: `success`

---

## 🧪 Testing & Verification

```bash
# Run unit & state machine tests
pnpm test

# Run Foundry contract tests
cd contracts && forge test

# Run live GIWA Sepolia health check (no funds required)
pnpm test:live

# Run Milestone 1 live read & simulation proof
pnpm test:proof

# Run real funded onchain transaction test
pnpm test:onchain

# Run CLI latency benchmark
pnpm benchmark
```

---

## 📄 Documentation

- [System Architecture](./ARCHITECTURE.md)
- [Transaction Lifecycle Guide](./TRANSACTION_LIFECYCLE.md)
- [Benchmark Methodology](./BENCHMARK_METHODOLOGY.md)
- [GIWA Compatibility Matrix](./docs/compatibility.md)
- [Security Policy](./SECURITY.md)

---

## 📜 License

Distributed under the [MIT License](./LICENSE).
