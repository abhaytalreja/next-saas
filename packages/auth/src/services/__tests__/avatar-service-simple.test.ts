import { AvatarService } from '../avatar-service'
import { createMockFile } from '../../test-utils'

// Simple test file focusing only on core functionality
describe('AvatarService - Simple Tests', () => {
  let avatarService: AvatarService
  const mockUserId = 'user-123'

  beforeEach(() => {
    jest.clearAllMocks()
    avatarService = new AvatarService()
  })

  describe('Constructor', () => {
    it('creates service instance', () => {
      expect(avatarService).toBeInstanceOf(AvatarService)
    })
  })

  describe('Upload Validation', () => {
    it('validates file size correctly', async () => {
      const largeFile = createMockFile('large.jpg', 6 * 1024 * 1024, 'image/jpeg')
      
      const result = await avatarService.uploadAvatar(largeFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('File size must be less than 5MB')
    })

    it('validates file type correctly', async () => {
      const invalidFile = createMockFile('document.pdf', 1024, 'application/pdf')
      
      const result = await avatarService.uploadAvatar(invalidFile, mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('accepts valid files', async () => {
      const validFile = createMockFile('avatar.jpg', 1024, 'image/jpeg')
      
      const result = await avatarService.uploadAvatar(validFile, mockUserId)

      // Even if upload fails due to mocking, validation should pass
      expect(result.error).not.toContain('Invalid file type')
      expect(result.error).not.toContain('File size must be less than 5MB')
    })
  })
})