# FlashKit for GIWA — Project Specification & Roadmap

**Build instant onchain experiences on GIWA.**

**Status:** Planning / Pre-MVP  
**Target Network:** GIWA Sepolia  
**Project Type:** Open-source developer infrastructure / SDK / DevTools  
**Primary Stack:** TypeScript, viem, React, Next.js  
**Primary GIWA Feature:** Flashblocks  
**License recommendation:** MIT  
**Versioning:** Semantic Versioning  
**Initial target:** `v0.1.0`

---

# 1. Project Summary

FlashKit is an open-source developer toolkit for building responsive transaction experiences on GIWA.

GIWA already provides **Flashblocks**, which can expose an early transaction preconfirmation roughly around the 200 ms range instead of making an application wait for the next full block. GIWA currently targets roughly 1-second blocks; Flashblocks do not make blocks themselves faster, but expose an earlier view of transaction state.

FlashKit turns those low-level capabilities into developer-friendly APIs:

```text
Wallet
   ↓
Transaction submitted
   ↓
FlashKit
   ├── Flashblocks RPC
   │      ↓
   │   Preconfirmed ⚡
   │
   └── Standard GIWA RPC
          ↓
       Included
          ↓
         Safe
          ↓
       Finalized
```

The goal is not to create another wallet, explorer or RPC.

The goal is:

> **Provide the transaction experience layer for GIWA applications.**

A developer should be able to install FlashKit and add Flashblocks-aware transaction UX without implementing polling, lifecycle tracking, simulation, fallback handling and performance measurement from scratch.

---

# 2. Why FlashKit Should Exist

GIWA exposes the infrastructure, but applications still need to implement the application layer around it.

GIWA currently exposes a Flashblocks-aware RPC:

```text
https://sepolia-rpc-flashblocks.giwa.io
```

and a standard RPC:

```text
https://sepolia-rpc.giwa.io
```

Both are explicitly described as development/test endpoints and are rate-limited. GIWA recommends an external provider or a self-operated node for production workloads.

Flashblocks-aware RPC supports methods including:

```text
eth_call
eth_estimateGas
eth_getBalance
eth_getBlockByNumber
eth_getLogs
eth_getTransactionCount
eth_getTransactionByHash
eth_getTransactionReceipt
eth_simulateV1
```

Most state-oriented calls use the `pending` tag so that the latest Flashblock state can be read before a regular block is sealed.

Without FlashKit, every developer potentially has to rebuild:

```text
preconfirmation polling
receipt polling
pending-state handling
timeout handling
RPC fallback
rate-limit handling
simulation
transaction lifecycle
React state
latency measurement
reverted transaction handling
replacement handling
finality tracking
cleanup
telemetry
UI
```

FlashKit standardizes those patterns.

---

# 3. GIWA-Native Reasoning

FlashKit must never become a generic library with the GIWA logo attached afterward.

Its main value must depend on GIWA.

GIWA is an OP Stack Ethereum L2 with:

- EVM compatibility
- approximately 1-second blocks
- 60M block gas limit
- sequencer-based block production
- no public L2 mempool
- unsafe / safe / finalized block states
- Flashblocks preconfirmation support

FlashKit specifically uses these properties.

That makes the answer to:

> Why build this on GIWA?

very clear:

> FlashKit exists to expose GIWA Flashblocks, pending Flashblock state and GIWA transaction finality through developer-friendly APIs.

This also aligns closely with the GASOK evaluation criteria requiring a clear reason for using GIWA, originality, technical execution, UX quality and long-term sustainability. GASOK also has a dedicated **GIWA-Native Ideas** track.

---

# 4. Core Design Principle

FlashKit must distinguish between:

```text
PRECONFIRMED
```

and:

```text
FINALIZED
```

These are absolutely not the same thing.

GIWA describes Flashblocks as an **early transaction confirmation signal** before the normal block is produced.

Meanwhile GIWA's OP Stack finality model contains:

```text
unsafe
safe
finalized
```

An unsafe block has been produced by the sequencer but not yet published to Ethereum.

A safe block has been published to Ethereum.

A finalized block is associated with an Ethereum L1 block that has itself reached finality.

Therefore FlashKit should expose these concepts separately.

Recommended lifecycle:

```text
IDLE
 │
 ▼
SIGNING
 │
 ▼
SUBMITTED
 │
 ├──────────────► FAILED
 │
 ▼
PRECONFIRMED
 │
 ▼
INCLUDED
 │
 ▼
SAFE
 │
 ▼
FINALIZED
```

Additional exceptional states:

```text
REJECTED
REVERTED
REPLACED
DROPPED
TIMEOUT
RPC_ERROR
```

**Rule:** A UI must never represent `preconfirmed` as `finalized`.

---

# 5. GIWA Network Configuration

Initial FlashKit support must be restricted to:

```text
Network: GIWA Sepolia
Chain ID: 91342
Native Currency: ETH
```

Standard RPC:

```text
https://sepolia-rpc.giwa.io
```

Flashblocks RPC:

```text
https://sepolia-rpc-flashblocks.giwa.io
```

Explorer:

```text
https://sepolia-explorer.giwa.io
```

GIWA Mainnet is currently under development, so the SDK must not invent or hard-code unsupported mainnet configuration.

Mainnet support should be added only after GIWA publishes official parameters.

---

# 6. viem Compatibility

This is one of the most important technical decisions.

FlashKit should **not fork viem**.

Modern upstream viem already exports:

```ts
giwaSepolia
giwaSepoliaPreconf
```

`giwaSepolia` defines:

```text
Chain ID     91342
Block time   1000 ms
Standard RPC sepolia-rpc.giwa.io
Explorer     GIWA Blockscout
```

`giwaSepoliaPreconf` additionally defines:

```text
experimental_preconfirmationTime: 200
RPC: sepolia-rpc-flashblocks.giwa.io
```

Viem itself detects chains with `experimental_preconfirmationTime` and changes the default relevant block tag toward `pending`, which is exactly the state Flashblocks-aware applications need.

Therefore the architecture should be:

```text
viem
  ↓
GIWA chain definitions
  ↓
FlashKit Core
  ↓
FlashKit React
  ↓
Application
```

Not:

```text
fork viem
  ↓
modify viem
  ↓
maintain huge fork forever
```

The official `giwa-io/viem` fork remains useful as a GIWA ecosystem reference, but FlashKit should normally consume the current upstream viem package because upstream already contains GIWA and GIWA preconfirmation chain definitions.

---

# 7. Relationship With GIWA Official Repositories

Official organization:

```text
github.com/giwa-io
```

Relevant repositories include:

### `giwa-io/node`

Most important infrastructure reference.

It contains everything required to run a GIWA node.

GIWA's current node stack uses `op-reth`; `op-geth` support has been removed. Flashblocks mode can be enabled through `FLASHBLOCKS_WEBSOCKET_URL`.

FlashKit should follow the behavior exposed by this infrastructure rather than trying to reproduce it.

### `giwa-io/chain-operations`

Contains artifacts related to GIWA network deployments, upgrades and operational workflows.

Useful for checking future GIWA protocol changes.

### `giwa-io/dojang`

GIWA's attestation infrastructure based around trusted offchain facts issued onchain.

Not required for FlashKit v1.

Potential later integration:

```text
@flashkit/dojang
```

### `giwa-io/PoWFaucet`

Official organization also maintains its faucet implementation/fork.

Useful primarily as infrastructure reference.

---

# 8. What FlashKit Is Not

The first release should deliberately avoid scope creep.

FlashKit v1 is **not**:

```text
wallet
DEX
bridge
block explorer
indexer
account abstraction wallet
RPC provider
transaction relayer
custodial service
smart contract framework
analytics SaaS
Dojang replacement
```

And FlashKit does not need a proprietary smart contract to function.

That is an advantage.

FlashKit should work with:

```text
ERC-20 transfers
NFT minting
swaps
payments
games
counters
marketplaces
arbitrary contract writes
native ETH transfers
```

because it operates around transaction lifecycle rather than controlling application business logic.

---

# 9. Repository Architecture

Recommended monorepo:

```text
flashkit/
│
├── apps/
│   ├── web/
│   ├── docs/
│   ├── inspector/
│   └── playground/
│
├── packages/
│   ├── core/
│   ├── react/
│   ├── ui/
│   └── testing/
│
├── examples/
│   ├── nextjs-basic/
│   ├── payment/
│   ├── counter/
│   └── mint/
│
├── contracts/
│   ├── src/
│   ├── test/
│   └── script/
│
├── scripts/
│   ├── live-rpc-test.ts
│   ├── benchmark.ts
│   └── health-check.ts
│
├── .github/
│   └── workflows/
│
├── package.json
├── pnpm-workspace.yaml
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

Use:

```text
pnpm workspaces
Turborepo
TypeScript
Vitest
Playwright
Foundry
```

---

# 10. Package Architecture

## `@flashkit/core`

The most important package.

No React dependency.

Responsibilities:

```text
GIWA client configuration
Flashblocks RPC
canonical RPC
transaction tracking
preconfirmation detection
block inclusion tracking
safe/finalized tracking
eth_simulateV1
timeouts
fallback
retry policy
latency metrics
typed events
errors
```

Example:

```ts
import { createFlashKit } from '@flashkit/core'

