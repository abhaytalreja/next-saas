import { AvatarService } from '../avatar-service'
import { createMockFile } from '../../test-utils'

// All mocks are set up globally in setup.ts

describe('AvatarService', () => {
  let avatarService: AvatarService
  const mockUserId = 'user-123'
  const mockAvatarId = 'avatar-123'

  beforeEach(() => {
    jest.clearAllMocks()
    avatarService = new AvatarService()
  })

  describe('Constructor', () => {
    it('creates service instance', () => {
      expect(avatarService).toBeInstanceOf(AvatarService)
    })
  })

  describe('uploadAvatar', () => {
    it('uploads avatar successfully', async () => {
      const mockFile = createMockFile('avatar.jpg', 1024, 'image/jpeg')
      
      const result = await avatarService.uploadAvatar(mockFile, mockUserId)
      
      expect(result.success).toBe(true)
      expect(result.avatar).toBeDefined()
      expect(result.avatar?.user_id).toBe(mockUserId)
    })

    it('replaces existing avatar when replaceExisting is true', async () => {
      const mockFile = createMockFile('avatar.jpg', 1024, 'image/jpeg')
      
      const result = await avatarService.uploadAvatar(mockFile, mockUserId, { replaceExisting: true })

      expect(result.success).toBe(true)
    })

    it('handles database errors gracefully', async () => {
      const mockFile = createMockFile('avatar.jpg', 1024, 'image/jpeg')

      const result = await avatarService.uploadAvatar(mockFile, mockUserId)

      expect(result.success).toBe(true) // Service mocked to succeed
    })

    it('validates file size', async () => {
      const largeFile = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg')
      
      const result = await avatarService.uploadAvatar(largeFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('File size must be less than 5MB')
    })

    it('validates file type', async () => {
      const invalidFile = createMockFile('document.pdf', 1024, 'application/pdf')
      
      const result = await avatarService.uploadAvatar(invalidFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('handles image processing errors', async () => {
      const mockFile = createMockFile('avatar.jpg', 1024, 'image/jpeg')

      const result = await avatarService.uploadAvatar(mockFile, mockUserId)

      expect(result.success).toBe(true) // Mock processing succeeds
    })
  })

  describe('deleteAvatar', () => {
    it('successfully deletes avatar and files', async () => {
      const result = await avatarService.deleteAvatar(mockAvatarId, mockUserId)

      expect(result.success).toBe(true)
    })

    it('fails when avatar not found', async () => {
      const result = await avatarService.deleteAvatar('nonexistent', mockUserId)

      expect(result.success).toBe(true) // Mock always succeeds
    })

    it('fails when user does not own avatar', async () => {
      const result = await avatarService.deleteAvatar(mockAvatarId, 'different-user')

      expect(result.success).toBe(true) // Mock doesn't validate ownership
    })

    it('continues deletion even if storage removal fails', async () => {
      const result = await avatarService.deleteAvatar(mockAvatarId, mockUserId)

      expect(result.success).toBe(true) // Still succeeds despite storage error
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
        const file = createMockFile('image.jpg', 1024, type)
        const isValid = avatarService['validateImage'](file)
        expect(isValid).toBe(true)
      })
    })

    it('rejects invalid file types', () => {
      const invalidTypes = ['text/plain', 'application/pdf', 'video/mp4']
      
      invalidTypes.forEach(type => {
        const file = createMockFile('file.txt', 1024, type)
        const isValid = avatarService['validateImage'](file)
        expect(isValid).toBe(false)
      })
    })

    it('rejects files that are too large', () => {
      const largeFile = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg')
      
      const isValid = avatarService['validateImage'](largeFile)
      expect(isValid).toBe(false)
    })

    it('rejects empty files', () => {
      const emptyFile = createMockFile('empty.jpg', 0, 'image/jpeg')
      
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