import { describe, it, expect } from 'vitest'
import { MockGiwaRpcEngine } from '../src/mockRpc'
import { SAMPLE_HASHES } from '../src/fixtures'

describe('MockGiwaRpcEngine', () => {
  it('returns GIWA Sepolia chain ID 91342 (0x164ce)', async () => {
    const engine = new MockGiwaRpcEngine()
    const chainId = await engine.handleRequest('eth_chainId')
    expect(chainId).toBe('0x164ce')
  })

  it('throws on HTTP 429 when configured', async () => {
    const engine = new MockGiwaRpcEngine({ shouldFailWith429: true })
    await expect(engine.handleRequest('eth_chainId')).rejects.toThrow('HTTP 429')
  })

  it('returns null before delay threshold, then returns receipt', async () => {
    const engine = new MockGiwaRpcEngine({ preconfDelayMs: 50 })
    const hash = SAMPLE_HASHES[0]

    // Immediate query: null
    const first = await engine.handleRequest('eth_getTransactionReceipt', [hash])
    expect(first).toBeNull()

    // Wait 60ms
    await new Promise((r) => setTimeout(r, 60))
    const second = await engine.handleRequest('eth_getTransactionReceipt', [hash])
    expect(second).not.toBeNull()
    expect(second.status).toBe('success')
  })

  it('simulates reverted receipt accurately', async () => {
    const engine = new MockGiwaRpcEngine({ preconfDelayMs: 0, shouldRevert: true })
    const receipt = await engine.handleRequest('eth_getTransactionReceipt', [SAMPLE_HASHES[0]])
    expect(receipt.status).toBe('reverted')
  })
})
