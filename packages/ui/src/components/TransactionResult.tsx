import React from 'react'
import type { FlashTransactionState } from '@flashkit/core'
import { FlashStatus } from './FlashStatus'

export interface TransactionResultProps {
  state?: FlashTransactionState
  className?: string
}

export function TransactionResult({ state, className }: TransactionResultProps) {
  if (!state) return null

  const receipt = state.receipt
  const explorerUrl = `https://sepolia-explorer.giwa.io/tx/${state.hash}`

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fafafa' }}>
          Transaction Overview
        </span>
        <FlashStatus status={state.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '12px' }}>
        <span style={{ color: '#71717a' }}>Hash:</span>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#60a5fa', textDecoration: 'none', wordBreak: 'break-all' }}
        >
          {state.hash} ↗
        </a>

        {state.blockNumber && (
          <>
            <span style={{ color: '#71717a' }}>Block:</span>
            <span style={{ color: '#e4e4e7' }}>#{state.blockNumber.toString()}</span>
          </>
        )}

        {receipt?.gasUsed && (
          <>
            <span style={{ color: '#71717a' }}>Gas Used:</span>
            <span style={{ color: '#e4e4e7' }}>{receipt.gasUsed.toLocaleString()}</span>
          </>
        )}

        {receipt?.effectiveGasPrice && (
          <>
            <span style={{ color: '#71717a' }}>Gas Price:</span>
            <span style={{ color: '#e4e4e7' }}>{receipt.effectiveGasPrice.toString()} wei</span>
          </>
        )}

        <span style={{ color: '#71717a' }}>Network:</span>
        <span style={{ color: '#e4e4e7' }}>GIWA Sepolia (91342)</span>
      </div>
    </div>
  )
}
