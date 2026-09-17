import type { TransactionTimeline } from '../types'

export function computeTimelineMetrics(timeline: TransactionTimeline): TransactionTimeline {
  const updated = { ...timeline }

  if (updated.submittedAt && updated.preconfirmedAt) {
    updated.preconfirmationMs = Math.max(0, Math.round(updated.preconfirmedAt - updated.submittedAt))
  }

  if (updated.submittedAt && updated.includedAt) {
    updated.inclusionMs = Math.max(0, Math.round(updated.includedAt - updated.submittedAt))
  }

  if (updated.preconfirmationMs !== undefined && updated.inclusionMs !== undefined) {
    updated.timeSavedMs = Math.max(0, updated.inclusionMs - updated.preconfirmationMs)
  }

  return updated
}
