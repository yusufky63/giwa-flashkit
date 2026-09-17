import type { Hex, TransactionReceipt } from 'viem'
import { createMockReceipt, SAMPLE_HASHES } from './fixtures'

export interface MockRpcOptions {
  chainId?: number
  preconfDelayMs?: number
  inclusionDelayMs?: number
  shouldFailWith429?: boolean
  shouldFailWith500?: boolean
  shouldRevert?: boolean
  shouldTimeout?: boolean
}

export class MockGiwaRpcEngine {
  private options: MockRpcOptions
  private startTime: number
  private receipts: Map<Hex, TransactionReceipt> = new Map()

  constructor(options: MockRpcOptions = {}) {
    this.options = {
      chainId: 91342,
      preconfDelayMs: 100,
      inclusionDelayMs: 400,
      shouldFailWith429: false,
      shouldFailWith500: false,
      shouldRevert: false,
      shouldTimeout: false,
      ...options
    }
    this.startTime = Date.now()
  }

  setOption<K extends keyof MockRpcOptions>(key: K, value: MockRpcOptions[K]): void {
    this.options[key] = value
  }

  resetTimer(): void {
    this.startTime = Date.now()
  }

  async handleRequest(method: string, params: any[] = []): Promise<any> {
    if (this.options.shouldFailWith429) {
      throw new Error('HTTP 429 Too Many Requests: Rate limit exceeded')
    }

    if (this.options.shouldFailWith500) {
      throw new Error('HTTP 500 Internal Server Error: Sequencer temporary failure')
    }

    switch (method) {
      case 'eth_chainId':
        return `0x${this.options.chainId!.toString(16)}`

      case 'eth_blockNumber':
        return '0x22a4bb9'

      case 'eth_getBlockByNumber': {
        const tag = params[0]
        return {
          number: '0x22a4bb9',
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          transactions: SAMPLE_HASHES,
          timestamp: `0x${Math.floor(Date.now() / 1000).toString(16)}`
        }
      }

      case 'eth_getTransactionReceipt': {
        if (this.options.shouldTimeout) {
          return null
        }

        const hash = params[0] as Hex
        const elapsed = Date.now() - this.startTime

        // Check if preconf threshold met
        if (elapsed < (this.options.preconfDelayMs ?? 100)) {
          return null
        }

        const isReverted = this.options.shouldRevert ?? false
        const receipt = createMockReceipt(hash, 36325513n, isReverted)
        return receipt
      }

      case 'eth_simulateV1': {
        if (this.options.shouldRevert) {
          return [
            {
              calls: [
                {
                  status: '0x0',
                  gasUsed: '0x5208',
                  error: { code: 3, message: 'execution reverted' }
                }
              ]
            }
          ]
        }
        return [
          {
            calls: [
              {
                status: '0x1',
                gasUsed: '0x5208',
                returnData: '0x0000000000000000000000000000000000000000000000000000000000000001'
              }
            ]
          }
        ]
      }

      default:
        return '0x0'
    }
  }
}
