# FlashKit — GIWA Official Sources, Compatibility Rules & Final Additions

**Document type:** Technical supplement  
**Related project:** FlashKit for GIWA  
**Purpose:** Official GIWA source mapping, compatibility requirements, implementation notes and final project rules  
**Verification date:** 17 September 2026

---

# 1. Purpose of This Document

This document supplements the main FlashKit project specification.

The main project document defines:

- product architecture,
- SDK structure,
- transaction lifecycle,
- React integration,
- Inspector,
- Playground,
- benchmark system,
- testing,
- roadmap.

This supplementary document defines:

1. which official GIWA resources must be treated as source of truth,
2. which GIWA repositories should be monitored,
3. which assumptions must be verified against the live testnet,
4. which parts of FlashKit depend directly on GIWA,
5. which behavior must never be hardcoded without an official source,
6. current GIWA network status,
7. compatibility rules for viem and OP Stack,
8. final requirements before publishing FlashKit.

---

# 2. Current GIWA Status

As of 17 September 2026, FlashKit should target **GIWA Sepolia only**.

Official GIWA documentation currently lists:

```text
Network       GIWA Sepolia
Chain ID      91342
Currency      ETH
Block time    ~1 second
```

GIWA Mainnet is still marked as under development. Therefore FlashKit must not invent mainnet RPC URLs, chain IDs, explorer addresses or contract addresses.

Current development endpoints are:

```text
Standard RPC
GIWA Sepolia public RPC

Flashblocks RPC
GIWA Sepolia Flashblocks-aware RPC

Explorer
GIWA Sepolia Blockscout
```

Both official RPC endpoints are explicitly described as rate-limited development/testing infrastructure and should not be assumed to be production RPC infrastructure.

---

# 3. Source-of-Truth Hierarchy

When different sources disagree, FlashKit development should use the following priority.

```text
1. Current GIWA Documentation
        ↓
2. Current GIWA official GitHub repositories
        ↓
3. Current upstream viem implementation
        ↓
4. OP Stack documentation
        ↓
5. FlashKit live GIWA Sepolia tests
        ↓
6. Community examples
```

Community applications are useful for understanding patterns but must not define protocol behavior.

Never copy a network constant, contract address or transaction rule from a community project when an official GIWA source exists.

---

# 4. Official GIWA Documentation

## 4.1 Connect to GIWA

**Source of truth for:**

```text
Chain ID
native currency
canonical RPC
Flashblocks RPC
explorer
mainnet/testnet availability
```

Current official configuration confirms GIWA Sepolia as Chain ID `91342`, using ETH, with separate canonical and Flashblocks-aware RPC endpoints. GIWA Mainnet remains under development.

FlashKit files affected:

```text
packages/core/src/chains/
packages/core/src/client/
scripts/health-check.ts
scripts/proof.ts
apps/inspector/
```

### Rule

Do not duplicate network configuration unnecessarily if the active viem version already provides the correct GIWA definition.

---

# 5. Flashblocks Documentation

This is the **most important external source for FlashKit**.

GIWA describes Flashblocks as an early transaction confirmation mechanism. It can provide a preconfirmation signal roughly within the ~200 ms range rather than requiring an application to wait for the approximately one-second GIWA block interval. It does **not** make the actual block itself finalize faster.

This distinction must appear throughout FlashKit.

Correct:

```text
Preconfirmed
```

Incorrect:

```text
Instantly finalized
```

Correct:

```text
Early transaction feedback
```

Incorrect:

```text
200 ms finality
```

FlashKit marketing, UI, README and documentation must preserve this distinction.

---

# 6. Flashblocks Supported RPC Methods

Official GIWA documentation currently identifies Flashblocks-aware behavior for methods including:

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

Most state queries use the `pending` block state to access the most recent Flashblock state.

This should directly determine FlashKit feature scope.

### FlashKit v0.1 should primarily depend on

```text
eth_getTransactionReceipt
eth_getTransactionByHash
eth_getBlockByNumber
eth_call
eth_estimateGas
eth_simulateV1
```

Other supported methods can be exposed later if there is a real developer use case.

