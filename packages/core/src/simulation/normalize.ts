import type { Hex } from 'viem'
import type { FlashSimulationResult } from '../types'

export interface RawSimulateV1CallResult {
  status?: string | number
  gasUsed?: string | number | bigint
  returnData?: Hex
  error?: {
    code?: number
    message?: string
  }
}

export function normalizeSimulationResponse(
  raw: unknown,
  durationMs: number
): FlashSimulationResult {
  if (!raw || typeof raw !== 'object') {
    return {
      success: false,
      gasUsed: 0n,
      returnData: '0x',
      revertReason: 'Empty or invalid simulation payload',
      raw,
      durationMs
    }
  }

  // Handle standard eth_simulateV1 result array structure:
  // [ { calls: [ { status: "0x1", gasUsed: "0x...", returnData: "0x..." } ] } ]
  if (Array.isArray(raw) && raw.length > 0) {
    const firstBlock = raw[0]
    const calls = firstBlock?.calls ?? firstBlock
    const firstCall: RawSimulateV1CallResult = Array.isArray(calls) ? calls[0] : calls

    if (firstCall) {
      const isSuccess =
        firstCall.status === '0x1' ||
        firstCall.status === 1 ||
        firstCall.status === 'success' ||
        !firstCall.error

      const gasUsed = firstCall.gasUsed ? BigInt(firstCall.gasUsed) : 21000n
      const returnData: Hex = (firstCall.returnData as Hex) ?? '0x'
      const revertReason = firstCall.error?.message

      const callsList = Array.isArray(calls) ? calls : [firstCall]
      const transfers = (firstBlock as any)?.transfers ?? []

      return {
        success: isSuccess && !revertReason,
        gasUsed,
        returnData,
        revertReason,
        calls: callsList,
        transfers,
        raw,
        durationMs
      }
    }
  }

  // Fallback / standard call normalization
  const anyRaw = raw as Record<string, unknown>
  const gasUsed = anyRaw.gasUsed ? BigInt(anyRaw.gasUsed as string | number | bigint) : 21000n
  const returnData = (anyRaw.returnData as Hex) ?? '0x'

  return {
    success: !anyRaw.error,
    gasUsed,
    returnData,
    revertReason: anyRaw.error ? String(anyRaw.error) : undefined,
    raw,
    durationMs
  }
}
