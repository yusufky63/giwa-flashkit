# FlashKit Architecture & System Design

FlashKit is designed as a modular, framework-agnostic transaction experience layer for GIWA.

## 1. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    GIWA Application                     │
└──────────────┬───────────────────────────▲──────────────┘
               │ (1) writeContract()       │ (5) Reactive UI State
               ▼                           │
┌──────────────────────────────┐ ┌─────────┴──────────────┐
│  User Wallet (viem / wagmi)  │ │     @flashkit/react    │
└──────────────┬───────────────┘ └─────────▲──────────────┘
               │ (2) Returns Hash          │ (4) Typed Events
               ▼                           │
┌──────────────────────────────────────────┴──────────────┐
│                     @flashkit/core                      │
│                                                         │
│  ┌───────────────────────┐   ┌───────────────────────┐  │
│  │     Flash Client      │   │   Canonical Client    │  │
│  │ (Flashblocks-aware)   │   │  (Standard OP Stack)  │  │
│  └───────────┬───────────┘   └───────────┬───────────┘  │
└──────────────┼───────────────────────────┼──────────────┘
               │ (3a) pending receipt      │ (3b) canonical receipt
               ▼                           ▼
┌──────────────────────────────┐ ┌────────────────────────┐
│  GIWA Flashblocks RPC        │ │  GIWA Standard RPC     │
│  (sepolia-rpc-flashblocks)   │ │  (sepolia-rpc.giwa.io) │
└──────────────────────────────┘ └────────────────────────┘
```

## 2. Dual RPC Client Strategy

GIWA exposes two separate RPC endpoints for developers:
1. **Flashblocks-Aware RPC (`https://sepolia-rpc-flashblocks.giwa.io`):**
   - Supports `pending` block tags representing the unsealed, preconfirmed Flashblock.
   - Responds to `eth_getTransactionReceipt` for pending transactions.
   - Supports `eth_simulateV1` against the latest ordered sequence.
2. **Canonical Standard RPC (`https://sepolia-rpc.giwa.io`):**
   - Authoritative for sealed blocks (`latest`), L1 published batches (`safe`), and L1 settled checkpoints (`finalized`).

FlashKit maintains two lightweight `viem` public clients (`canonicalClient` and `flashClient`). The internal tracker queries both according to an adaptive polling strategy.

## 3. Adaptive Polling & Rate-Limit Strategy

Because GIWA public endpoints are rate-limited, FlashKit implements a 3-tier polling frequency:
- **Phase 1 (0 to 2 seconds):** Sub-second polling (default 100ms interval) to capture the ~200ms Flashblocks preconfirmation.
- **Phase 2 (2 to 10 seconds):** Relaxed polling (default 300ms interval) for canonical block inclusion.
- **Phase 3 (Post-inclusion):** Slow background polling (default 2000ms interval) checking OP Stack `safe` and `finalized` block status.
- **HTTP 429 Handling:** Exponential backoff with random jitter and `AbortController` cancellation prevents cascade failures.

## 4. Fallback Architecture (Degraded Mode)

If the Flashblocks RPC becomes unreachable, FlashKit does not fail the transaction. It marks `degradedMode: true` and transitions directly from `submitted` to `included` upon standard block confirmation.