const flashkit = createFlashKit({
  network: 'giwaSepolia'
})
```

Then:

```ts
const tracker = flashkit.trackTransaction(hash)
```

Possible event API:

```ts
tracker.on('submitted', ...)
tracker.on('preconfirmed', ...)
tracker.on('included', ...)
tracker.on('safe', ...)
tracker.on('finalized', ...)
tracker.on('failed', ...)
```

Promise-based alternative:

```ts
const result = await tracker.waitFor('preconfirmed')
```

---

# 11. Wallet Separation

FlashKit Core should preferably **not own private keys or sign transactions**.

Applications remain responsible for transaction creation:

```ts
const hash = await walletClient.writeContract(...)
```

FlashKit starts once there is a transaction hash:

```ts
const tracker = flashkit.trackTransaction(hash)
```

This provides several advantages:

```text
less security-sensitive code
wallet agnostic
wagmi compatible
ConnectKit compatible
MetaMask compatible
WalletConnect compatible
smart-account compatible later
easier auditing
```

The SDK should monitor transactions, not become a wallet.

---

# 12. `@flashkit/react`

React hooks around Core.

Primary API:

```tsx
const tx = useFlashTransaction({
  hash
})
```

Response:

```ts
{
  status,
  hash,

  submittedAt,
  preconfirmedAt,
  includedAt,
  safeAt,
  finalizedAt,

  preconfirmationMs,
  inclusionMs,
  timeSavedMs,

  receipt,
  error
}
```

Possible statuses:

```ts
type FlashTransactionStatus =
  | 'idle'
  | 'submitted'
  | 'preconfirmed'
  | 'included'
  | 'safe'
  | 'finalized'
  | 'reverted'
  | 'replaced'
  | 'timeout'
  | 'error'
```

Another hook:

```tsx
const result = useFlashSimulation({
  account,
  to,
  data,
  value
})
```

---

# 13. `@flashkit/ui`

Should remain optional.

Never force developers to use FlashKit's design system.

Components:

```tsx
<FlashStatus />
<TransactionTimeline />
<FlashLatency />
<FlashBadge />
<TransactionResult />
```

Example:

```tsx
<TransactionTimeline hash={hash} />
```

Visual result:

```text
TRANSACTION

● Submitted            0 ms
│
● Preconfirmed       187 ms ⚡
│
● Included           946 ms
│
○ Safe
│
○ Finalized
```

The developer should still be able to use only `@flashkit/core`.

---

# 14. Preconfirmation Detection

FlashKit maintains two separate clients.

```text
Flash Client
    ↓
GIWA Flashblocks RPC

Canonical Client
    ↓
GIWA Standard RPC
```

The Flash client queries the early/pending state.

The canonical client verifies normal block inclusion and subsequent chain state.

Conceptually:

```ts
flashClient.getTransactionReceipt(hash)
```

may expose the Flashblock/preconfirmation receipt before normal block sealing because GIWA documents `eth_getTransactionReceipt` as returning Flashblock-state receipt information.

Then:

```ts
canonicalClient.getTransactionReceipt(hash)
```

is used for ordinary inclusion.

This distinction should remain internal to FlashKit.

The application simply sees:

```text
PRECONFIRMED
INCLUDED
```

---

# 15. Simulation Engine

One of FlashKit's strongest features should be simulation.

GIWA's Flashblocks RPC supports:

```text
eth_simulateV1
```

against the latest Flashblock state.

FlashKit should expose a typed wrapper.

Example:

```ts
const simulation = await flashkit.simulate({
  from,
  to,
  data,
  value
})
```

Normalized response:

```ts
{
  success: true,
  gasUsed: 46218n,
  returnData: '0x...',
  calls: [],
  transfers: [],
  raw: {}
}
```

UI:

```text
TRANSACTION SIMULATION

✓ Expected to succeed

Gas Used
46,218

Simulation State
Latest Flashblock

[Send Transaction]
```

Important rule:

> Simulation is an estimate based on a specific state and must not be represented as a guarantee of transaction success.

---

# 16. Fallback Architecture

GIWA's public endpoints are rate-limited.

Therefore FlashKit must work when the Flashblocks endpoint fails.

Example:

```text
Flash RPC
   │
   ├── healthy → Flashblocks mode
   │
   └── unavailable
          ↓
Standard RPC
          ↓
Normal transaction mode
```

Result:

```ts
{
  flashblocksAvailable: false,
  degraded: true
}
```

UI can show:

```text
Standard confirmation mode
```

instead of breaking the application.

FlashKit should never make an otherwise valid GIWA application unusable solely because Flashblocks preconfirmation is unavailable.

---

# 17. RPC Provider Configuration

Default development configuration:

```ts
createFlashKit({
  network: 'giwaSepolia'
})
```

uses GIWA public endpoints.

Custom provider configuration:

```ts
createFlashKit({
  network: 'giwaSepolia',

  rpc: {
    canonical: process.env.GIWA_RPC,
    flashblocks: process.env.GIWA_FLASH_RPC
  }
})
```

This is necessary for production readiness.

GIWA explicitly recommends external node providers or running your own node for production workloads.

---

# 18. Self-Hosted Node Compatibility

FlashKit must not depend exclusively on `giwa.io` public RPC URLs.

A user running a Flashblocks-aware GIWA node should be able to provide their own RPC.

Official `giwa-io/node` supports optional Flashblocks configuration through:

```text
FLASHBLOCKS_WEBSOCKET_URL
```

and currently uses `op-reth` as the execution client.

Therefore FlashKit architecture should always treat RPC URLs as injectable configuration.

---

# 19. FlashKit Inspector

The Inspector is the public demonstration and debugging application.

Route:

```text
/inspector
```

Input:

```text
Transaction hash
```

Result:

```text
0x83...921

