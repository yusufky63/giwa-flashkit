'use client'

import React, { useState } from 'react'
import type { Hex } from 'viem'
import { useFlashTransaction } from '@flashkit/react'
import { FlashStatus, TransactionTimeline, FlashLatency } from '@flashkit/ui'

export default function BasicExamplePage() {
  const [hash, setHash] = useState<Hex | null>(null)
  const [input, setInput] = useState('')

  const { status, preconfirmationMs, inclusionMs, timeSavedMs, state } = useFlashTransaction({
    hash
  })

  return (
    <main style={{ maxWidth: '640px', margin: '60px auto', padding: '0 20px', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>
        FlashKit Minimal Example
      </h1>
      <p style={{ color: '#a1a1aa', fontSize: '13px', marginBottom: '24px' }}>
        Paste a GIWA Sepolia transaction hash to track its real-time Flashblocks preconfirmation and OP Stack finality.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x..."
          style={{
            flexGrow: 1,
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fafafa',
            fontSize: '12px'
          }}
        />
        <button
          onClick={() => setHash(input.trim() as Hex)}
          style={{
            backgroundColor: '#facc15',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Track
        </button>
      </div>

      {hash && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#71717a' }}>Tracking Hash</span>
            <FlashStatus status={status} />
          </div>

          <FlashLatency
            preconfirmationMs={preconfirmationMs}
            inclusionMs={inclusionMs}
            timeSavedMs={timeSavedMs}
          />

          <TransactionTimeline state={state} />
        </div>
      )}
    </main>
  )
}
