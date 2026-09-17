import { useEffect, useState } from 'react'
import type { Hex } from 'viem'
import type { FlashKit, FlashTransactionState, FlashTransactionStatus } from '@flashkit/core'
import { useFlashKitInstance } from '../context/FlashKitContext'

export interface UseFlashTransactionOptions {
  hash?: Hex | null
  flashkit?: FlashKit
  submittedAt?: number
  enabled?: boolean
}

export interface UseFlashTransactionResult {
  hash?: Hex | null
  status: FlashTransactionStatus
  state?: FlashTransactionState
  preconfirmationMs?: number
  inclusionMs?: number
  timeSavedMs?: number
  receipt?: FlashTransactionState['receipt']
  flashblockReceipt?: FlashTransactionState['flashblockReceipt']
  degradedMode: boolean
  error?: Error

  isIdle: boolean
  isSubmitted: boolean
  isPreconfirmed: boolean
  isIncluded: boolean
  isSafe: boolean
  isFinalized: boolean
  isSuccess: boolean
  isReverted: boolean
  isError: boolean
}

export function useFlashTransaction({
  hash,
  flashkit: customFlashkit,
  submittedAt,
  enabled = true
}: UseFlashTransactionOptions): UseFlashTransactionResult {
  const flashkit = useFlashKitInstance(customFlashkit)
  const [state, setState] = useState<FlashTransactionState | null>(null)

  useEffect(() => {
    if (!hash || !enabled) {
      setState(null)
      return
    }

    const tracker = flashkit.trackTransaction(hash, { submittedAt })
    setState(tracker.getState())

    const unsubscribe = tracker.on('status', ({ state: newState }) => {
      setState(newState)
    })

    return () => {
      unsubscribe()
      tracker.abort()
    }
  }, [hash, flashkit, submittedAt, enabled])

  const status = state?.status ?? 'idle'
  const timeline = state?.timeline

  return {
    hash,
    status,
    state: state ?? undefined,
    preconfirmationMs: timeline?.preconfirmationMs,
    inclusionMs: timeline?.inclusionMs,
    timeSavedMs: timeline?.timeSavedMs,
    receipt: state?.receipt,
    flashblockReceipt: state?.flashblockReceipt,
    degradedMode: state?.degradedMode ?? false,
    error: state?.error,

    isIdle: status === 'idle',
    isSubmitted: status === 'submitted',
    isPreconfirmed: status === 'preconfirmed' || status === 'included' || status === 'safe' || status === 'finalized',
    isIncluded: status === 'included' || status === 'safe' || status === 'finalized',
    isSafe: status === 'safe' || status === 'finalized',
    isFinalized: status === 'finalized',
    isSuccess: status === 'included' || status === 'safe' || status === 'finalized',
    isReverted: status === 'reverted',
    isError: status === 'error' || status === 'timeout' || status === 'reverted'
  }
}