---

# 7. Important Pending-State Rule

Flashblock state is not equivalent to canonical finalized state.

A developer may query:

```text
pending
```

and receive a state reflecting transactions inside the current Flashblock.

That state can evolve before the normal block is sealed.

Therefore FlashKit must maintain two conceptual data sources:

```text
PRECONFIRMATION SOURCE
Flashblocks-aware RPC
        ↓
pending / Flashblock state


CANONICAL SOURCE
Standard GIWA RPC
        ↓
included / safe / finalized chain state
```

FlashKit should never allow pending-state data to permanently overwrite canonical data.

---

# 8. Finality Model

GIWA is built using the OP Stack.

Official GIWA documentation distinguishes:

```text
unsafe
safe
finalized
```

An `unsafe` block has been produced by the sequencer.

A `safe` block has been published to Ethereum.

A `finalized` block corresponds to an L1 state that has itself reached finality.

FlashKit application-level lifecycle should therefore remain:

```text
SUBMITTED
    ↓
PRECONFIRMED
    ↓
INCLUDED
    ↓
SAFE
    ↓
FINALIZED
```

These states describe different levels of confidence and must remain different in both API and UI.

---

# 9. No Public Mempool Assumption

GIWA does not expose a normal Ethereum-style public mempool.

Its sequencer controls pending transaction access.

Therefore FlashKit must not build features that assume:

```text
public mempool inspection
public pending transaction feed
traditional mempool watchers
Ethereum-style pending-tx propagation
```

Flashblocks are the proper GIWA-native mechanism for the early transaction state FlashKit needs.

---

# 10. Current viem Compatibility

FlashKit should use **upstream viem rather than maintaining a custom viem fork** unless there is a concrete missing capability.

Current upstream viem already contains:

```ts
giwaSepolia
giwaSepoliaPreconf
```

The standard definition includes:

```text
Chain ID        91342
Block time      1000 ms
GIWA RPC
GIWA Blockscout
OP Stack chain configuration
```

The preconfirmation variant adds:

```ts
experimental_preconfirmationTime: 200
```

and uses the GIWA Flashblocks RPC.

This means FlashKit architecture should be:

```text
viem
  ↓
GIWA chain definition
  ↓
FlashKit transaction lifecycle
  ↓
React / UI integrations
```

not:

```text
FlashKit custom Ethereum client
```

---

# 11. Important viem Behavior

Current viem client behavior checks whether:

```ts
chain.experimental_preconfirmationTime
```

exists.

If the chain supports this mechanism, viem can default relevant block behavior toward:

```text
pending
```

rather than only `latest`.

Therefore before manually implementing Flashblocks-related overrides, FlashKit developers must inspect current viem behavior.

### Rule

Do not rebuild functionality that upstream viem already implements correctly.

FlashKit's purpose is lifecycle orchestration and developer experience, not replacing viem.

---

# 12. GIWA Official GitHub Organization

Official GIWA repositories must be monitored throughout development.

Primary organization:

```text
giwa-io
```

Relevant repositories include:

```text
node
viem
chain-operations
dojang
PoWFaucet
```

The project should maintain a small compatibility file such as:

```text
docs/giwa-compatibility.md
```

recording which GIWA versions and assumptions were last verified.

---

# 13. `giwa-io/node`

This is the most important official repository after the documentation.

The repository contains the infrastructure required to operate a GIWA node.

Current important facts:

```text
GIWA uses OP Stack.
GIWA Sepolia is supported.
GIWA Mainnet is still under development.
The execution client is op-reth.
op-geth is no longer supported.
Flashblocks support can be enabled for a node.
```

The official node repository currently exposes a `FLASHBLOCKS_WEBSOCKET_URL` configuration option for enabling Flashblocks behavior.

### FlashKit implication

FlashKit must allow custom providers.

The SDK must not require the official public endpoint.

Example:

```ts
createFlashKit({
  chain: giwaSepolia,

  rpc: {
    canonical: process.env.GIWA_RPC_URL,
    preconfirmation: process.env.GIWA_FLASHBLOCKS_RPC_URL
  }
})
```

