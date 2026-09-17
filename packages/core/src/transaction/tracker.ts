import type { Hex, PublicClient } from 'viem'
import {
  FlashRateLimitError,
  TransactionRevertedError,
  TransactionTimeoutError
} from '../errors/errors'
import { computeTimelineMetrics } from '../metrics/latency'
import type { FallbackCoordinator } from '../rpc/fallback'
import type {
  FlashKitConfig,
  FlashTransactionState,
  FlashTransactionStatus,
  TransactionEvent,
  TransactionEventListener,
  TransactionTracker
} from '../types'
import { checkBlockFinality } from './finality'
import { assertValidTransition } from './lifecycle'
import { fetchCanonicalReceipt, fetchPreconfirmationReceipt } from './receipt'

export class DefaultTransactionTracker implements TransactionTracker {
  readonly hash: Hex
  private readonly canonicalClient: PublicClient
  private readonly flashClient: PublicClient
  private readonly config: Required<FlashKitConfig>
  private readonly fallbackCoordinator: FallbackCoordinator

  private state: FlashTransactionState
  private readonly listeners: Map<TransactionEvent, Set<TransactionEventListener<any>>> = new Map()
  private readonly abortController = new AbortController()
  private isTracking = false

  constructor(
    hash: Hex,
    canonicalClient: PublicClient,
    flashClient: PublicClient,
    config: Required<FlashKitConfig>,
    fallbackCoordinator: FallbackCoordinator,
    options?: { submittedAt?: number }
  ) {
    this.hash = hash
    this.canonicalClient = canonicalClient
    this.flashClient = flashClient
    this.config = config
    this.fallbackCoordinator = fallbackCoordinator

    const submittedAt = options?.submittedAt ?? performance.now()

    this.state = {
      hash,
      status: 'submitted',
      timeline: {
        submittedAt
      },
      degradedMode: !fallbackCoordinator.isFlashblocksAvailable
    }

    // Start tracking asynchronously
    queueMicrotask(() => {
      this.startTracking().catch((err) => {
        this.transitionTo('error', { error: err })
      })
    })
  }

  getState(): FlashTransactionState {
    return { ...this.state, timeline: { ...this.state.timeline } }
  }

  on<E extends TransactionEvent>(event: E, listener: TransactionEventListener<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)

