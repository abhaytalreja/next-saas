import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import { setupTestEnvironment } from './index'

// Setup test environment
setupTestEnvironment()

// Mock console methods to reduce noise
const originalError = console.error
const originalWarn = console.warn

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation((message) => {
    // Allow React error boundary errors to be logged
    if (typeof message === 'string' && message.includes('Error boundary')) {
      originalError(message)
    }
    // Suppress other console.error calls during tests
  })
  
  jest.spyOn(console, 'warn').mockImplementation(() => {
    // Suppress console.warn calls during tests
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  console.error = originalError
  console.warn = originalWarn
})

// Global test configuration
beforeAll(() => {
  // Set timezone for consistent date formatting in tests
  process.env.TZ = 'UTC'
  
  // Set test environment variables
  process.env.NEXT_PUBLIC_DISABLE_EMAIL_CONFIRMATION = 'true'
  
  // Mock global APIs for avatar service and file operations
  setupGlobalMocks()
})

afterAll(() => {
  // Cleanup
  delete process.env.TZ
})

function setupGlobalMocks() {
  // Mock global fetch for HTTP requests
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ url: 'https://mock-storage.example.com/file.webp' }),
      blob: () => Promise.resolve(new Blob(['mock content'], { type: 'image/webp' })),
      text: () => Promise.resolve('mock response'),
      headers: new Headers(),
      redirected: false,
      type: 'default' as ResponseType,
      url: 'https://mock-api.example.com'
    } as Response)
  )

  // Mock Canvas API for image processing
  const mockCanvas = {
    width: 256,
    height: 256,
    getContext: jest.fn(() => ({
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(256 * 256 * 4)
      })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(256 * 256 * 4),
        width: 256,
        height: 256
      }))
    })),
    toBlob: jest.fn((callback, type = 'image/webp', quality = 0.8) => {
      const mockBlob = new Blob(['mock image data'], { type })
      callback(mockBlob)
    }),
    toDataURL: jest.fn(() => 'data:image/webp;base64,mockdata')
  }

  global.HTMLCanvasElement = jest.fn(() => mockCanvas) as any
  
  // Mock document.createElement for canvas
  const originalCreateElement = global.document?.createElement
  global.document = global.document || ({} as any)
  global.document.createElement = jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas as any
    }
    return originalCreateElement ? originalCreateElement.call(document, tagName) : {}
  })

  // Mock Image constructor
  const mockImage = {
    onload: null as any,
    onerror: null as any,
    onabort: null as any,
    width: 500,
    height: 500,
    src: '',
    naturalWidth: 500,
    naturalHeight: 500,
    complete: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }

  global.Image = jest.fn(() => {
    const img = { ...mockImage }
    // Simulate successful image load
    setTimeout(() => {
      img.complete = true
      if (img.onload) img.onload({} as any)
    }, 0)
    return img
  }) as any

  // Mock URL API
  global.URL = global.URL || {
    createObjectURL: jest.fn(() => 'mock-object-url'),
    revokeObjectURL: jest.fn()
  }

  // Mock crypto.subtle for file hashing
  global.crypto = global.crypto || ({
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
    },
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
    randomUUID: jest.fn(() => 'mock-uuid-1234-5678-9012-123456789012')
  } as any)

  // Mock FileReader
  global.FileReader = jest.fn(() => ({
    onload: null,
    onerror: null,
    onabort: null,
    readAsDataURL: jest.fn(function(this: any) {
      setTimeout(() => {
        this.result = 'data:image/jpeg;base64,mockdata'
        if (this.onload) this.onload({ target: this })
      }, 0)
    }),
    readAsText: jest.fn(function(this: any) {
      setTimeout(() => {
        this.result = 'mock file content'
        if (this.onload) this.onload({ target: this })
      }, 0)
    }),
    result: null,
    error: null,
    readyState: 0
  })) as any
}