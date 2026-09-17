# @flashkit/ui ⚡

**Developer UI components for GIWA Flashblocks transaction telemetry and timeline.**

Part of the [FlashKit](https://github.com/yusufky63/giwa-flashkit) developer toolkit for GIWA.

## Components Included

- `<TransactionTimeline />` — Vertical lifecycle timeline showing sub-200ms preconfirmation and canonical block inclusion.
- `<FlashStatus />` — Color-coded status badge with animated state indicators.
- `<FlashBadge />` — Compact preconfirmation badge.
- `<FlashLatency />` — Time-saved metric card.
- `<TransactionResult />` — Detailed receipt summary with GIWA Blockscout links.

## Installation

```bash
npm install @flashkit/core @flashkit/react @flashkit/ui viem react
# or
pnpm add @flashkit/core @flashkit/react @flashkit/ui viem react
```

## Quickstart

```tsx
import { useFlashTransaction } from '@flashkit/react'
import { TransactionTimeline, FlashLatency } from '@flashkit/ui'

export function Tracker({ hash }: { hash: `0x${string}` }) {
  const { state } = useFlashTransaction({ hash })

  return (
    <div>
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

## License

MIT © FlashKit Contributors
