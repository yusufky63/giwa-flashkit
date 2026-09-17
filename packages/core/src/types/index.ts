import type {
  Address,
  Chain,
  Hex,
  PublicClient,
  TransactionReceipt
} from 'viem'

export type FlashTransactionStatus =
  | 'idle'
  | 'submitted'
  | 'preconfirmed'
  | 'included'
  | 'safe'
  | 'finalized'
  | 'reverted'
  | 'replaced'
  | 'dropped'
  | 'timeout'
  | 'error'

export interface FlashKitRpcConfig {
  canonical?: string
  flashblocks?: string
}

export interface FlashKitPollingConfig {
  preconfIntervalMs?: number // fast polling (default 100ms)
  inclusionIntervalMs?: number // standard polling (default 300ms)
  finalityIntervalMs?: number // slow polling (default 2000ms)
  timeoutMs?: number // overall timeout (default 60000ms)
  preconfTimeoutMs?: number // timeout before falling back to canonical only (default 5000ms)
}

export interface FlashKitConfig {
  network?: 'giwaSepolia'
  chain?: Chain
  rpc?: FlashKitRpcConfig
  polling?: FlashKitPollingConfig
  debug?: boolean
}

export interface TransactionTimeline {
  submittedAt?: number
  preconfirmedAt?: number
  includedAt?: number
  safeAt?: number
  finalizedAt?: number

  preconfirmationMs?: number
  inclusionMs?: number
  timeSavedMs?: number
}

export interface FlashTransactionState {
  hash: Hex
  status: FlashTransactionStatus
  timeline: TransactionTimeline
  receipt?: TransactionReceipt
  flashblockReceipt?: Partial<TransactionReceipt>
  error?: Error
  degradedMode: boolean
  blockNumber?: bigint
}

export interface FlashSimulationParams {
  account?: Address
  to: Address
  data?: Hex
  value?: bigint
  gas?: bigint
}

export interface FlashSimulationResult {
  success: boolean
  gasUsed: bigint
  returnData: Hex
  revertReason?: string
  calls?: unknown[]
  transfers?: unknown[]
  raw?: unknown
  durationMs: number
}

export type TransactionEvent =
  | 'status'
  | 'submitted'
  | 'preconfirmed'
  | 'included'
  | 'safe'
  | 'finalized'
  | 'reverted'
  | 'replaced'
  | 'timeout'
  | 'error'

export interface TransactionEventDataMap {
  status: { status: FlashTransactionStatus; state: FlashTransactionState }
  submitted: { state: FlashTransactionState }
  preconfirmed: { latencyMs: number; state: FlashTransactionState }
  included: { latencyMs: number; blockNumber: bigint; state: FlashTransactionState }
  safe: { state: FlashTransactionState }
  finalized: { state: FlashTransactionState }
  reverted: { reason?: string; state: FlashTransactionState }
  replaced: { newHash: Hex; state: FlashTransactionState }
  timeout: { stage: string; state: FlashTransactionState }
  error: { error: Error; state: FlashTransactionState }
}

export type TransactionEventListener<E extends TransactionEvent> = (
  data: TransactionEventDataMap[E]
) => void

export interface TransactionTracker {
  hash: Hex
  getState(): FlashTransactionState
  on<E extends TransactionEvent>(event: E, listener: TransactionEventListener<E>): () => void
  off<E extends TransactionEvent>(event: E, listener: TransactionEventListener<E>): void
  waitFor(targetStatus: FlashTransactionStatus): Promise<FlashTransactionState>
  abort(): void
}

export interface FlashKit {
  canonicalClient: any
  flashClient: any
  config: Required<FlashKitConfig>
  trackTransaction(hash: Hex, options?: { submittedAt?: number }): TransactionTracker
  simulate(params: FlashSimulationParams): Promise<FlashSimulationResult>
  checkRpcHealth(): Promise<{ canonical: boolean; flashblocks: boolean; degraded: boolean }>
}
