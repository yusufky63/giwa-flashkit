import type { Hex } from 'viem'

export interface FlashKitErrorOptions {
  cause?: unknown
  retryable?: boolean
  rpc?: string
  transactionHash?: Hex
}

export class FlashKitError extends Error {
  readonly code: string
  readonly retryable: boolean
  readonly rpc?: string
  readonly transactionHash?: Hex

  constructor(code: string, message: string, options: FlashKitErrorOptions = {}) {
    super(message)
    this.name = 'FlashKitError'
    this.code = code
    this.retryable = options.retryable ?? false
    this.rpc = options.rpc
    this.transactionHash = options.transactionHash
    if (options.cause) {
      this.cause = options.cause
    }
  }
}

export class FlashRpcUnavailableError extends FlashKitError {
  constructor(message = 'GIWA Flashblocks RPC is unavailable or not responding.', options: FlashKitErrorOptions = {}) {
    super('FLASH_RPC_UNAVAILABLE', message, { ...options, retryable: true })
    this.name = 'FlashRpcUnavailableError'
  }
}

export class CanonicalRpcUnavailableError extends FlashKitError {
  constructor(message = 'GIWA Standard Canonical RPC is unreachable.', options: FlashKitErrorOptions = {}) {
    super('CANONICAL_RPC_UNAVAILABLE', message, { ...options, retryable: true })
    this.name = 'CanonicalRpcUnavailableError'
  }
}

export class FlashRateLimitError extends FlashKitError {
  constructor(message = 'Rate limit (HTTP 429) encountered on GIWA RPC endpoint.', options: FlashKitErrorOptions = {}) {
    super('RATE_LIMIT_EXCEEDED', message, { ...options, retryable: true })
    this.name = 'FlashRateLimitError'
  }
}

export class TransactionTimeoutError extends FlashKitError {
  constructor(message = 'Transaction tracking timed out before reaching requested state.', options: FlashKitErrorOptions = {}) {
    super('TRANSACTION_TIMEOUT', message, options)
    this.name = 'TransactionTimeoutError'
  }
}

export class TransactionRevertedError extends FlashKitError {
  constructor(message = 'Transaction was reverted by EVM on GIWA.', options: FlashKitErrorOptions = {}) {
    super('TRANSACTION_REVERTED', message, options)
    this.name = 'TransactionRevertedError'
  }
}

export class TransactionReplacedError extends FlashKitError {
  readonly newHash?: Hex
  constructor(newHash?: Hex, message = 'Transaction was replaced by another transaction with higher gas.', options: FlashKitErrorOptions = {}) {
    super('TRANSACTION_REPLACED', message, { ...options, transactionHash: newHash })
    this.name = 'TransactionReplacedError'
    this.newHash = newHash
  }
}

export class SimulationError extends FlashKitError {
  constructor(message = 'Simulation failed or reverted on GIWA Flashblocks state.', options: FlashKitErrorOptions = {}) {
    super('SIMULATION_ERROR', message, options)
    this.name = 'SimulationError'
  }
}

export class UnsupportedNetworkError extends FlashKitError {
  constructor(message = 'Network not supported. FlashKit currently supports GIWA Sepolia only (Chain ID 91342).', options: FlashKitErrorOptions = {}) {
    super('UNSUPPORTED_NETWORK', message, options)
    this.name = 'UnsupportedNetworkError'
  }
}
