export interface BenchmarkDataPoint {
  submittedAt: number
  preconfirmationMs: number
  inclusionMs: number
  timeSavedMs: number
  success: boolean
}

export interface BenchmarkStats {
  samples: number
  successCount: number
  failureCount: number
  successRate: number

  preconfMedianMs: number
  preconfP95Ms: number
  preconfMinMs: number
  preconfMaxMs: number

  inclusionMedianMs: number
  inclusionP95Ms: number
  inclusionMinMs: number
  inclusionMaxMs: number

  earlyAdvantageMedianMs: number
  earlyAdvantageP95Ms: number
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

export function calculateBenchmarkStats(data: BenchmarkDataPoint[]): BenchmarkStats {
  const successful = data.filter((d) => d.success)
  const successCount = successful.length
  const failureCount = data.length - successCount
  const successRate = data.length > 0 ? (successCount / data.length) * 100 : 0

  if (successful.length === 0) {
    return {
      samples: data.length,
      successCount: 0,
      failureCount,
      successRate: 0,
      preconfMedianMs: 0,
      preconfP95Ms: 0,
      preconfMinMs: 0,
      preconfMaxMs: 0,
      inclusionMedianMs: 0,
      inclusionP95Ms: 0,
      inclusionMinMs: 0,
      inclusionMaxMs: 0,
      earlyAdvantageMedianMs: 0,
      earlyAdvantageP95Ms: 0
    }
  }

  const preconfLatencies = successful.map((d) => d.preconfirmationMs).sort((a, b) => a - b)
  const inclusionLatencies = successful.map((d) => d.inclusionMs).sort((a, b) => a - b)
  const advantageLatencies = successful.map((d) => d.timeSavedMs).sort((a, b) => a - b)

  return {
    samples: data.length,
    successCount,
    failureCount,
    successRate,
    preconfMedianMs: percentile(preconfLatencies, 50),
    preconfP95Ms: percentile(preconfLatencies, 95),
    preconfMinMs: preconfLatencies[0] ?? 0,
    preconfMaxMs: preconfLatencies[preconfLatencies.length - 1] ?? 0,

    inclusionMedianMs: percentile(inclusionLatencies, 50),
    inclusionP95Ms: percentile(inclusionLatencies, 95),
    inclusionMinMs: inclusionLatencies[0] ?? 0,
    inclusionMaxMs: inclusionLatencies[inclusionLatencies.length - 1] ?? 0,

    earlyAdvantageMedianMs: percentile(advantageLatencies, 50),
    earlyAdvantageP95Ms: percentile(advantageLatencies, 95)
  }
}
