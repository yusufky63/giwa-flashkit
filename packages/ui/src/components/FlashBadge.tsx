import React from 'react'

export interface FlashBadgeProps {
  type: 'preconfirmed' | 'included' | 'safe' | 'finalized' | 'fallback'
  latencyMs?: number
  className?: string
}

export function FlashBadge({ type, latencyMs, className }: FlashBadgeProps) {
  const isPreconf = type === 'preconfirmed'

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backgroundColor: isPreconf ? '#361b04' : '#18181b',
        color: isPreconf ? '#fde047' : '#e4e4e7',
        border: `1px solid ${isPreconf ? '#ca8a04' : '#3f3f46'}`
      }}
    >
      {isPreconf ? '⚡ PRECONFIRMED' : type.toUpperCase()}
      {latencyMs !== undefined && (
        <span style={{ opacity: 0.85, marginLeft: '2px' }}>
          {latencyMs}ms
        </span>
      )}
    </span>
  )
}
