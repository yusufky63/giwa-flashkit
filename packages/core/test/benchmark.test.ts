import { describe, it, expect } from 'vitest'
import { calculateBenchmarkStats, type BenchmarkDataPoint } from '../src/metrics/benchmark'

describe('Benchmark Statistics Calculation', () => {
  it('computes correct percentiles and success rate', () => {
    const data: BenchmarkDataPoint[] = [
      { submittedAt: 1, preconfirmationMs: 180, inclusionMs: 980, timeSavedMs: 800, success: true },
      { submittedAt: 2, preconfirmationMs: 200, inclusionMs: 1000, timeSavedMs: 800, success: true },
      { submittedAt: 3, preconfirmationMs: 220, inclusionMs: 1020, timeSavedMs: 800, success: true },
      { submittedAt: 4, preconfirmationMs: 0, inclusionMs: 0, timeSavedMs: 0, success: false }
    ]

    const stats = calculateBenchmarkStats(data)
    expect(stats.samples).toBe(4)
    expect(stats.successCount).toBe(3)
    expect(stats.failureCount).toBe(1)
    expect(stats.successRate).toBe(75)

    expect(stats.preconfMedianMs).toBe(200)
    expect(stats.preconfMinMs).toBe(180)
    expect(stats.preconfMaxMs).toBe(220)

    expect(stats.inclusionMedianMs).toBe(1000)
    expect(stats.earlyAdvantageMedianMs).toBe(800)
  })

  it('handles empty data set gracefully', () => {
    const stats = calculateBenchmarkStats([])
    expect(stats.samples).toBe(0)
    expect(stats.successRate).toBe(0)
    expect(stats.preconfMedianMs).toBe(0)
  })
})
