import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createFlashKit, type FlashKit, type FlashKitConfig } from '@flashkit/core'

const FlashKitContext = createContext<FlashKit | null>(null)

export interface FlashKitProviderProps {
  children: ReactNode
  client?: FlashKit
  config?: FlashKitConfig
}

export function FlashKitProvider({ children, client, config }: FlashKitProviderProps) {
  const flashkit = useMemo(() => {
    if (client) return client
    return createFlashKit(config)
  }, [client, config])

  return (
    <FlashKitContext.Provider value={flashkit}>
      {children}
    </FlashKitContext.Provider>
  )
}

export function useFlashKitInstance(customClient?: FlashKit): FlashKit {
  const context = useContext(FlashKitContext)
  if (customClient) return customClient
  if (context) return context
  // Default fallback singleton
  return useMemo(() => createFlashKit(), [])
}
