# @flashkit/react ⚡

**React hooks and state management for GIWA Flashblocks transaction experiences.**

Part of the [FlashKit](https://github.com/yusufky63/giwa-flashkit) developer toolkit for GIWA.

## Installation

```bash
npm install @flashkit/core @flashkit/react viem react
# or
pnpm add @flashkit/core @flashkit/react viem react
```

## Quickstart

```tsx
import { useFlashTransaction } from '@flashkit/react'

export function TransactionStatus({ hash }: { hash: `0x${string}` }) {
  const { status, preconfirmationMs, inclusionMs, isPreconfirmed } = useFlashTransaction({
    hash
  })

  return (
    <div>
      <p>Status: {status}</p>
      {isPreconfirmed && <p>⚡ Preconfirmed in {preconfirmationMs}ms!</p>}
    </div>
  )
}
```

## License

MIT © FlashKit Contributors
