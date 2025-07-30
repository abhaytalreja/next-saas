// Jest setup for billing package
const { TextEncoder, TextDecoder } = require('util')

// Add jest-dom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && received !== undefined && document.contains(received)
    return {
      message: () => pass ? 
        `Expected element not to be in the document` : 
        `Expected element to be in the document`,
      pass
    }
  }
})

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn()
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  writable: true
})