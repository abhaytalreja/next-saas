'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { getSessionManager } from '../lib/session-manager'
import type { SessionConfig } from '../types'

interface SessionProviderProps {
  children: React.ReactNode
  config?: SessionConfig
}

const SessionContext = createContext<void>(undefined)

export function SessionProvider({ children, config }: SessionProviderProps) {
  useEffect(() => {
    const sessionManager = getSessionManager(config)

    return () => {
      // Cleanup on unmount
    }
  }, [config])

  return (
    <SessionContext.Provider value={undefined}>
      {children}
    </SessionContext.Provider>
  )
}