NETWORK
GIWA Sepolia

STATUS
FINALIZED

TIMELINE

Submitted          0 ms
Preconfirmed     192 ms
Included         974 ms
Safe              ...
Finalized         ...

TIME SAVED
782 ms
```

Additional technical information:

```text
Block
Gas Used
Effective Gas Price
From
To
Transaction Type
Status
Explorer Link
Flashblocks RPC Status
Canonical RPC Status
```

Inspector must clearly differentiate measured values from unavailable values.

Never manufacture a preconfirmation timestamp for an old transaction where FlashKit did not observe that event live.

---

# 20. Benchmark

Route:

```text
/benchmark
```

The benchmark demonstrates why Flashblocks matter.

Measure:

```text
submission → preconfirmation
submission → inclusion
difference
```

Output:

```text
FLASHBLOCKS

Median preconfirmation
196 ms

Median inclusion
1,024 ms

Median early-feedback advantage
828 ms
```

Also calculate:

```text
p50
p95
minimum
maximum
sample count
success rate
```

Do not cherry-pick a single fast transaction.

Recommended benchmark run:

```text
20-50 transactions
```

during development.

For public demonstrations, use appropriately tiny testnet interactions to avoid unnecessary faucet usage or network spam.

---

# 21. Benchmark Integrity Rules

Benchmark results must include:

```text
network
date/time
sample count
RPC provider
transaction type
median
p95
failure count
```

Avoid claims such as:

```text
"FlashKit makes GIWA 5x faster."
```

because FlashKit itself does not make the blockchain faster.

Correct wording:

> FlashKit exposes Flashblocks preconfirmation earlier to the application UI.

Likewise:

> Observed median early-feedback improvement during this benchmark: X ms.

---

# 22. Playground

Route:

```text
/playground
```

Initial demos:

```text
Counter
Payment
Mint
Simulation
```

## Counter

Simple contract:

```solidity
uint256 public count;

function increment() external {
    count++;
}
```

UI:

```text
COUNTER

14

[ INCREMENT ]

Preconfirmed     181 ms ⚡
Included         988 ms
```

## Payment

Send tiny GIWA Sepolia ETH.

```text
SEND TEST ETH

0.000001 ETH

[ SEND ]

Submitted
Preconfirmed
Included
```

## Mint

Very simple test NFT.

Purpose:

```text
show contract write lifecycle
```

Not to create an NFT product.

## Simulation

Prepare an interaction and show:

```text
simulation
→ wallet signature
→ submission
→ preconfirmation
→ inclusion
```

This will likely be the strongest overall demo.

---

# 23. Smart Contracts

Contracts should remain intentionally minimal.

Recommended:

```text
FlashCounter.sol
FlashMint.sol
```

Optional:

```text
FlashPaymentReceiver.sol
```

Do not build unnecessary protocol complexity.

Contracts should be:

```text
immutable where possible
no admin system unless actually required
no proxy
no fee
no token economics
no custody
no oracle
```

FlashKit's innovation is the SDK, not Solidity.

Use Foundry for contract development.

---

# 24. UI Direction

The project should look like developer infrastructure rather than a consumer crypto casino.

Recommended:

**Modular Typography + developer terminal/observability UI**

Visual system:

```text
near-black background
off-white surfaces
GIWA-inspired warm accent
large typography
monospace telemetry
thin grid lines
structured modules
minimal gradients
```

Avoid:

```text
neon Web3 gradients
rainbow effects
generic glassmorphism
floating crypto coins
fake terminal overload
```

Pages:

```text
/
Docs
Playground
Inspector
Benchmark
Examples
GitHub
```

Hero:

```text
FLASHKIT

Instant transaction UX
for GIWA.

PRECONFIRM  187 MS
INCLUDED    986 MS
SAVED       799 MS
```

The live telemetry itself becomes part of the visual identity.

---

# 25. Homepage Structure

Hero:

> **Build instant onchain experiences on GIWA.**

Subtitle:

> Preconfirmation, simulation and transaction lifecycle tooling powered by GIWA Flashblocks.

CTA:

```text
Get Started
Open Playground
GitHub
```

Then:

```text
LIVE FLASHBLOCK
```

followed by an interactive demonstration.

Then:

```text
ONE SDK
TWO RPC STATES
COMPLETE TRANSACTION LIFECYCLE
```

Then code.

Then benchmark.

Then ecosystem examples.

---

# 26. Developer Experience

Quickstart should be extremely short.

Install:

```bash
pnpm add @flashkit/core viem
```

Create:

```ts
import { createFlashKit } from '@flashkit/core'