This allows:

```text
GIWA public RPC
third-party provider
self-hosted GIWA node
future production provider
```

without changing application code.

---

# 14. Node Compatibility Rule

FlashKit is an application SDK.

It must not assume a specific deployment topology such as:

```text
GIWA public node only
```

Instead:

```text
FlashKit
   ↓
Provider interface
   ├── GIWA public RPC
   ├── provider RPC
   └── self-hosted node
```

This is necessary for future production usage.

---

# 15. `giwa-io/chain-operations`

This repository should be treated as an ecosystem monitoring source.

FlashKit itself does not need to depend on it directly.

Its main purposes for FlashKit are:

```text
network upgrade awareness
deployment changes
protocol configuration changes
future mainnet readiness
```

Before every FlashKit major release, developers should inspect:

```text
GIWA docs
GIWA notices
node releases
chain-operations changes
```

---

# 16. GIWA Protocol Upgrade Monitoring

FlashKit must include protocol-upgrade checking in its maintenance process.

GIWA has already applied OP Stack upgrades to its testnet.

Most such upgrades may not directly affect FlashKit.

However, FlashKit is sensitive to:

```text
RPC changes
block-header changes
transaction receipt changes
pending-state semantics
Flashblocks behavior
chain configuration
execution-client changes
```

Therefore each GIWA upgrade must trigger a compatibility review.

---

# 17. Compatibility Checklist After GIWA Upgrade

Run:

```text
pnpm test:live
pnpm test:live:write
pnpm benchmark:smoke
```

Validate:

```text
chain ID
latest block
pending block
Flashblocks receipt
canonical receipt
eth_call pending
eth_estimateGas pending
eth_simulateV1
safe block
finalized block
Blockscout links
```

If one fails:

```text
DO NOT silently update SDK behavior.
```

First identify whether:

```text
GIWA changed
viem changed
provider changed
FlashKit is wrong
```

---

# 18. `giwa-io/dojang`

Dojang is GIWA's attestation infrastructure.

Dojang is **not required for FlashKit v0.1**.

Possible later package:

```text
@flashkit/dojang
```

Possible future use:

```text
verified merchant
verified user
identity-gated transaction
attestation-aware simulation
verified payment demo
```

Do not add this before the transaction SDK is stable.

---

# 19. Faucet Source

GIWA currently provides Sepolia ETH for development.

Official documentation currently states:

```text
GIWA Faucet
up to 0.005 ETH / 24h

Nodit Faucet
0.01 ETH / 24h
```

for GIWA Sepolia testing.

### FlashKit rule

Benchmark and automated integration tests must conserve faucet resources.

Never design:

```text
hundreds of unnecessary funded writes
continuous transaction spam
```

for a demo benchmark.

Read-only RPC tests should remain the default CI behavior.

Funded write tests should run:

```text
manually
nightly when required
before releases
```

---

# 20. FlashKit Proof-of-Concept Must Come First

Before implementing the full SDK, create:

```text
scripts/proof.ts
```

This script must use the actual GIWA network and verify:

```text
1. Connect canonical RPC.
2. Connect Flashblocks RPC.
3. Confirm chain ID 91342.
4. Read latest block.
5. Read pending block.
6. Send one minimal transaction.
7. Record submission timestamp.
8. Observe preconfirmation.
9. Record preconfirmation timestamp.
10. Observe canonical inclusion.
11. Record inclusion timestamp.
12. Compare results.
```

No UI should be considered proof that FlashKit works.

The proof script is the initial acceptance test.

---

# 21. Timestamp Integrity

One major technical rule:

FlashKit cannot reconstruct a true historical preconfirmation latency for an arbitrary old transaction.

If the Inspector receives:

```text
0xOldTransactionHash
```

after that transaction has already been included, it may know:

```text
included block
receipt
canonical status
finality
```

but it did not necessarily observe the original preconfirmation event.

Therefore it must not invent:

```text
Preconfirmed in 188 ms
```

for historical transactions.

Use:

```text
Preconfirmation timing unavailable
```

