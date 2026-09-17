import { createPublicClient, http, type PublicClient } from 'viem'
import { giwaSepoliaPreconf } from 'viem/chains'
import type { FlashKitConfig } from '../types'

export function createPreconfClient(config?: FlashKitConfig): any {
  const chain = config?.chain ?? giwaSepoliaPreconf
  const rpcUrl = config?.rpc?.flashblocks ?? chain.rpcUrls.default.http[0]

  return createPublicClient({
    chain,
    transport: http(rpcUrl, {
      timeout: 8_000,
      retryCount: 2,
      retryDelay: 150
    })
  }) as PublicClient<any, any>
}