export const flashkit = createFlashKit({
  network: 'giwaSepolia'
})
```

Send using the developer's existing wallet stack:

```ts
const hash = await walletClient.sendTransaction({
  to,
  value
})
```

Track:

```ts
const tx = flashkit.trackTransaction(hash)

tx.on('preconfirmed', ({ latency }) => {
  console.log(`Preconfirmed in ${latency}ms`)
})

tx.on('included', ({ latency }) => {
  console.log(`Included in ${latency}ms`)
})
```

This should be the entire basic integration.

---

# 27. React Example

```tsx
const {
  status,
  preconfirmationMs,
  inclusionMs
} = useFlashTransaction({
  hash
})
```

UI:

```tsx
<FlashStatus status={status} />

{preconfirmationMs && (
  <span>
    Preconfirmed in {preconfirmationMs}ms
  </span>
)}
```

FlashKit must not require developers to replace wagmi or their wallet stack.

It complements them.

---

# 28. Internal Core Modules

Recommended:

```text
packages/core/src/
│
├── client/
│   ├── createFlashKit.ts
│   ├── canonicalClient.ts
│   └── preconfClient.ts
│
├── transaction/
│   ├── tracker.ts
│   ├── lifecycle.ts
│   ├── receipt.ts
│   └── finality.ts
│
├── simulation/
│   ├── simulate.ts
│   └── normalize.ts
│
├── rpc/
│   ├── health.ts
│   ├── retry.ts
│   └── fallback.ts
│
├── metrics/
│   ├── latency.ts
│   └── benchmark.ts
│
├── errors/
│   └── errors.ts
│
└── types/
    └── index.ts
```

Keep network behavior isolated from React.

---

# 29. Error Model

Do not return raw generic JavaScript errors everywhere.

Example:

```ts
FlashKitError
FlashRpcUnavailableError
CanonicalRpcUnavailableError
FlashRateLimitError
TransactionTimeoutError
TransactionRevertedError
TransactionReplacedError
SimulationError
UnsupportedNetworkError
```

Every error should include:

```ts
{
  code,
  message,
  cause?,
  retryable,
  rpc?,
  transactionHash?
}
```

---

# 30. Rate Limiting

GIWA public endpoints are rate-limited.

FlashKit must avoid aggressive polling.

Recommended strategy:

```text
first ~2 seconds:
fast polling suitable for preconfirmation

after block inclusion:
slow polling

safe/finalized:
much slower polling
```

Actual intervals should be configurable and determined through live testing rather than hardcoded assumptions.

Also add:

```text
exponential backoff
429 handling
jitter
request deduplication
AbortController
```

---

# 31. Cache Rules

Flashblocks expose rapidly changing pending state.

Therefore pending state should not receive aggressive long-duration caching.

Recommended:

```text
preconfirmation data:
ephemeral

included receipt:
cacheable

safe/finalized:
strongly cacheable
```

Never persist a `preconfirmed` state and later restore it as though it remains authoritative after page reload.

On reload:

```text
query canonical chain again
```

---

# 32. Testing Philosophy

The project must not rely entirely on mocks.

Because FlashKit specifically targets unusual RPC behavior, the test strategy requires both:

```text
deterministic local tests
+
live GIWA Sepolia tests
```

---

# 33. Unit Tests

Use Vitest.

Required areas:

```text
lifecycle transitions
latency calculation
timeout
abort
retry
backoff
rate limit
RPC fallback
simulation normalization
receipt parsing
error normalization
configuration validation
```

Example:

```text
submitted → preconfirmed → included
```

must pass.

Invalid transition:

```text
finalized → submitted
```

must be rejected.

---

# 34. State Machine Tests

Test every valid transition.

Examples:

```text
submitted → preconfirmed
submitted → included
submitted → timeout

preconfirmed → included
preconfirmed → reverted

included → safe
safe → finalized
```

Notice:

```text
submitted → included
```

must remain valid.

Flashblocks may be unavailable or preconfirmation may simply not be observed.

The transaction must still succeed normally.

---

# 35. RPC Mock Tests

Mock responses for:

```text
200 success
429 rate limit
500
timeout
invalid JSON-RPC response
null receipt
reverted receipt
delayed receipt
```

FlashKit should fail gracefully.

---

# 36. Live GIWA RPC Tests

Script:

```text
pnpm test:live
```

Should verify:

```text
chain ID = 91342
standard RPC reachable
Flashblocks RPC reachable
latest block available
pending block available
eth_call works
eth_estimateGas works
eth_simulateV1 works
explorer reachable where appropriate
```

No private key required for read-only smoke tests.

---

# 37. Live Transaction Test

Separate command:

```text
pnpm test:live:write
```

Requires:

```text
TEST_PRIVATE_KEY
```

Test sequence:

```text
1. Verify chain
2. Verify balance
3. Send tiny test transaction
4. Record submission timestamp
5. Watch Flashblocks RPC
6. Detect preconfirmation
7. Detect canonical inclusion
8. Compare timestamps
9. Verify receipt status
10. Print report
```

Output:

```text
GIWA Sepolia Live Test