unless FlashKit actually observed or has a reliable timestamp source for that event.

---

# 22. Benchmark Rules

FlashKit's benchmark measures **application feedback latency**, not blockchain finality acceleration.

Correct metric:

```text
submitted → preconfirmed

submitted → canonical inclusion

difference
```

Recommended report:

```text
sample count
p50 preconfirmation
p95 preconfirmation
p50 inclusion
p95 inclusion
failure rate
RPC provider
network
test date
transaction type
```

Do not publish a single fastest measurement as representative performance.

---

# 23. Required Terminology

Use:

```text
preconfirmation
early confirmation signal
Flashblock state
included
safe
finalized
canonical receipt
pending state
```

Avoid:

```text
instant finality
guaranteed 200 ms transaction
finalized by Flashblocks
zero-latency transaction
```

This is both technically more accurate and more aligned with GIWA's own documentation.

---

# 24. Flashblocks Degradation

Flashblocks must remain an optional acceleration layer.

Required behavior:

```text
Flashblocks available
        ↓
PRECONFIRMED
        ↓
INCLUDED


Flashblocks unavailable
        ↓
SUBMITTED
        ↓
INCLUDED
```

The second flow is still a valid transaction.

This means:

```text
Flashblocks outage ≠ transaction failure
```

The SDK should expose:

```ts
{
  flashblocksAvailable: false,
  degradedMode: true
}
```

without blocking normal GIWA interactions.

---

# 25. Public RPC Rules

Official GIWA endpoints are rate-limited and documented for development/testing.

Therefore:

```text
development:
official GIWA RPC is acceptable

production:
custom provider configuration required/recommended
```

FlashKit README must mention this clearly.

Never present the official public endpoint as an unlimited production SLA.

---

# 26. No Backend Requirement

FlashKit Core should be able to operate completely client-side or inside a developer's own environment.

Core architecture must not require:

```text
FlashKit API key
FlashKit account
FlashKit centralized backend
FlashKit database
```

for normal transaction tracking.

Optional hosted analytics may exist later, but the SDK's fundamental capabilities must remain open and self-contained.

---

# 27. Privacy Requirement

Core telemetry:

```text
OFF by default
```

Do not automatically send:

```text
wallet addresses
transaction hashes
RPC providers
application domain
IP-linked usage telemetry
```

to FlashKit servers.

If telemetry is introduced later:

```text
explicit developer opt-in
clear documentation
data minimization
```

must be required.

---

# 28. Security Boundary

FlashKit should avoid becoming a signing or custody library.

Recommended:

```text
wagmi / viem / wallet
        ↓
transaction signed
        ↓
hash returned
        ↓
FlashKit starts tracking
```

FlashKit must never require:

```text
mnemonic
seed phrase
private key
```

from end users.

Test scripts using a development private key must load it locally through environment configuration and never expose it in frontend bundles, logs or repositories.

---

# 29. Mainnet Rule

Until GIWA publishes official Mainnet configuration:

```ts
network: 'giwaMainnet'
```

should not silently exist with guessed values.

Possible behavior:

```ts
throw new UnsupportedNetworkError(
  'GIWA Mainnet configuration is not officially available.'
)
```

or simply omit it entirely.

---

# 30. GASOK Alignment

GASOK applications are currently closed.

As of September 2026, the program roadmap places selected projects in the **Productize** phase running August–November 2026.

Its documented evaluation criteria include:

```text
GIWA chain fit
originality
feasibility
market demand
team execution
GIWA Wallet integration potential
technical completeness
UI/UX
initial adoption
long-term sustainability
```

FlashKit should intentionally gather evidence for these criteria.

---

# 31. FlashKit GASOK Evidence Folder

Recommended repository folder:

```text
evidence/
│
├── benchmarks/
├── deployments/
├── live-tests/
├── screenshots/
├── integrations/
└── releases/
```

Keep measurable proof such as:

```text
live benchmark results
GIWA Sepolia transaction hashes
published npm versions
external integration examples
GitHub contributors
SDK download data
demo recordings
```

This can later support:

