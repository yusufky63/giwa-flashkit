import type { FlashTransactionStatus } from '../types'

const VALID_TRANSITIONS: Record<FlashTransactionStatus, FlashTransactionStatus[]> = {
  idle: ['submitted', 'error'],
  submitted: ['preconfirmed', 'included', 'reverted', 'replaced', 'dropped', 'timeout', 'error'],
  preconfirmed: ['included', 'reverted', 'replaced', 'dropped', 'timeout', 'error'],
  included: ['safe', 'finalized', 'reverted', 'error'],
  safe: ['finalized', 'error'],
  finalized: [],
  reverted: [],
  replaced: [],
  dropped: [],
  timeout: [],
  error: []
}

export function isValidTransition(
  from: FlashTransactionStatus,
  to: FlashTransactionStatus
): boolean {
  if (from === to) return true
  const allowed = VALID_TRANSITIONS[from]
  return allowed ? allowed.includes(to) : false
}

export function assertValidTransition(
  from: FlashTransactionStatus,
  to: FlashTransactionStatus
): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid lifecycle transition from '${from}' to '${to}'`)
  }
}