RPC                  PASS
Flash RPC            PASS
Transaction          PASS

Preconfirmation      194 ms
Inclusion            972 ms
Early signal         778 ms
```

Never run these tests automatically on every PR if they spend testnet ETH.

---

# 38. Contract Tests

Foundry:

```text
forge test
```

Tests:

```text
Counter increments correctly
events emitted
mint behaves correctly
reverts behave correctly
no unexpected permissions
```

Add:

```text
fuzz tests
```

where appropriate.

There is no reason for overly complicated invariant suites for a trivial demo contract, but core behavior should still be thoroughly tested.

---

# 39. E2E Tests

Playwright.

Test:

```text
homepage loads
network status visible
Inspector validates hash
Playground loads
simulation displays
wallet disconnected state
wrong network state
Flash RPC unavailable state
standard fallback state
explorer links
mobile layout
```

Wallet-specific E2E may use a controlled test environment later.

---

# 40. Failure Injection Tests

Very important for FlashKit.

Artificially simulate:

```text
Flash RPC offline
Standard RPC offline
Flash RPC 429
Standard RPC 429
5-second latency
incorrect chain ID
transaction reverted
transaction never found
transaction included before preconfirmation observed
browser tab hidden
network disconnected
request aborted
```

Expected behavior must be documented.

---

# 41. Preconfirmation Accuracy Tests

Test at least:

```text
50 live transactions
```

during development.

Measure whether:

```text
preconfirmed transaction
```

subsequently appears in canonical inclusion.

Do not frame the result as an immutable protocol guarantee.

Record it as observed test data.

---

# 42. Performance Tests

Measure SDK overhead separately from network latency.

FlashKit should add negligible client overhead.

Measure:

```text
RPC raw latency
FlashKit processing latency
React update latency
```

Network timing must not be confused with FlashKit processing time.

---

# 43. Testnet ETH

GIWA provides testnet ETH faucets.

Official docs currently indicate the GIWA faucet provides up to `0.005 ETH` every 24 hours, while the listed Nodit faucet provides `0.01 ETH` every 24 hours.

Automated tests should use tiny values and never intentionally consume testnet resources unnecessarily.

---

# 44. Security Rules

FlashKit must never:

```text
request seed phrases
store private keys
send private keys to an API
log private keys
log signatures unnecessarily
silently modify transaction calldata
silently redirect transactions
claim a preconfirmation is finality
```

Public demo contracts should clearly state:

```text
TESTNET ONLY
NO VALUE
```

The official GIWA testnet terms specify that test tokens are solely for testing/experimentation and have no economic value.

---

# 45. Telemetry & Privacy

Core SDK:

```text
telemetry OFF by default
```

Do not transmit:

```text
wallet addresses
transaction hashes
RPC URLs
application identifiers
```

without explicit developer configuration.

Benchmark web app may collect anonymous measurements only if clearly disclosed.

Open-source developers should be able to use FlashKit entirely without FlashKit-operated infrastructure.

---

# 46. CI/CD

GitHub Actions:

```text
lint
typecheck
unit
build
contract-test
e2e
package-size
```

PR pipeline:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
forge test
```

Live GIWA testing:

```text
manual
nightly
release candidate
```

rather than every commit.

---

# 47. Package Release Rules

Release initially as:

```text
0.1.0
```

Potential packages:

```text
@flashkit/core
@flashkit/react
@flashkit/ui
@flashkit/testing
```

Before publishing, verify the actual npm namespace/package availability.

Use:

```text
changesets
semantic versioning
generated changelog
```

Do not introduce breaking changes in patch releases.

---

# 48. Documentation

Docs must contain:

```text
Introduction
Why Flashblocks
Quickstart
Core Client
React
Transaction Lifecycle
Simulation
Fallback
RPC Providers
Inspector
Testing
Examples
Error Handling
Security
FAQ
GIWA Resources
```

Very important page:

```text
/transaction-lifecycle
```

It should explain:

```text
preconfirmed ≠ included ≠ safe ≠ finalized
```

This can become one of the project's most useful educational resources.

---

# 49. Example Applications

Provide real integration repositories or examples.

### Basic Next.js

Shows:

```text
connect wallet
send transaction
track lifecycle
```

### Payment

Shows:

```text
pay
preconfirm
receipt
```

### Counter

Shows contract interaction.

### Mint

Shows arbitrary write transaction.

These examples should consume the exact same public SDK distributed through npm.

Do not maintain demo-only hidden code paths.

---

# 50. MVP Definition

The MVP is complete when all of these work:

```text
@flashkit/core
GIWA Sepolia configuration
Flashblocks client
canonical client
transaction lifecycle
preconfirmation detection
normal inclusion detection
fallback behavior
latency metrics
eth_simulateV1 wrapper
React hook
Inspector
Counter Playground
basic benchmark
docs
live test script
GitHub CI
```