```text
GASOK
GIWA grants
technical reviews
ecosystem applications
hackathon submissions
```

without reconstructing evidence afterwards.

---

# 32. Recommended Repository Documentation

Add:

```text
README.md
PROJECT_SPEC.md
GIWA_REFERENCES.md
ARCHITECTURE.md
TRANSACTION_LIFECYCLE.md
BENCHMARK_METHODOLOGY.md
SECURITY.md
CONTRIBUTING.md
CHANGELOG.md
```

This document can become:

```text
GIWA_REFERENCES.md
```

---

# 33. README Source Statement

Recommended README section:

```md
## Built for GIWA

FlashKit is designed around GIWA's Flashblocks-aware
transaction model.

GIWA provides the network and preconfirmation primitives.

viem provides typed Ethereum/OP Stack primitives.

FlashKit provides transaction lifecycle orchestration,
simulation, fallback, measurement and developer UX.
```

This should remain central to project positioning.

---

# 34. README Disclaimer

Add:

```md
Flashblocks preconfirmation is not equivalent to L2 or L1 finality.

FlashKit treats preconfirmation, block inclusion, safe state
and finalized state as separate transaction lifecycle stages.
Canonical chain data remains authoritative.
```

This protects against one of the easiest technical mistakes a Flashblocks product can make.

---

# 35. Compatibility File

Create:

```text
docs/compatibility.md
```

Example:

```text
FLASHKIT COMPATIBILITY

Verified:
2026-09-17

Network:
GIWA Sepolia

Chain ID:
91342

GIWA Mainnet:
Not supported / not officially available

Execution infrastructure:
GIWA OP Stack / op-reth

Flashblocks:
Supported

Canonical RPC:
Verified

Flashblocks RPC:
Verified

eth_simulateV1:
Verified

viem:
<installed version>

FlashKit:
0.1.0
```

Update this during releases.

---

# 36. External Dependency Policy

Use strict version control for core dependencies:

```text
viem
wagmi if used by examples
React
TypeScript
Foundry
```

Before major upgrades:

```text
check changelog
run unit tests
run live GIWA tests
run benchmark smoke test
```

Do not allow automatic major dependency updates to be merged purely because CI unit tests pass.

Live GIWA behavior matters.

---

# 37. Final Technical Acceptance Criteria

Do not publish `v0.1.0` until all of the following are true:

```text
[ ] GIWA Sepolia chain verified live
[ ] Standard RPC verified
[ ] Flashblocks RPC verified
[ ] pending state verified
[ ] preconfirmation observed live
[ ] canonical inclusion observed live
[ ] preconfirmation != finality documented
[ ] safe/finalized lifecycle documented
[ ] eth_simulateV1 verified
[ ] RPC degradation tested
[ ] HTTP 429 behavior tested
[ ] transaction revert tested
[ ] timeout tested
[ ] React cleanup tested
[ ] Inspector handles unknown hashes
[ ] Inspector does not invent historical latency
[ ] benchmark methodology documented
[ ] custom RPC supported
[ ] public RPC warning documented
[ ] no private-key custody
[ ] telemetry disabled by default
[ ] Mainnet not guessed
[ ] official GIWA sources referenced
[ ] CI passing
```

---

# 38. Final Product Boundary

FlashKit v0.1 should remain focused.

Build:

```text
transaction preconfirmation
lifecycle tracking
simulation
fallback
measurement
React bindings
Inspector
Playground
benchmark
documentation
```

Do not initially build:

```text
DEX
bridge
wallet
indexer
explorer replacement
Dojang platform
account abstraction protocol
analytics SaaS
custom sequencer
RPC service
```

Those distract from the project's strongest GIWA-specific advantage.

---

# 39. Official Source Map

Use this map when implementing or reviewing code.

