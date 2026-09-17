# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-17

### Added
- Initial open-source release of FlashKit for GIWA.
- `@flashkit/core`:
  - Dual RPC client architecture supporting GIWA Sepolia Standard RPC (`sepolia-rpc.giwa.io`) and Flashblocks RPC (`sepolia-rpc-flashblocks.giwa.io`).
  - Full OP Stack transaction lifecycle tracking: `submitted` -> `preconfirmed` -> `included` -> `safe` -> `finalized`.
  - Graceful degradation and fallback to canonical RPC during Flashblocks downtime or rate limits.
  - Simulation engine wrapping `eth_simulateV1` against pending Flashblock state.
  - Adaptive polling with exponential backoff and jitter.
  - Latency and percentile benchmark calculator.
- `@flashkit/react`:
  - `useFlashTransaction`, `useFlashSimulation`, `useFlashStatus` hooks.
  - `FlashKitProvider` and `useFlashKitInstance` context provider.
- `@flashkit/ui`:
  - Developer-terminal UI primitives: `<TransactionTimeline />`, `<FlashStatus />`, `<FlashBadge />`, `<FlashLatency />`, `<TransactionResult />`.
- `@flashkit/testing`:
  - `MockGiwaRpcEngine` with support for latency simulation, HTTP 429 rate limit injection, reverts, and timeouts.
  - Test fixtures for GIWA Sepolia.
- `apps/web`:
  - Developer documentation, Interactive Playground (Counter, Simulation, Payment, Mint), Inspector, and Latency Benchmark.
- `contracts/`:
  - `FlashCounter.sol` and `FlashMint.sol` with 100% passing Foundry test suites.
- `scripts/`:
  - Milestone 1 proof runner (`scripts/proof.ts`).
  - Live GIWA Sepolia health checker (`scripts/health-check.ts`).
  - CLI benchmark runner (`scripts/benchmark.ts`).