Do **not** wait for:

```text
Dojang
up.id
account abstraction
full dashboard
analytics backend
multi-chain support
mainnet
```

before releasing.

---

# 51. Phase 0 — Foundation

### Goal

Verify GIWA behavior before building abstractions.

### Work

```text
Create repository
Set pnpm/Turborepo
Install current viem
Verify giwaSepolia
Verify giwaSepoliaPreconf
Test both RPC endpoints
Test pending state
Test eth_getTransactionReceipt
Test eth_simulateV1
Deploy simple Counter
Record first benchmark
```

### Acceptance Criteria

A script must successfully print:

```text
GIWA chain ID
latest block
pending block
Flashblocks RPC status
simulation result
transaction preconfirmation
normal inclusion
```

Do not start designing fancy UI before this works.

---

# 52. Phase 1 — Core SDK

### Build

```text
createFlashKit()
dual RPC clients
trackTransaction()
transaction state machine
timeout
abort
fallback
error system
latency metrics
```

### Tests

```text
unit
state machine
mock RPC
live read
live write
```

### Exit Criteria

This must work entirely from Node.js without React.

---

# 53. Phase 2 — Simulation

Build typed:

```text
simulate()
```

around:

```text
eth_simulateV1
```

Normalize result.

Add:

```text
success
gas used
return data
transfer traces where available
raw response
```

Tests:

```text
successful call
reverted call
invalid calldata
rate limit
Flash RPC unavailable
```

---

# 54. Phase 3 — React

Build:

```text
useFlashTransaction()
useFlashSimulation()
useFlashStatus()
```

Requirements:

```text
SSR-safe
cleanup-safe
AbortController
no duplicate polling
works with Next.js App Router
wallet-library agnostic
```

---

# 55. Phase 4 — Inspector

Build polished transaction debugging application.

Minimum:

```text
hash lookup
status
timeline
latency
receipt
Blockscout
RPC health
```

Inspector becomes the first public demonstration.

---

# 56. Phase 5 — Playground

Deploy:

```text
Counter
Payment
Simulation
Mint
```

All interactions must use published/local FlashKit package.

No duplicated tracking implementation.

---

# 57. Phase 6 — Benchmark

Create proper benchmark runner.

Collect:

```text
p50
p95
min
max
success rate
preconfirmation
inclusion
difference
```

Publish methodology.

This is important because FlashKit should demonstrate measurable GIWA behavior rather than relying on marketing claims.

---

# 58. Phase 7 — Documentation & Open Source Release

Create:

```text
README
docs
examples
CONTRIBUTING
SECURITY
LICENSE
CHANGELOG
```

Publish initial package.

Tag:

```text
v0.1.0
```

---

# 59. Phase 8 — GIWA Team Outreach

Only after there is a working product.

Prepare:

```text
GitHub repo
live URL
npm package
60-90 second demo
benchmark
technical architecture
```

Then share with:

```text
@GIWA_by_Upbit
support@giwa.io
```

Message positioning:

> We're building FlashKit, an open-source transaction experience toolkit for GIWA Flashblocks.

Ask primarily for:

```text
technical feedback
Flashblocks best practices
mainnet compatibility guidance
recommended production RPC approach
future preconfirmation roadmap
```

rather than beginning with a funding request.

---

# 60. GASOK Readiness

The current GASOK application period is closed, but FlashKit should be kept ready for future GIWA builder opportunities.

GASOK evaluates:

```text
GIWA chain fit
originality
feasibility
market demand
team execution ability
GIWA Wallet integration potential
```

Later phases additionally evaluate:

```text
actual implementation
technical completeness
UI/UX
initial user adoption
long-term sustainability
```

FlashKit should therefore track:

```text
npm downloads
GitHub stars
developers integrating it
transactions tracked
playground usage
benchmark runs
external projects using FlashKit
```

These become evidence of adoption.

---

# 61. Future V2

Only after Core is stable:

```text
WebSocket transport
custom RPC providers
GIWA Mainnet
Dojang integration
up.id support
ERC-4337
smart account lifecycle
provider health dashboard
developer API keys
transaction tracing
framework adapters
Vue/Svelte adapters
```

Potential:

```text
@flashkit/dojang
@flashkit/account-abstraction
```

But these should never block v1.

---

# 62. Potential GIWA Wallet Integration

GASOK explicitly considers whether a project can naturally fit into GIWA Wallet.

FlashKit has a strong theoretical path here.

Possible use:

```text
Send
  ↓
Submitted
  ↓
⚡ Preconfirmed
  ↓
Included
```

FlashKit UI primitives could eventually serve wallet transaction feedback.

But this should remain an integration opportunity rather than pretending FlashKit has official GIWA Wallet support before such support exists.

---

# 63. Success Metrics

Technical:

```text
>95% successful Flashblocks detection in controlled tests
zero false "finalized" UI states
fallback works when Flash RPC unavailable
tree-shakeable core
minimal SDK overhead
```

