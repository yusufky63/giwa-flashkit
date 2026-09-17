# @flashkit/testing ⚡

**Testing utilities, mock RPC transports, and fixtures for FlashKit and GIWA Flashblocks.**

Part of the [FlashKit](https://github.com/yusufky63/giwa-flashkit) developer toolkit for GIWA.

## Features

- `MockGiwaRpcEngine`: Programmable in-memory JSON-RPC mock for GIWA Sepolia.
- Simulates Flashblock preconfirmation delays (~200ms) and canonical block inclusion delays (~1000ms).
- Simulates HTTP 429 rate limits, HTTP 500 sequencer errors, timeouts, and reverted receipts.
- Realistic test fixtures for addresses, hashes, and receipts.

## Installation

```bash
npm install -D @flashkit/testing
# or
pnpm add -D @flashkit/testing
```

## Quickstart

```typescript
import { MockGiwaRpcEngine, SAMPLE_HASHES } from '@flashkit/testing'

const engine = new MockGiwaRpcEngine({
  preconfDelayMs: 150,
  shouldFailWith429: false
})

const receipt = await engine.handleRequest('eth_getTransactionReceipt', [SAMPLE_HASHES[0]])
```

## License

MIT © FlashKit Contributors
