import { describe, it, expect } from 'vitest'
import { isValidTransition, assertValidTransition } from '../src/transaction/lifecycle'

describe('Transaction Lifecycle State Transitions', () => {
  it('allows valid normal path transitions', () => {
    expect(isValidTransition('idle', 'submitted')).toBe(true)
    expect(isValidTransition('submitted', 'preconfirmed')).toBe(true)
    expect(isValidTransition('preconfirmed', 'included')).toBe(true)
    expect(isValidTransition('included', 'safe')).toBe(true)
    expect(isValidTransition('safe', 'finalized')).toBe(true)
  })

  it('allows skipping preconfirmed directly to included (degraded mode / missed preconf)', () => {
    expect(isValidTransition('submitted', 'included')).toBe(true)
  })

  it('allows transitions to error/terminal states', () => {
    expect(isValidTransition('submitted', 'timeout')).toBe(true)
    expect(isValidTransition('submitted', 'reverted')).toBe(true)
    expect(isValidTransition('preconfirmed', 'reverted')).toBe(true)
    expect(isValidTransition('included', 'reverted')).toBe(true)
  })

  it('rejects invalid backward transitions', () => {
    expect(isValidTransition('finalized', 'submitted')).toBe(false)
    expect(isValidTransition('safe', 'preconfirmed')).toBe(false)
    expect(isValidTransition('included', 'preconfirmed')).toBe(false)
  })

  it('assertValidTransition throws on invalid transition', () => {
    expect(() => assertValidTransition('finalized', 'submitted')).toThrow(
      "Invalid lifecycle transition from 'finalized' to 'submitted'"
    )
  })
})
