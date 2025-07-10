'use client'

import { useState, useEffect, useCallback } from 'react'

interface LiveRegionMessage {
  id: string
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

export function useAnnouncements() {
  const [messages, setMessages] = useState<LiveRegionMessage[]>([])

  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newMessage: LiveRegionMessage = {
      id,
      message,
      priority,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, newMessage])

    // Auto-remove message after 5 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 5000)
  }, [])

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])

  const announceLoading = useCallback((action: string) => {
    announce(`Loading ${action}...`, 'polite')
  }, [announce])

  const announceComplete = useCallback((action: string) => {
    announce(`${action} completed`, 'polite')
  }, [announce])

  return {
    messages,
    announce,
    announceError,
    announceSuccess,
    announceLoading,
    announceComplete
  }
}