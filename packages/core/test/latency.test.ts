import { describe, it, expect } from 'vitest'
import { computeTimelineMetrics } from '../src/metrics/latency'

describe('Timeline & Latency Metrics', () => {
  it('computes preconfirmation, inclusion and timeSavedMs accurately', () => {
    const timeline = computeTimelineMetrics({
      submittedAt: 1000,
      preconfirmedAt: 1200,
      includedAt: 2000
    })

    expect(timeline.preconfirmationMs).toBe(200)
    expect(timeline.inclusionMs).toBe(1000)
    expect(timeline.timeSavedMs).toBe(800)
  })

  it('handles partial timeline gracefully without crashing', () => {
    const timeline = computeTimelineMetrics({
      submittedAt: 1000
    })

    expect(timeline.preconfirmationMs).toBeUndefined()
    expect(timeline.inclusionMs).toBeUndefined()
    expect(timeline.timeSavedMs).toBeUndefined()
  })

  it('ensures non-negative values', () => {
    const timeline = computeTimelineMetrics({
      submittedAt: 1000,
      preconfirmedAt: 900 // Clock skew
    })

    expect(timeline.preconfirmationMs).toBe(0)
  })
})
