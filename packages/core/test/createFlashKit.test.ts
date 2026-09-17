import { describe, it, expect } from 'vitest'
import { mainnet } from 'viem/chains'
import { createFlashKit } from '../src/client/createFlashKit'
import { UnsupportedNetworkError } from '../src/errors/errors'

describe('createFlashKit factory', () => {
  it('initializes cleanly with default GIWA Sepolia', () => {
    const flashkit = createFlashKit()
    expect(flashkit.config.network).toBe('giwaSepolia')
    expect(flashkit.config.chain.id).toBe(91342)
    expect(typeof flashkit.trackTransaction).toBe('function')
    expect(typeof flashkit.simulate).toBe('function')
  })

  it('rejects unsupported networks like mainnet per specification rule', () => {
    expect(() => createFlashKit({ chain: mainnet })).toThrow(UnsupportedNetworkError)
  })

  it('allows custom RPC overrides for self-hosted nodes', () => {
    const customCanonical = 'https://my-giwa-node.internal:8545'
    const customFlash = 'https://my-giwa-node.internal:8546'

    const flashkit = createFlashKit({
      rpc: {
        canonical: customCanonical,
        flashblocks: customFlash
      }
    })

    expect(flashkit.config.rpc.canonical).toBe(customCanonical)
    expect(flashkit.config.rpc.flashblocks).toBe(customFlash)
  })
})
