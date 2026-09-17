import { createPublicClient, http, type PublicClient } from 'viem'
import { giwaSepolia } from 'viem/chains'
import type { FlashKitConfig } from '../types'

export function createCanonicalClient(config?: FlashKitConfig): any {
  const chain = config?.chain ?? giwaSepolia
  const rpcUrl = config?.rpc?.canonical ?? chain.rpcUrls.default.http[0]

  return createPublicClient({
    chain,
    transport: http(rpcUrl, {
      timeout: 10_000,
      retryCount: 3,
      retryDelay: 300
    })
  }) as PublicClient<any, any>
}
