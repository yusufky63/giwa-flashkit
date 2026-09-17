import { useCallback, useState } from 'react'
import type { FlashKit, FlashSimulationParams, FlashSimulationResult } from '@flashkit/core'
import { useFlashKitInstance } from '../context/FlashKitContext'

export interface UseFlashSimulationOptions {
  flashkit?: FlashKit
}

export function useFlashSimulation(options: UseFlashSimulationOptions = {}) {
  const flashkit = useFlashKitInstance(options.flashkit)
  const [result, setResult] = useState<FlashSimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const simulate = useCallback(
    async (params: FlashSimulationParams): Promise<FlashSimulationResult> => {
      setIsLoading(true)
      setError(null)
      try {
        const simResult = await flashkit.simulate(params)
        setResult(simResult)
        return simResult
      } catch (err) {
        const normalizedErr = err instanceof Error ? err : new Error(String(err))
        setError(normalizedErr)
        throw normalizedErr
      } finally {
        setIsLoading(false)
      }
    },
    [flashkit]
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    simulate,
    reset,
    result,
    isLoading,
    error,
    isSuccess: result?.success ?? false
  }
}
