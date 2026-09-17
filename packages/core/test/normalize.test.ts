import { describe, it, expect } from 'vitest'
import { normalizeSimulationResponse } from '../src/simulation/normalize'

describe('Simulation Normalization', () => {
  it('parses eth_simulateV1 array response format correctly', () => {
    const raw = [
      {
        calls: [
          {
            status: '0x1',
            gasUsed: '0x5208', // 21000
            returnData: '0x1234'
          }
        ]
      }
    ]

    const result = normalizeSimulationResponse(raw, 150)
    expect(result.success).toBe(true)
    expect(result.gasUsed).toBe(21000n)
    expect(result.returnData).toBe('0x1234')
    expect(result.durationMs).toBe(150)
  })

  it('detects revert errors in simulation call', () => {
    const raw = [
      {
        calls: [
          {
            status: '0x0',
            gasUsed: '0x5208',
            error: {
              code: 3,
              message: 'execution reverted: custom error'
            }
          }
        ]
      }
    ]

    const result = normalizeSimulationResponse(raw, 80)
    expect(result.success).toBe(false)
    expect(result.revertReason).toBe('execution reverted: custom error')
  })
})
