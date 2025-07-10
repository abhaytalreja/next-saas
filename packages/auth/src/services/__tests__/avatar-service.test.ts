import { AvatarService } from '../avatar-service'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs')
const mockSupabase = {
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
}

// Mock AWS S3 client
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}))

// Mock Sharp for image processing
jest.mock('sharp', () => {
  const mockSharp = {
    metadata: jest.fn().mockReturnValue({
      width: 1000,
      height: 1000,
      format: 'jpeg',
    }),
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image')),
  }
  return jest.fn(() => mockSharp)
})

describe('AvatarService', () => {
  let avatarService: AvatarService
  let mockFromTable: jest.Mock
  let mockFromStorage: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockFromTable = jest.fn()
    mockFromStorage = jest.fn()
    
    mockSupabase.from.mockReturnValue(mockFromTable)
    mockSupabase.storage.from.mockReturnValue(mockFromStorage)
    
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase)
    
    avatarService = new AvatarService()
  })

  describe('uploadAvatar', () => {
    const mockFile = new File(['test content'], 'avatar.jpg', { type: 'image/jpeg' })
    const userId = 'user-123'

    it('successfully uploads and processes avatar', async () => {
      // Mock successful database operations
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'avatar-123',
              user_id: userId,
              file_path: 'avatars/user-123/avatar-123.jpg',
              variants: {
                thumbnail: { url: 'https://example.com/thumb.jpg', width: 64, height: 64 },
                small: { url: 'https://example.com/small.jpg', width: 128, height: 128 },
                medium: { url: 'https://example.com/medium.jpg', width: 256, height: 256 },
                large: { url: 'https://example.com/large.jpg', width: 512, height: 512 },
              }
            },
            error: null
          })
        })
      })
      mockFromTable.mockReturnValue({ insert: mockInsert })

      const result = await avatarService.uploadAvatar(userId, mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.id).toBe('avatar-123')
      expect(result.data?.variants).toBeDefined()
      expect(Object.keys(result.data?.variants || {})).toHaveLength(4)
    })

    it('replaces existing avatar when replaceExisting is true', async () => {
      // Mock existing avatar query
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'old-avatar-123', file_path: 'old-path.jpg' },
            error: null
          })
        })
      })
      
      // Mock delete operation
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })

      // Mock insert operation
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'new-avatar-123' },
            error: null
          })
        })
      })

      mockFromTable
        .mockReturnValueOnce({ select: mockSelect }) // For existing avatar check
        .mockReturnValueOnce({ delete: mockDelete }) // For deleting old avatar
        .mockReturnValueOnce({ insert: mockInsert }) // For inserting new avatar

      const result = await avatarService.uploadAvatar(userId, mockFile, { replaceExisting: true })

      expect(result.success).toBe(true)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockDelete).toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })
      mockFromTable.mockReturnValue({ insert: mockInsert })

      const result = await avatarService.uploadAvatar(userId, mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database error')
    })

    it('validates file size', async () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      
      const result = await avatarService.uploadAvatar(userId, largeFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('validates file type', async () => {
      const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
      
      const result = await avatarService.uploadAvatar(userId, invalidFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('handles image processing errors', async () => {
      const Sharp = require('sharp')
      const mockSharp = Sharp()
      mockSharp.toBuffer.mockRejectedValue(new Error('Processing failed'))

      const result = await avatarService.uploadAvatar(userId, mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to process image')
    })
  })

  describe('deleteAvatar', () => {
    const avatarId = 'avatar-123'
    const userId = 'user-123'

    it('successfully deletes avatar and files', async () => {
      // Mock avatar lookup
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: avatarId,
              user_id: userId,
              file_path: 'avatars/user-123/avatar-123.jpg',
              variants: {
                thumbnail: { url: 'thumb.jpg' },
                small: { url: 'small.jpg' },
                medium: { url: 'medium.jpg' },
                large: { url: 'large.jpg' }
              }
            },
            error: null
          })
        })
      })

      // Mock delete operations
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })

      const mockStorageRemove = jest.fn().mockResolvedValue({ error: null })

      mockFromTable
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete })
      
      mockFromStorage.mockReturnValue({ remove: mockStorageRemove })

      const result = await avatarService.deleteAvatar(avatarId, userId)

      expect(result.success).toBe(true)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockDelete).toHaveBeenCalled()
      expect(mockStorageRemove).toHaveBeenCalled()
    })

    it('fails when avatar not found', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Avatar not found' }
          })
        })
      })

      mockFromTable.mockReturnValue({ select: mockSelect })

      const result = await avatarService.deleteAvatar(avatarId, userId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Avatar not found')
    })

    it('fails when user does not own avatar', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: avatarId,
              user_id: 'different-user',
              file_path: 'avatars/user-123/avatar-123.jpg'
            },
            error: null
          })
        })
      })

      mockFromTable.mockReturnValue({ select: mockSelect })

      const result = await avatarService.deleteAvatar(avatarId, userId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not authorized')
    })

    it('continues deletion even if storage removal fails', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: avatarId,
              user_id: userId,
              file_path: 'avatars/user-123/avatar-123.jpg'
            },
            error: null
          })
        })
      })

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })

      const mockStorageRemove = jest.fn().mockResolvedValue({ 
        error: { message: 'Storage error' } 
      })

      mockFromTable
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete })
      
      mockFromStorage.mockReturnValue({ remove: mockStorageRemove })

      const result = await avatarService.deleteAvatar(avatarId, userId)

      expect(result.success).toBe(true) // Still succeeds despite storage error
      expect(mockDelete).toHaveBeenCalled()
    })
  })

  describe('getAvatarVariants', () => {
    it('generates correct variant URLs for Backblaze', () => {
      const filePath = 'avatars/user-123/avatar-123.jpg'
      const variants = avatarService['getAvatarVariants'](filePath)

      expect(variants).toHaveProperty('thumbnail')
      expect(variants).toHaveProperty('small')
      expect(variants).toHaveProperty('medium')
      expect(variants).toHaveProperty('large')

      expect(variants.thumbnail.width).toBe(64)
      expect(variants.small.width).toBe(128)
      expect(variants.medium.width).toBe(256)
      expect(variants.large.width).toBe(512)

      // Check URL format
      expect(variants.thumbnail.url).toContain('64x64')
      expect(variants.medium.url).toContain('256x256')
    })
  })

  describe('validateImage', () => {
    it('accepts valid image types', () => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      
      validTypes.forEach(type => {
        const file = new File(['content'], 'image.jpg', { type })
        const isValid = avatarService['validateImage'](file)
        expect(isValid).toBe(true)
      })
    })

    it('rejects invalid file types', () => {
      const invalidTypes = ['text/plain', 'application/pdf', 'video/mp4']
      
      invalidTypes.forEach(type => {
        const file = new File(['content'], 'file.txt', { type })
        const isValid = avatarService['validateImage'](file)
        expect(isValid).toBe(false)
      })
    })

    it('rejects files that are too large', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      })
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 })
      
      const isValid = avatarService['validateImage'](largeFile)
      expect(isValid).toBe(false)
    })

    it('rejects empty files', () => {
      const emptyFile = new File([''], 'empty.jpg', { type: 'image/jpeg' })
      Object.defineProperty(emptyFile, 'size', { value: 0 })
      
      const isValid = avatarService['validateImage'](emptyFile)
      expect(isValid).toBe(false)
    })
  })

  describe('generateFilePath', () => {
    it('generates consistent file paths', () => {
      const userId = 'user-123'
      const extension = 'jpg'
      
      const path1 = avatarService['generateFilePath'](userId, extension)
      const path2 = avatarService['generateFilePath'](userId, extension)
      
      expect(path1).toMatch(/^avatars\/user-123\/[\w-]+\.jpg$/)
      expect(path1).not.toBe(path2) // Should be unique
    })

    it('handles different file extensions', () => {
      const userId = 'user-123'
      
      const jpgPath = avatarService['generateFilePath'](userId, 'jpg')
      const pngPath = avatarService['generateFilePath'](userId, 'png')
      
      expect(jpgPath).toEndWith('.jpg')
      expect(pngPath).toEndWith('.png')
    })
  })
})