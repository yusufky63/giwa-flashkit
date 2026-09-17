import type { PublicClient } from 'viem'

export interface FinalityStatus {
  isSafe: boolean
  isFinalized: boolean
  safeBlockNumber?: bigint
  finalizedBlockNumber?: bigint
}

export async function checkBlockFinality(
  canonicalClient: PublicClient,
  txBlockNumber: bigint
): Promise<FinalityStatus> {
  try {
    const [safeBlock, finalizedBlock] = await Promise.all([
      canonicalClient.getBlock({ blockTag: 'safe' }).catch(() => null),
      canonicalClient.getBlock({ blockTag: 'finalized' }).catch(() => null)
    ])

    const safeNumber = safeBlock?.number
    const finalizedNumber = finalizedBlock?.number

    const isSafe = safeNumber !== undefined && safeNumber !== null ? txBlockNumber <= safeNumber : false
    const isFinalized = finalizedNumber !== undefined && finalizedNumber !== null ? txBlockNumber <= finalizedNumber : false

    return {
      isSafe,
      isFinalized,
      safeBlockNumber: safeNumber ?? undefined,
      finalizedBlockNumber: finalizedNumber ?? undefined
    }
  } catch {
    return { isSafe: false, isFinalized: false }
  }
}