| Question | Source of Truth |
|---|---|
| What is GIWA Sepolia's chain configuration? | GIWA Documentation → Connect to GIWA |
| How do Flashblocks work? | GIWA Documentation → Flashblocks |
| Which RPC methods support Flashblocks? | GIWA Documentation → Flashblocks |
| What does `pending` represent? | GIWA Documentation → Flashblocks |
| What are unsafe/safe/finalized blocks? | GIWA Documentation → Differences between Ethereum and GIWA |
| Does GIWA have a public mempool? | GIWA Documentation → Differences between Ethereum and GIWA |
| Can the public RPC be used for production? | GIWA Documentation → Connect to GIWA / Flashblocks |
| How do I run a GIWA node? | `giwa-io/node` |
| Which execution client does GIWA currently use? | `giwa-io/node` |
| How should viem configure GIWA? | upstream `wevm/viem` GIWA chain definition |
| What protocol changes are coming? | GIWA Notices + `giwa-io/node` releases |
| What is Dojang? | GIWA Documentation → Dojang |
| Where can test ETH be obtained? | GIWA Documentation → Faucet |
| What does GASOK look for? | Official GASOK page |

---

# 40. Maintenance Routine

Before each FlashKit release:

```text
1. Check GIWA Notices.
2. Check GIWA node repository/releases.
3. Check current GIWA Flashblocks docs.
4. Check viem GIWA definition.
5. Run read-only GIWA health tests.
6. Run one controlled transaction flow.
7. Run simulation.
8. Verify preconfirmation.
9. Verify canonical inclusion.
10. Verify safe/finalized tracking.
11. Run benchmark smoke test.
12. Update compatibility date.
```

This should become part of the release process rather than relying on memory.

---

# 41. Final Architectural Principle

FlashKit should always preserve the following responsibility split:

```text
GIWA
│
├── L2 network
├── sequencer
├── Flashblocks
├── canonical chain
└── RPC state
      │
      ▼
viem
│
├── Ethereum primitives
├── transport
├── chain definitions
└── typed RPC
      │
      ▼
FlashKit Core
│
├── lifecycle
├── preconfirmation tracking
├── canonical verification
├── simulation
├── fallback
└── metrics
      │
      ▼
FlashKit React / UI
│
├── hooks
├── components
├── Inspector
└── Playground
      │
      ▼
GIWA APPLICATION
```

Each layer should do only its own job.

---

# 42. Final Rule

When uncertain about a GIWA-specific technical behavior:

```text
DO NOT GUESS.
```

Check, in order:

```text
GIWA official documentation
GIWA official repository
upstream viem
live GIWA Sepolia behavior
```

Then encode the behavior in FlashKit and add a regression test.

This is particularly important because GIWA is still evolving and Mainnet has not yet been officially released.

---

# 43. Project Positioning

Final positioning:

> **FlashKit is the open-source transaction experience layer for GIWA.**

Technical description:

> FlashKit converts GIWA Flashblocks and canonical OP Stack transaction states into a developer-friendly TypeScript lifecycle for preconfirmation, simulation, canonical verification, fallback and latency measurement.

Developer promise:

> **Use your existing wallet stack. Send the transaction normally. Give the hash to FlashKit. FlashKit handles the transaction experience.**

Core principle:

> **GIWA provides the primitive. FlashKit makes it usable.**

---

# 44. Required Reference Set

The project should always retain references to:

**GIWA official**
- Connect to GIWA
- Flashblocks
- Differences between Ethereum and GIWA
- Faucets
- Dojang
- GIWA Notices
- GASOK

**GIWA GitHub**
- `giwa-io/node`
- `giwa-io/chain-operations`
- `giwa-io/viem`
- `giwa-io/dojang`
- `giwa-io/PoWFaucet`

**Core dependency**
- `wevm/viem`
- GIWA Sepolia chain definition
- viem preconfirmation-aware client behavior

These references should be checked periodically because GIWA is an active testnet ecosystem and technical details may change.

---

# 45. Final Development Instruction

The implementation agent/developer should receive both:

```text
PROJECT_SPEC.md
GIWA_REFERENCES.md
```

and follow this rule:

> `PROJECT_SPEC.md` defines what FlashKit should become.

> `GIWA_REFERENCES.md` defines which external facts it is allowed to rely on.

If a project requirement conflicts with current official GIWA behavior, the official network behavior wins and the project specification must be updated.

Do not code around an outdated assumption.
