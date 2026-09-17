export class FallbackCoordinator {
  private _flashblocksAvailable = true
  private _lastFailureTimestamp = 0
  private readonly cooldownMs: number

  constructor(cooldownMs = 30_000) {
    this.cooldownMs = cooldownMs
  }

  get isFlashblocksAvailable(): boolean {
    if (!this._flashblocksAvailable) {
      if (Date.now() - this._lastFailureTimestamp > this.cooldownMs) {
        // Cooldown passed, probe again
        this._flashblocksAvailable = true
      }
    }
    return this._flashblocksAvailable
  }

  markFlashblocksFailure(): void {
    this._flashblocksAvailable = false
    this._lastFailureTimestamp = Date.now()
  }

  markFlashblocksHealthy(): void {
    this._flashblocksAvailable = true
  }
}