    return () => this.off(event, listener)
  }

  off<E extends TransactionEvent>(event: E, listener: TransactionEventListener<E>): void {
    const set = this.listeners.get(event)
    if (set) {
      set.delete(listener)
    }
  }

  async waitFor(targetStatus: FlashTransactionStatus): Promise<FlashTransactionState> {
    if (this.state.status === targetStatus) {
      return this.getState()
    }

    // If already passed or in terminal error state
    if (this.state.status === 'finalized' || this.state.status === 'reverted' || this.state.status === 'error' || this.state.status === 'timeout') {
      return this.getState()
    }

    return new Promise<FlashTransactionState>((resolve, reject) => {
      const cleanup = this.on('status', ({ status, state }) => {
        if (status === targetStatus) {
          cleanup()
          resolve(state)
        } else if (status === 'reverted' || status === 'error' || status === 'timeout') {
          cleanup()
          if (status === 'reverted') reject(new TransactionRevertedError())
          else if (status === 'timeout') reject(new TransactionTimeoutError())
          else reject(state.error ?? new Error(`Failed with status: ${status}`))
        }
      })

      if (this.abortController.signal.aborted) {
        cleanup()
        reject(new Error('Tracking was aborted'))
      }
    })
  }

  abort(): void {
    this.abortController.abort()
  }

  private emit<E extends TransactionEvent>(event: E, data: any): void {
    const set = this.listeners.get(event)
    if (set) {
      for (const listener of set) {
        try {
          listener(data)
        } catch (err) {
          console.error(`Error in listener for event ${event}:`, err)
        }
      }
    }
  }

  private transitionTo(newStatus: FlashTransactionStatus, updates: Partial<FlashTransactionState> = {}): void {
    if (this.state.status === newStatus) return

    assertValidTransition(this.state.status, newStatus)

    this.state = {
      ...this.state,
      ...updates,
      status: newStatus,
      timeline: computeTimelineMetrics({
        ...this.state.timeline,
        ...updates.timeline
      })
    }

    this.emit('status', { status: newStatus, state: this.getState() })
    this.emit(newStatus as TransactionEvent, { state: this.getState(), ...updates })
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms)
      this.abortController.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer)
          reject(new Error('Aborted'))
        },
        { once: true }
      )
    })
  }

  private async startTracking(): Promise<void> {
    if (this.isTracking) return
    this.isTracking = true

    const startTime = performance.now()
    const {
      preconfIntervalMs = 100,
      inclusionIntervalMs = 300,
      finalityIntervalMs = 2000,
      timeoutMs = 60_000,
      preconfTimeoutMs = 5_000
    } = this.config.polling

    this.emit('submitted', { state: this.getState() })

    let preconfirmed = false
    let included = false

    // Stage 1: Preconfirmation Detection
    const canAttemptPreconf = this.fallbackCoordinator.isFlashblocksAvailable

    while (
      !preconfirmed &&
      !included &&
      performance.now() - startTime < preconfTimeoutMs &&
      !this.abortController.signal.aborted
    ) {
      if (canAttemptPreconf) {
        try {
          const receipt = await fetchPreconfirmationReceipt(this.flashClient, this.hash)
          if (receipt) {
            preconfirmed = true
            const preconfirmedAt = performance.now()
            this.transitionTo('preconfirmed', {
              flashblockReceipt: receipt,
              timeline: { preconfirmedAt }
            })
            break
          }
        } catch (err) {
          // If 429 or network fail, mark coordinator
          const msg = String(err)
          if (msg.includes('429')) {
            this.fallbackCoordinator.markFlashblocksFailure()
          }
        }
      }

      // Also check canonical simultaneously in case preconfirmation was skipped
      try {
        const standardReceipt = await fetchCanonicalReceipt(this.canonicalClient, this.hash)
        if (standardReceipt && standardReceipt.blockNumber) {
          included = true
          this.handleInclusion(standardReceipt)
          break
        }
      } catch {
        // Continue
      }

      await this.sleep(preconfIntervalMs)
    }

    // Stage 2: Canonical Block Inclusion
    while (
      !included &&
      performance.now() - startTime < timeoutMs &&
      !this.abortController.signal.aborted
    ) {
      try {
        const standardReceipt = await fetchCanonicalReceipt(this.canonicalClient, this.hash)
        if (standardReceipt && standardReceipt.blockNumber) {
          included = true
          this.handleInclusion(standardReceipt)
          break
        }
      } catch (err) {
        const msg = String(err)
        if (msg.includes('429')) {
          await this.sleep(1000)
          continue
        }
      }

      await this.sleep(inclusionIntervalMs)
    }

    if (!included) {
      if (this.abortController.signal.aborted) return
      this.transitionTo('timeout', {
        error: new TransactionTimeoutError('Transaction not included within timeout window.')
      })
      return
    }

    // If reverted, stop here
    if (this.state.status === 'reverted') {
      return
    }

    // Stage 3: OP Stack Safe & Finalized Tracking
    const blockNumber = this.state.blockNumber
    if (!blockNumber) return

    let isSafe = false
    let isFinalized = false

    while (
      (!isSafe || !isFinalized) &&
      performance.now() - startTime < timeoutMs &&
      !this.abortController.signal.aborted
    ) {
      const finality = await checkBlockFinality(this.canonicalClient, blockNumber)

      if (finality.isSafe && !isSafe) {
        isSafe = true
        this.transitionTo('safe', {
          timeline: { safeAt: performance.now() }
        })
      }

      if (finality.isFinalized && !isFinalized) {
        isFinalized = true
        this.transitionTo('finalized', {
          timeline: { finalizedAt: performance.now() }
        })
        break
      }

      await this.sleep(finalityIntervalMs)
    }
  }

  private handleInclusion(receipt: any): void {
    const includedAt = performance.now()
    const isReverted = receipt.status === 'reverted' || receipt.status === '0x0' || receipt.status === 0

    if (isReverted) {
      this.transitionTo('reverted', {
        receipt,
        blockNumber: receipt.blockNumber,
        timeline: { includedAt },
        error: new TransactionRevertedError()
      })
    } else {
      this.transitionTo('included', {
        receipt,
        blockNumber: receipt.blockNumber,
        timeline: { includedAt }
      })
    }
  }
}
