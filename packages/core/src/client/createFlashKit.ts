import type { Hex, PublicClient } from 'viem'
import { giwaSepolia, giwaSepoliaPreconf } from 'viem/chains'
import { UnsupportedNetworkError } from '../errors/errors'
import { FallbackCoordinator } from '../rpc/fallback'
import { checkEndpointsHealth } from '../rpc/health'
import { simulateTransaction } from '../simulation/simulate'
import { DefaultTransactionTracker } from '../transaction/tracker'
import type {
  FlashKit,
  FlashKitConfig,
  FlashSimulationParams,
  FlashSimulationResult,
  TransactionTracker
} from '../types'
import { createCanonicalClient } from './canonicalClient'
import { createPreconfClient } from './preconfClient'

export function createFlashKit(userConfig?: FlashKitConfig): FlashKit {
  const chain = userConfig?.chain ?? giwaSepolia

  // Network check: Only GIWA Sepolia (91342) is currently supported
  if (chain.id !== 91342) {
    throw new UnsupportedNetworkError(
      `Unsupported chain ID: ${chain.id}. FlashKit currently supports GIWA Sepolia (Chain ID 91342).`
    )
  }

  const config: Required<FlashKitConfig> = {
    network: 'giwaSepolia',
    chain,
    rpc: {
      canonical: userConfig?.rpc?.canonical ?? chain.rpcUrls.default.http[0],
      flashblocks: userConfig?.rpc?.flashblocks ?? giwaSepoliaPreconf.rpcUrls.default.http[0]
    },
    polling: {
      preconfIntervalMs: userConfig?.polling?.preconfIntervalMs ?? 100,
      inclusionIntervalMs: userConfig?.polling?.inclusionIntervalMs ?? 300,
      finalityIntervalMs: userConfig?.polling?.finalityIntervalMs ?? 2000,
      timeoutMs: userConfig?.polling?.timeoutMs ?? 60_000,
      preconfTimeoutMs: userConfig?.polling?.preconfTimeoutMs ?? 5000
    },
    debug: userConfig?.debug ?? false
  }

  const canonicalClient: PublicClient = createCanonicalClient(config)
  const flashClient: PublicClient = createPreconfClient(config)
  const fallbackCoordinator = new FallbackCoordinator()

  return {
    canonicalClient,
    flashClient,
    config,

    trackTransaction(hash: Hex, options?: { submittedAt?: number }): TransactionTracker {
      return new DefaultTransactionTracker(
        hash,
        canonicalClient,
        flashClient,
        config,
        fallbackCoordinator,
        options
      )
    },

    async simulate(params: FlashSimulationParams): Promise<FlashSimulationResult> {
      return simulateTransaction(
        flashClient,
        canonicalClient,
        params,
        config.rpc.flashblocks
      )
    },

    async checkRpcHealth() {
      const health = await checkEndpointsHealth(canonicalClient, flashClient)
      return {
        canonical: health.canonical,
        flashblocks: health.flashblocks,
        degraded: health.degraded
      }
    }
  }
}
