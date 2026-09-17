import type { PublicClient } from 'viem'

export interface RpcHealthStatus {
  canonical: boolean
  flashblocks: boolean
  degraded: boolean
  canonicalChainId?: number
  flashChainId?: number
  canonicalLatencyMs: number
  flashLatencyMs: number
}

export async function checkEndpointsHealth(
  canonicalClient: PublicClient,
  flashClient: PublicClient
): Promise<RpcHealthStatus> {
  let canonicalOk = false
  let flashOk = false
  let canonicalChainId: number | undefined
  let flashChainId: number | undefined

  const startCanonical = performance.now()
  try {
    const id = await canonicalClient.getChainId()
    canonicalChainId = id
    canonicalOk = id === 91342
  } catch {
    canonicalOk = false
  }
  const canonicalLatencyMs = Math.round(performance.now() - startCanonical)

  const startFlash = performance.now()
  try {
    const id = await flashClient.getChainId()
    flashChainId = id
    flashOk = id === 91342
  } catch {
    flashOk = false
  }
  const flashLatencyMs = Math.round(performance.now() - startFlash)

  return {
    canonical: canonicalOk,
    flashblocks: flashOk,
    degraded: canonicalOk && !flashOk,
    canonicalChainId,
    flashChainId,
    canonicalLatencyMs,
    flashLatencyMs
  }
}
