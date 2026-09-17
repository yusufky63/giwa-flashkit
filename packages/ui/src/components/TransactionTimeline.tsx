import React from 'react'
import type { FlashTransactionState } from '@flashkit/core'

export interface TransactionTimelineProps {
  state?: FlashTransactionState
  className?: string
  showL1Finality?: boolean
}

export function TransactionTimeline({
  state,
  className,
  showL1Finality = false
}: TransactionTimelineProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(showL1Finality)
  const status = state?.status ?? 'idle'
  const timeline = state?.timeline

  const stages = [
    {
      id: 'submitted',
      label: 'Submitted',
      timestamp: timeline?.submittedAt,
      latency: 0,
      active: status !== 'idle',
      completed: status !== 'idle'
    },
    {
      id: 'preconfirmed',
      label: 'Preconfirmed ⚡',
      timestamp: timeline?.preconfirmedAt,
      latency: timeline?.preconfirmationMs,
      active: status === 'preconfirmed',
      completed:
        status === 'preconfirmed' ||
        status === 'included' ||
        status === 'safe' ||
        status === 'finalized',
      skipped: state?.degradedMode && !timeline?.preconfirmedAt
    },
    {
      id: 'included',
      label: 'Canonical Included',
      timestamp: timeline?.includedAt,
      latency: timeline?.inclusionMs,
      active: status === 'included',
      completed: status === 'included' || status === 'safe' || status === 'finalized'
    }
  ]

  const l1Stages = [
    {
      id: 'safe',
      label: 'Safe (L1 Published)',
      timestamp: timeline?.safeAt,
      latency: undefined as number | undefined,
      active: status === 'safe',
      completed: status === 'safe' || status === 'finalized',
      skipped: false
    },
    {
      id: 'finalized',
      label: 'Finalized (L1 Settled)',
      timestamp: timeline?.finalizedAt,
      latency: undefined as number | undefined,
      active: status === 'finalized',
      completed: status === 'finalized',
      skipped: false
    }
  ]

  const visibleStages = showAdvanced ? [...stages, ...l1Stages] : stages

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#09090b',
        border: '1px solid #27272a',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>
          GIWA Transaction Lifecycle
        </div>
        {(status === 'included' || status === 'safe' || status === 'finalized') && !showAdvanced && (
          <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>
            ✓ Confirmed on GIWA L2
          </span>
        )}
      </div>

      {visibleStages.map((stage, idx) => {
        const isLast = idx === visibleStages.length - 1
        const dotColor = stage.completed
          ? stage.id === 'preconfirmed'
            ? '#eab308'
            : '#22c55e'
          : stage.active
          ? '#3b82f6'
          : '#3f3f46'

        return (
          <div key={stage.id} style={{ display: 'flex', position: 'relative' }}>
            {/* Vertical Line */}
            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: '7px',
                  top: '16px',
                  bottom: '-4px',
                  width: '2px',
                  backgroundColor: stage.completed ? '#27272a' : '#18181b',
                  zIndex: 1
                }}
              />
            )}

            {/* Indicator Dot */}
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#09090b',
                border: `2px solid ${dotColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                marginTop: '3px'
              }}
            >
              {stage.completed && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: dotColor
                  }}
                />
              )}
            </div>

            {/* Label and metrics */}
            <div
              style={{
                marginLeft: '12px',
                marginBottom: isLast ? '0px' : '20px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexGrow: 1,
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: stage.active || stage.completed ? 600 : 400,
                  color: stage.completed
                    ? '#fafafa'
                    : stage.active
                    ? '#93c5fd'
                    : '#71717a'
                }}
              >
                {stage.label}
                {stage.skipped && (
                  <span style={{ fontSize: '11px', color: '#a1a1aa', marginLeft: '6px' }}>
                    (degraded / skipped)
                  </span>
                )}
              </span>

              <span
                style={{
                  fontSize: '12px',
                  color: stage.latency !== undefined ? (stage.id === 'preconfirmed' ? '#fde047' : '#a1a1aa') : stage.completed ? '#22c55e' : '#71717a',
                  fontWeight: 500
                }}
              >
                {stage.latency !== undefined
                  ? `${stage.latency} ms`
                  : stage.completed
                  ? 'Confirmed'
                  : stage.id === 'safe'
                  ? 'Pending (~2-5m L1 batch)'
                  : stage.id === 'finalized'
                  ? 'Pending (~15m L1 finality)'
                  : 'Pending'}
              </span>
            </div>
          </div>
        )
      })}

      {/* Collapsible L1 details toggle */}
      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '11px',
            color: '#71717a',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {showAdvanced ? '▴ Hide L1 settlement details' : '▾ Show L1 settlement stages (Advanced)'}
        </button>
        {showAdvanced && (
          <span style={{ fontSize: '10px', color: '#52525b' }}>
            OP Stack L1 Batch Inbox
          </span>
        )}
      </div>
    </div>
  )
}
