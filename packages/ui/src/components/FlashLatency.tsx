import React from 'react'

export interface FlashLatencyProps {
  preconfirmationMs?: number
  inclusionMs?: number
  timeSavedMs?: number
  className?: string
}

export function FlashLatency({
  preconfirmationMs,
  inclusionMs,
  timeSavedMs,
  className
}: FlashLatencyProps) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>
          Preconfirmed
        </span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#fde047', marginTop: '4px' }}>
          {preconfirmationMs !== undefined ? `${preconfirmationMs} ms` : '—'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>
          Canonical Included
        </span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#e4e4e7', marginTop: '4px' }}>
          {inclusionMs !== undefined ? `${inclusionMs} ms` : '—'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>
          Early Advantage
        </span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e', marginTop: '4px' }}>
          {timeSavedMs !== undefined ? `+${timeSavedMs} ms` : '—'}
        </span>
      </div>
    </div>
  )
}
