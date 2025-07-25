// Mock for @backblaze-b2/client
import { jest } from '@jest/globals'

// Mock B2 client implementation
const mockB2Client = {
  authorize: jest.fn().mockResolvedValue({
    success: true,
    data: {
      authorizationToken: 'mock-token',
      apiUrl: 'https://api.backblaze.com',
      downloadUrl: 'https://download.backblaze.com'
    }
  }),
  getUploadUrl: jest.fn().mockResolvedValue({
    success: true,
    data: {
      uploadUrl: 'https://upload.backblaze.com',
      authorizationToken: 'upload-token'
    }
  }),
  uploadFile: jest.fn().mockResolvedValue({
    success: true,
    data: {
      fileId: 'file-123',
      fileName: 'avatar.jpg',
      contentType: 'image/jpeg',
      contentLength: 1024,
      fileInfo: {}
    }
  }),
  deleteFileVersion: jest.fn().mockResolvedValue({
    success: true
  })
}

export const Client = jest.fn(() => mockB2Client)

export default { Client }