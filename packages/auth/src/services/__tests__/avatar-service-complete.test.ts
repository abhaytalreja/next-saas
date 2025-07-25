import { AvatarService } from '../avatar-service'

// Import the test utilities which set up all the mocks we need
import { createMockFile } from '../../test-utils'

// The setup.ts file has already configured all global mocks we need

describe('AvatarService', () => {
  let avatarService: AvatarService
  const mockUserId = 'user-123'
  const mockAvatarId = 'avatar-123'

  beforeEach(() => {
    jest.clearAllMocks()
    avatarService = new AvatarService()
    
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://storage.example.com/avatar.webp' })
    })
  })

  describe('Constructor and Initialization', () => {
    it('creates service with Backblaze storage provider', () => {
      const service = new AvatarService()
      expect(service).toBeInstanceOf(AvatarService)
    })
  })

  describe('Avatar Upload', () => {
    const mockFile = new File(['mock content'], 'avatar.jpg', { type: 'image/jpeg', size: 1024 })

    it('successfully uploads avatar with image processing', async () => {
      // Simulate image processing
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)

      const result = await avatarService.uploadAvatar(mockFile, mockUserId)

      expect(result.success).toBe(true)
      expect(result.avatar).toBeDefined()
    })

    it('validates file size limits', async () => {
      const oversizedFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      Object.defineProperty(oversizedFile, 'size', { value: 10 * 1024 * 1024 })

      const result = await avatarService.uploadAvatar(oversizedFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('File size must be less than')
    })

    it('validates file type restrictions', async () => {
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })

      const result = await avatarService.uploadAvatar(invalidFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid file type. Please use JPEG, PNG, or WebP')
    })

    it('handles upload failures gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' })
      })

      const result = await avatarService.uploadAvatar(mockFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Upload failed')
    })

    it('handles image processing failures', async () => {
      // Simulate image processing error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror()
      }, 0)

      const result = await avatarService.uploadAvatar(mockFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to process image')
    })

    it('processes different image formats correctly', async () => {
      const pngFile = new File(['png'], 'avatar.png', { type: 'image/png' })
      
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)

      const result = await avatarService.uploadAvatar(pngFile, mockUserId)

      expect(result.success).toBe(true)
    })
  })

  describe('Avatar Activation', () => {
    it('successfully activates an avatar', async () => {
      const result = await avatarService.activateAvatar(mockAvatarId, mockUserId)

      expect(result).toBe(true)
    })

    it('handles activation errors', async () => {
      // Mock Supabase error
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => createMockChain({
          data: null,
          error: { message: 'Database error' }
        }))
      }))

      const result = await avatarService.activateAvatar(mockAvatarId, mockUserId)

      expect(result).toBe(false)
    })
  })

  describe('Avatar Deletion', () => {
    it('successfully deletes avatar from storage and database', async () => {
      // Mock successful avatar fetch
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => ({
          from: jest.fn(() => ({
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { storage_path: 'user-123/avatar.webp', is_active: true },
                  error: null
                }))
              }))
            })),
            delete: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null }))
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ error: null }))
            }))
          }))
        }))
      }))

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })

      const result = await avatarService.deleteAvatar(mockAvatarId, mockUserId)

      expect(result).toBe(true)
    })

    it('handles deletion when avatar not found', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => createMockChain({
          data: null,
          error: { code: 'PGRST116' }
        }))
      }))

      const result = await avatarService.deleteAvatar(mockAvatarId, mockUserId)

      expect(result).toBe(false)
    })
  })

  describe('Avatar Retrieval', () => {
    const mockAvatars = [
      {
        id: 'avatar-1',
        user_id: mockUserId,
        storage_path: 'user-123/avatar-1.webp',
        public_url: 'https://storage.example.com/avatar-1.webp',
        is_active: true
      },
      {
        id: 'avatar-2',
        user_id: mockUserId,
        storage_path: 'user-123/avatar-2.webp',
        public_url: 'https://storage.example.com/avatar-2.webp',
        is_active: false
      }
    ]

    it('retrieves all user avatars', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => createMockChain({
          data: mockAvatars,
          error: null
        }))
      }))

      const result = await avatarService.getUserAvatars(mockUserId)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('avatar-1')
    })

    it('retrieves current active avatar', async () => {
      const activeAvatar = mockAvatars[0]
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => createMockChain({
          data: activeAvatar,
          error: null
        }))
      }))

      const result = await avatarService.getCurrentAvatar(mockUserId)

      expect(result).toEqual(activeAvatar)
    })

    it('returns null when no active avatar exists', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => createMockChain({
          data: null,
          error: { code: 'PGRST116' }
        }))
      }))

      const result = await avatarService.getCurrentAvatar(mockUserId)

      expect(result).toBeNull()
    })

    it('handles database errors gracefully in retrieval', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => createMockChain({
          data: null,
          error: { message: 'Database connection failed' }
        }))
      }))

      const result = await avatarService.getUserAvatars(mockUserId)

      expect(result).toEqual([])
    })
  })

  describe('File Validation', () => {
    it('accepts valid image files', () => {
      const service = new AvatarService()
      const validFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg', size: 1024 })
      
      const result = service['validateAvatarFile'](validFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        quality: 0.9,
        outputSize: 256
      })

      expect(result.valid).toBe(true)
    })

    it('rejects oversized files', () => {
      const service = new AvatarService()
      const oversizedFile = new File(['content'], 'large.jpg', { 
        type: 'image/jpeg',
        size: 10 * 1024 * 1024
      })
      Object.defineProperty(oversizedFile, 'size', { value: 10 * 1024 * 1024 })

      const result = service['validateAvatarFile'](oversizedFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        quality: 0.9,
        outputSize: 256
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size must be less than')
    })

    it('rejects invalid file types', () => {
      const service = new AvatarService()
      const invalidFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' })

      const result = service['validateAvatarFile'](invalidFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        quality: 0.9,
        outputSize: 256
      })

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid file type. Please use JPEG, PNG, or WebP')
    })

    it('rejects non-image files', () => {
      const service = new AvatarService()
      const textFile = new File(['text'], 'file.txt', { type: 'text/plain' })

      const result = service['validateAvatarFile'](textFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['text/plain'],
        quality: 0.9,
        outputSize: 256
      })

      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must be an image')
    })
  })

  describe('Image Processing', () => {
    it('processes images with correct dimensions', async () => {
      const service = new AvatarService()
      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })

      // Simulate successful image processing
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload()
      }, 0)

      const result = await service['processImage'](mockFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        quality: 0.9,
        outputSize: 256
      })

      expect(mockCanvas.width).toBe(256)
      expect(mockCanvas.height).toBe(256)
    })

    it('handles image processing errors', async () => {
      const service = new AvatarService()
      const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })

      // Simulate image processing error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror()
      }, 0)

      const result = await service['processImage'](mockFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        quality: 0.9,
        outputSize: 256
      })

      expect(result).toBeNull()
    })
  })

  describe('Cleanup Operations', () => {
    it('cleans up expired avatar uploads', async () => {
      const expiredAvatars = [
        { storage_path: 'user-123/expired-1.webp' },
        { storage_path: 'user-123/expired-2.webp' }
      ]

      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => ({
          from: jest.fn(() => ({
            select: jest.fn(() => ({
              lt: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({
                  data: expiredAvatars,
                  error: null
                }))
              }))
            })),
            update: jest.fn(() => ({
              lt: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null }))
              }))
            }))
          }))
        }))
      }))

      ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })

      await avatarService.cleanupExpiredAvatars()

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('handles cleanup errors gracefully', async () => {
      jest.doMock('@supabase/auth-helpers-nextjs', () => ({
        createClientComponentClient: jest.fn(() => ({
          from: jest.fn(() => {
            throw new Error('Database error')
          })
        }))
      }))

      // Should not throw
      await expect(avatarService.cleanupExpiredAvatars()).resolves.toBeUndefined()
    })
  })

  describe('File Extension Detection', () => {
    it('correctly maps MIME types to extensions', () => {
      const service = new AvatarService()
      
      expect(service['getFileExtension']('image/jpeg')).toBe('jpg')
      expect(service['getFileExtension']('image/jpg')).toBe('jpg')
      expect(service['getFileExtension']('image/png')).toBe('png')
      expect(service['getFileExtension']('image/webp')).toBe('webp')
      expect(service['getFileExtension']('image/unknown')).toBe('jpg')
    })
  })
})