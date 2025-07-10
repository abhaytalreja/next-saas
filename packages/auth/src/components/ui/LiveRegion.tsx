'use client'

import React from 'react'
import { useAnnouncements } from '../../hooks/useAnnouncements'

export function LiveRegion() {
  const { messages } = useAnnouncements()

  return (
    <>
      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {messages
          .filter(msg => msg.priority === 'polite')
          .map(msg => (
            <div key={msg.id}>{msg.message}</div>
          ))
        }
      </div>

      {/* Assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {messages
          .filter(msg => msg.priority === 'assertive')
          .map(msg => (
            <div key={msg.id}>{msg.message}</div>
          ))
        }
      </div>
    </>
  )
}

// Screen reader only class
export const srOnly = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`