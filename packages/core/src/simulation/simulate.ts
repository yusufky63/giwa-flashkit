import type { PublicClient } from 'viem'
import { toHex } from 'viem'
import type { FlashSimulationParams, FlashSimulationResult } from '../types'
import { normalizeSimulationResponse } from './normalize'

export async function simulateTransaction(
  flashClient: PublicClient,
  canonicalClient: PublicClient,
  params: FlashSimulationParams,
  rpcUrl?: string
): Promise<FlashSimulationResult> {
  const start = performance.now()
  const endpoint = rpcUrl ?? flashClient.chain?.rpcUrls.default.http[0] ?? 'https://sepolia-rpc-flashblocks.giwa.io'

  // 1. Try eth_simulateV1 directly against Flashblocks RPC
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_simulateV1',
        params: [
          {
            blockStateCalls: [
              {
                calls: [
                  {
                    from: params.account ?? '0x0000000000000000000000000000000000000001',
                    to: params.to,
                    data: params.data ?? '0x',
                    value: params.value ? toHex(params.value) : '0x0',
                    gas: params.gas ? toHex(params.gas) : undefined
                  }
                ]
              }
            ]
          },
          'pending'
        ]
      })
    })

    if (response.ok) {
      const json = (await response.json()) as { error?: { message: string }; result?: unknown }
      const durationMs = Math.round(performance.now() - start)

      if (json.error) {
        return {
          success: false,
          gasUsed: 0n,
          returnData: '0x',
          revertReason: json.error.message,
          raw: json,
          durationMs
        }
      }

      if (json.result) {
        return normalizeSimulationResponse(json.result, durationMs)
      }
    }
  } catch {
    // Continue to fallback simulation via standard eth_call
  }

  // 2. Fallback simulation via standard viem call on pending block
  try {
    const client = flashClient ?? canonicalClient
    const [callResult, gasUsed] = await Promise.all([
      client.call({
        account: params.account,
        to: params.to,
        data: params.data,
        value: params.value,
        blockTag: 'pending'
      }),
      client.estimateGas({
        account: params.account,
        to: params.to,
        data: params.data,
        value: params.value
      }).catch(() => 21000n)
    ])

    const durationMs = Math.round(performance.now() - start)
    return {
      success: true,
      gasUsed,
      returnData: callResult.data ?? '0x',
      raw: { callResult, gasUsed },
      durationMs
    }
  } catch (error) {
    const durationMs = Math.round(performance.now() - start)
    return {
      success: false,
      gasUsed: 0n,
      returnData: '0x',
      revertReason: error instanceof Error ? error.message : String(error),
      raw: error,
      durationMs
    }
  }
}