Developer:

```text
integration <10 minutes
basic example <20 lines
clear TypeScript inference
no custom backend required
```

Ecosystem:

```text
external integrations
GitHub adoption
npm downloads
GIWA team feedback
community contributions
```

---

# 64. Core Project Rules

These rules should be treated as non-negotiable.

### Rule 1

**Preconfirmation is never finality.**

### Rule 2

**Canonical chain data remains authoritative.**

### Rule 3

**Flashblocks failure must not break standard GIWA transactions.**

### Rule 4

**FlashKit must not custody user assets or private keys.**

### Rule 5

**Core must remain framework agnostic.**

### Rule 6

**React is an adapter around Core, not the source of business logic.**

### Rule 7

**Do not duplicate functionality already correctly implemented in viem.**

### Rule 8

**Use official GIWA chain configuration whenever possible.**

### Rule 9

**Never hard-code unofficial GIWA Mainnet parameters.**

### Rule 10

**Benchmark real behavior; never invent speed numbers.**

### Rule 11

**Public GIWA RPC is development infrastructure, not assumed production infrastructure.**

### Rule 12

**Every feature needs a failure path and a test.**

---

# 65. Recommended Build Order

The exact implementation order should be:

```text
01 Research / live RPC proof
        ↓
02 Minimal Counter contract
        ↓
03 Flashblocks vs standard RPC script
        ↓
04 Transaction state machine
        ↓
05 @flashkit/core
        ↓
06 Live integration tests
        ↓
07 eth_simulateV1
        ↓
08 @flashkit/react
        ↓
09 Inspector
        ↓
10 Playground
        ↓
11 Benchmark dashboard
        ↓
12 Docs
        ↓
13 npm release
        ↓
14 Demo video
        ↓
15 GIWA outreach
```

Do not reverse this order and build the website first.

The first milestone must prove that our Flashblocks assumptions work against the actual GIWA network.

---

# 66. First Development Milestone

The very first executable prototype should be one TypeScript file:

```text
scripts/proof.ts
```

It should:

```text
connect standard RPC
connect Flashblocks RPC
confirm chain ID 91342
read latest state
read pending state
send a test transaction
timestamp submission
detect Flashblock receipt
timestamp preconfirmation
detect standard receipt
timestamp inclusion
print difference
```

Expected output:

```text
FLASHKIT GIWA PROOF

Network        GIWA Sepolia
Chain          91342

Transaction    0x...

Submitted       0 ms
Preconfirmed  193 ms
Included      991 ms

Early Signal  798 ms

PASS
```

Only once this works consistently should we create the SDK abstraction.

---

# 67. Final Product Positioning

Do not position FlashKit as:

> Another GIWA devtool.

Do not position it as:

> Faster blockchain.

Do not claim:

> Instant finality.

Position it as:

> **FlashKit is the transaction experience layer for GIWA.**

Long form:

> FlashKit is an open-source TypeScript toolkit that turns GIWA Flashblocks into production-friendly developer APIs for transaction preconfirmation, pending-state simulation, lifecycle tracking, fallback and latency measurement.

Developer version:

> **Build instant-feeling GIWA apps without rebuilding transaction infrastructure.**

Technical version:

> **Preconfirmation + simulation + canonical lifecycle tracking for GIWA.**

---

# 68. Definition of Done for v0.1.0

FlashKit v0.1.0 is considered ready when:

```text
✓ GIWA Sepolia supported
✓ current upstream viem used
✓ standard + preconf clients separated
✓ preconfirmation tracked
✓ canonical inclusion tracked
✓ safe/finalized model documented
✓ eth_simulateV1 supported
✓ fallback tested
✓ 429 tested
✓ transaction revert tested
✓ live GIWA test exists
✓ React hook exists
✓ Inspector deployed
✓ Playground deployed
✓ benchmark methodology documented
✓ Counter demo deployed
✓ README complete
✓ SECURITY.md complete
✓ package published
✓ CI green
✓ no private-key custody
✓ no misleading finality claims
```

At that point the project is no longer merely a hackathon prototype.

It becomes a legitimate GIWA-focused open-source developer tool.

---

# Official Technical References

GIWA documentation:

- GIWA architecture and overview
- Connect to GIWA
- Flashblocks
- Ethereum vs GIWA differences
- GIWA contracts
- Node operator documentation
- Faucet documentation

Official GIWA GitHub organization:

```text
github.com/giwa-io
```

Most relevant repositories:

```text
giwa-io/node
giwa-io/chain-operations
giwa-io/dojang
giwa-io/viem
giwa-io/PoWFaucet
```

Upstream dependency:

```text
wevm/viem
```

The current upstream viem GIWA definitions are particularly important because they already include both standard `giwaSepolia` and preconfirmation-aware `giwaSepoliaPreconf`.

---

# Project Principle

> GIWA provides Flashblocks.

> viem provides Ethereum primitives.

> FlashKit connects those primitives to actual application UX.

That is the product.
