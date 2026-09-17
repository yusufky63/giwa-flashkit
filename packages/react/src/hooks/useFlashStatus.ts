import { useEffect, useState } from 'react'
import type { FlashKit } from '@flashkit/core'
import { useFlashKitInstance } from '../context/FlashKitContext'

export interface FlashRpcStatusState {
  canonical: boolean
  flashblocks: boolean
  degraded: boolean
  isChecking: boolean
  lastChecked?: number
}

export function useFlashStatus(customFlashkit?: FlashKit, intervalMs = 30_000) {
  const flashkit = useFlashKitInstance(customFlashkit)
  const [status, setStatus] = useState<FlashRpcStatusState>({
    canonical: true,
    flashblocks: true,
    degraded: false,
    isChecking: true
  })

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const health = await flashkit.checkRpcHealth()
        if (mounted) {
          setStatus({
            canonical: health.canonical,
            flashblocks: health.flashblocks,
            degraded: health.degraded,
            isChecking: false,
            lastChecked: Date.now()
          })
        }
      } catch {
        if (mounted) {
          setStatus((prev) => ({ ...prev, isChecking: false }))
        }
      }
    }

    check()
    const timer = setInterval(check, intervalMs)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [flashkit, intervalMs])

  return status
}
