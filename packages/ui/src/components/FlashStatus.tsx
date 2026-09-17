import React from 'react'
import type { FlashTransactionStatus } from '@flashkit/core'

export interface FlashStatusProps {
  status: FlashTransactionStatus
  className?: string
}

const STATUS_CONFIG: Record<
  FlashTransactionStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  idle: { label: 'Idle', bg: '#18181b', text: '#a1a1aa', border: '#27272a', dot: '#71717a' },
  submitted: { label: 'Submitted', bg: '#172554', text: '#93c5fd', border: '#1e3a8a', dot: '#3b82f6' },
  preconfirmed: { label: 'Preconfirmed ⚡', bg: '#422006', text: '#fde047', border: '#854d0e', dot: '#eab308' },
  included: { label: 'Included', bg: '#052e16', text: '#86efac', border: '#166534', dot: '#22c55e' },
  safe: { label: 'Safe (L1 Published)', bg: '#042f2e', text: '#5eead4', border: '#115e59', dot: '#14b8a6' },
  finalized: { label: 'Finalized (L1 Settled)', bg: '#064e3b', text: '#6ee7b7', border: '#047857', dot: '#10b981' },
  reverted: { label: 'Reverted', bg: '#450a0a', text: '#fca5a5', border: '#991b1b', dot: '#ef4444' },
  replaced: { label: 'Replaced', bg: '#2e1065', text: '#d8b4fe', border: '#581c87', dot: '#a855f7' },
  dropped: { label: 'Dropped', bg: '#27272a', text: '#d4d4d8', border: '#3f3f46', dot: '#a1a1aa' },
  timeout: { label: 'Timeout', bg: '#431407', text: '#fdba74', border: '#9a3412', dot: '#f97316' },
  error: { label: 'Error', bg: '#450a0a', text: '#fca5a5', border: '#991b1b', dot: '#ef4444' }
}

export function FlashStatus({ status, className }: FlashStatusProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.025em',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dot
        }}
      />
      {config.label}
    </span>
  )
}
