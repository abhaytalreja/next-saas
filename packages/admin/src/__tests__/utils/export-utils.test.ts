import {
  convertToCSV,
  convertToJSON,
  generateFilename,
  downloadFile,
  formatDataForExport,
  exportData,
  exportUsers,
  exportOrganizations,
  exportAuditLogs
} from '../../utils/export-utils'
import '@testing-library/jest-dom'

// Mock document methods
const mockCreateElement = jest.fn()
const mockAppendChild = jest.fn()
const mockRemoveChild = jest.fn()
const mockClick = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement
})

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild
})

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild
})

// Mock URL methods
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()

Object.defineProperty(window.URL, 'createObjectURL', {
  value: mockCreateObjectURL
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL
})

// Mock Blob
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: content[0].length,
  type: options.type
}))

describe('Export Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mock element
    const mockElement = {
      href: '',
      download: '',
      style: { display: '' },
      click: mockClick
    }
    mockCreateElement.mockReturnValue(mockElement)
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  describe('convertToCSV', () => {
    it('should convert simple data to CSV format', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('name,age,city\nJohn,30,New York\nJane,25,Los Angeles')
    })

    it('should handle custom headers', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' }
      ]
      const headers = ['name', 'city']

      const result = convertToCSV(data, headers)

      expect(result).toBe('name,city\nJohn,New York\nJane,Los Angeles')
    })

    it('should escape CSV values with commas', () => {
      const data = [
        { name: 'John, Jr.', description: 'Software engineer, full-time' }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('name,description\n"John, Jr.","Software engineer, full-time"')
    })

    it('should escape CSV values with quotes', () => {
      const data = [
        { message: 'He said "Hello" to me' }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('message\n"He said ""Hello"" to me"')
    })

    it('should escape CSV values with newlines', () => {
      const data = [
        { address: 'Line 1\nLine 2\nLine 3' }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('address\n"Line 1\nLine 2\nLine 3"')
    })

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined, active: false }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('name,age,city,active\nJohn,,,false')
    })

    it('should handle empty data array', () => {
      const result = convertToCSV([])
      expect(result).toBe('')
    })

    it('should handle missing properties in data objects', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', city: 'Los Angeles' }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('name,age\nJohn,30\nJane,')
    })

    it('should handle objects with different property orders', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { age: 25, city: 'Los Angeles', name: 'Jane' }
      ]

      const result = convertToCSV(data)

      expect(result).toBe('name,age,city\nJohn,30,New York\nJane,25,Los Angeles')
    })
  })

  describe('convertToJSON', () => {
    it('should convert data to formatted JSON string', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]

      const result = convertToJSON(data)
      const expected = JSON.stringify(data, null, 2)

      expect(result).toBe(expected)
    })

    it('should handle empty array', () => {
      const result = convertToJSON([])
      expect(result).toBe('[]')
    })

    it('should handle complex nested objects', () => {
      const data = [
        { 
          name: 'John', 
          details: { age: 30, hobbies: ['reading', 'gaming'] },
          metadata: { created: new Date('2024-01-01') }
        }
      ]

      const result = convertToJSON(data)
      expect(result).toContain('"name": "John"')
      expect(result).toContain('"age": 30')
      expect(result).toContain('"hobbies"')
    })
  })

  describe('generateFilename', () => {
    beforeAll(() => {
      // Mock Date.prototype.toISOString to return consistent timestamps
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-15T10:30:45.123Z')
    })

    afterAll(() => {
      jest.restoreAllMocks()
    })

    it('should generate filename with timestamp by default', () => {
      const result = generateFilename('export', 'csv')
      expect(result).toBe('export_2024-01-15T10-30-45.csv')
    })

    it('should generate filename without timestamp when disabled', () => {
      const result = generateFilename('export', 'json', false)
      expect(result).toBe('export.json')
    })

    it('should handle different formats', () => {
      expect(generateFilename('data', 'xlsx')).toBe('data_2024-01-15T10-30-45.xlsx')
      expect(generateFilename('users', 'json')).toBe('users_2024-01-15T10-30-45.json')
    })

    it('should handle special characters in base name', () => {
      const result = generateFilename('my data export', 'csv')
      expect(result).toBe('my data export_2024-01-15T10-30-45.csv')
    })
  })

  describe('downloadFile', () => {
    it('should create and trigger file download', () => {
      const content = 'test,data\n1,2'
      const filename = 'test.csv'
      const mimeType = 'text/csv'

      downloadFile(content, filename, mimeType)

      expect(global.Blob).toHaveBeenCalledWith([content], { type: mimeType })
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
    })

    it('should set correct link attributes', () => {
      const mockElement = {
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick
      }
      mockCreateElement.mockReturnValue(mockElement)

      downloadFile('content', 'filename.json', 'application/json')

      expect(mockElement.href).toBe('blob:mock-url')
      expect(mockElement.download).toBe('filename.json')
      expect(mockElement.style.display).toBe('none')
    })

    it('should revoke object URL after timeout', () => {
      jest.useFakeTimers()

      downloadFile('content', 'file.csv', 'text/csv')

      expect(mockRevokeObjectURL).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')

      jest.useRealTimers()
    })
  })

  describe('formatDataForExport', () => {
    it('should format dates in ISO format by default', () => {
      const data = [
        { name: 'John', created: new Date('2024-01-01T10:00:00Z') }
      ]

      const result = formatDataForExport(data)

      expect(result[0].created).toBe('2024-01-01T10:00:00.000Z')
    })

    it('should format dates in local format when specified', () => {
      const mockDate = new Date('2024-01-01T10:00:00Z')
      const data = [
        { name: 'John', created: mockDate }
      ]

      const result = formatDataForExport(data, { dateFormat: 'local' })

      expect(result[0].created).toBe(mockDate.toLocaleString())
    })

    it('should format dates as date-only when specified', () => {
      const mockDate = new Date('2024-01-01T10:00:00Z')
      const data = [
        { name: 'John', created: mockDate }
      ]

      const result = formatDataForExport(data, { dateFormat: 'date-only' })

      expect(result[0].created).toBe(mockDate.toLocaleDateString())
    })

    it('should handle string dates', () => {
      const data = [
        { name: 'John', created: '2024-01-01T10:00:00Z' }
      ]

      const result = formatDataForExport(data)

      expect(result[0].created).toBe('2024-01-01T10:00:00.000Z')
    })

    it('should convert objects to JSON strings', () => {
      const data = [
        { name: 'John', metadata: { age: 30, active: true } }
      ]

      const result = formatDataForExport(data)

      expect(result[0].metadata).toBe('{"age":30,"active":true}')
    })

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined }
      ]

      const result = formatDataForExport(data)

      expect(result[0].age).toBeNull()
      expect(result[0].city).toBeUndefined()
    })

    it('should not modify primitive values', () => {
      const data = [
        { name: 'John', age: 30, active: true, score: 95.5 }
      ]

      const result = formatDataForExport(data)

      expect(result[0].name).toBe('John')
      expect(result[0].age).toBe(30)
      expect(result[0].active).toBe(true)
      expect(result[0].score).toBe(95.5)
    })

    it('should handle invalid date strings gracefully', () => {
      const data = [
        { name: 'John', created: 'not-a-date' }
      ]

      const result = formatDataForExport(data)

      expect(result[0].created).toBe('not-a-date')
    })
  })

  describe('exportData', () => {
    it('should export CSV data correctly', () => {
      const data = [
        { name: 'John', age: 30 }
      ]
      const options = {
        filename: 'test',
        format: 'csv' as const,
        includeTimestamp: false
      }

      exportData(data, options)

      expect(global.Blob).toHaveBeenCalledWith(
        ['name,age\nJohn,30'],
        { type: 'text/csv;charset=utf-8;' }
      )
    })

    it('should export JSON data correctly', () => {
      const data = [
        { name: 'John', age: 30 }
      ]
      const options = {
        filename: 'test',
        format: 'json' as const,
        includeTimestamp: false
      }

      exportData(data, options)

      const expectedJSON = JSON.stringify(data, null, 2)
      expect(global.Blob).toHaveBeenCalledWith(
        [expectedJSON],
        { type: 'application/json;charset=utf-8;' }
      )
    })

    it('should export XLSX data (fallback to CSV)', () => {
      const data = [
        { name: 'John', age: 30 }
      ]
      const options = {
        filename: 'test',
        format: 'xlsx' as const,
        includeTimestamp: false
      }

      exportData(data, options)

      expect(global.Blob).toHaveBeenCalledWith(
        ['name,age\nJohn,30'],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      )
    })

    it('should throw error for empty data', () => {
      const options = {
        filename: 'test',
        format: 'csv' as const
      }

      expect(() => exportData([], options)).toThrow('No data to export')
    })

    it('should throw error for unsupported format', () => {
      const data = [{ name: 'John' }]
      const options = {
        filename: 'test',
        format: 'pdf' as any
      }

      expect(() => exportData(data, options)).toThrow('Unsupported export format: pdf')
    })

    it('should use default options', () => {
      const data = [{ name: 'John' }]
      const options = {
        format: 'csv' as const
      }

      exportData(data, options)

      // Should not throw and should create blob
      expect(global.Blob).toHaveBeenCalled()
    })
  })

  describe('exportUsers', () => {
    it('should format user data correctly for export', () => {
      const users = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          is_system_admin: true,
          email_verified_at: '2024-01-01T00:00:00Z',
          last_seen_at: '2024-01-15T10:30:00Z',
          login_count: 25,
          organizations: [{ id: 'org-1' }, { id: 'org-2' }],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ]

      exportUsers(users, 'csv')

      const callArgs = (global.Blob as jest.Mock).mock.calls[0][0][0]
      expect(callArgs).toContain('ID,Name,Email,Status,System Admin,Email Verified,Last Seen,Login Count,Organizations,Created At,Updated At')
      expect(callArgs).toContain('user-1,John Doe,john@example.com,active,Yes,Yes')
      expect(callArgs).toContain('25,2')
    })

    it('should handle missing user data fields', () => {
      const users = [
        {
          id: 'user-1',
          email: 'john@example.com',
          status: 'active',
          is_system_admin: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ]

      exportUsers(users, 'json')

      const callArgs = (global.Blob as jest.Mock).mock.calls[0][0][0]
      const parsedData = JSON.parse(callArgs)
      
      expect(parsedData[0]['Name']).toBe('N/A')
      expect(parsedData[0]['System Admin']).toBe('No')
      expect(parsedData[0]['Email Verified']).toBe('No')
      expect(parsedData[0]['Last Seen']).toBe('Never')
      expect(parsedData[0]['Login Count']).toBe(0)
      expect(parsedData[0]['Organizations']).toBe(0)
    })
  })

  describe('exportOrganizations', () => {
    it('should format organization data correctly for export', () => {
      const organizations = [
        {
          id: 'org-1',
          name: 'Acme Corp',
          slug: 'acme-corp',
          status: 'active',
          plan: 'pro',
          member_count: 15,
          monthly_revenue: 50000, // in cents
          storage_used: 1024,
          storage_limit: 10240,
          owner: {
            name: 'Jane Doe',
            email: 'jane@acme.com'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ]

      exportOrganizations(organizations, 'csv')

      const callArgs = (global.Blob as jest.Mock).mock.calls[0][0][0]
      expect(callArgs).toContain('ID,Name,Slug,Status,Plan,Member Count,Monthly Revenue,Storage Used,Storage Limit,Owner Name,Owner Email,Created At,Updated At')
      expect(callArgs).toContain('org-1,Acme Corp,acme-corp,active,pro,15,$500.00,1024 MB,10240 MB,Jane Doe,jane@acme.com')
    })

    it('should handle missing organization data fields', () => {
      const organizations = [
        {
          id: 'org-1',
          name: 'Acme Corp',
          slug: 'acme-corp',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ]

      exportOrganizations(organizations, 'json')

      const callArgs = (global.Blob as jest.Mock).mock.calls[0][0][0]
      const parsedData = JSON.parse(callArgs)
      
      expect(parsedData[0]['Plan']).toBe('Free')
      expect(parsedData[0]['Member Count']).toBe(0)
      expect(parsedData[0]['Monthly Revenue']).toBe('$0.00')
      expect(parsedData[0]['Storage Used']).toBe('0 MB')
      expect(parsedData[0]['Storage Limit']).toBe('Unlimited')
      expect(parsedData[0]['Owner Name']).toBe('N/A')
      expect(parsedData[0]['Owner Email']).toBe('N/A')
    })
  })

  describe('exportAuditLogs', () => {
    it('should format audit log data correctly for export', () => {
      const logs = [
        {
          id: 'log-1',
          user_id: 'user-1',
          action: 'login',
          resource_type: 'user',
          resource_id: 'user-1',
          details: { success: true, method: 'email' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          created_at: '2024-01-15T10:30:00Z'
        }
      ]

      exportAuditLogs(logs, 'csv')

      const callArgs = (global.Blob as jest.Mock).mock.calls[0][0][0]
      expect(callArgs).toContain('ID,User ID,Action,Resource Type,Resource ID,Details,IP Address,User Agent,Created At')
      expect(callArgs).toContain('log-1,user-1,login,user,user-1,"{""success"":true,""method"":""email""}",192.168.1.1,Mozilla/5.0...')
    })

    it('should handle missing audit log fields', () => {
      const logs = [
        {
          id: 'log-1',
          user_id: 'user-1',
          action: 'login',
          resource_type: 'user',
          details: 'Simple string details',
          created_at: '2024-01-15T10:30:00Z'
        }
      ]

      exportAuditLogs(logs, 'json')

      const callArgs = (global.Blob as jest.Mock).mock.calls[0][0][0]
      const parsedData = JSON.parse(callArgs)
      
      expect(parsedData[0]['Resource ID']).toBe('N/A')
      expect(parsedData[0]['Details']).toBe('Simple string details')
      expect(parsedData[0]['IP Address']).toBe('N/A')
      expect(parsedData[0]['User Agent']).toBe('N/A')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle circular references in objects gracefully', () => {
      const obj: any = { name: 'John' }
      obj.circular = obj
      const data = [obj]

      // Should not throw error due to circular reference
      expect(() => formatDataForExport(data)).not.toThrow()
    })

    it('should handle very large data arrays', () => {
      const largeData = Array(10000).fill(0).map((_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`
      }))

      expect(() => exportData(largeData, { filename: 'large', format: 'csv' })).not.toThrow()
    })

    it('should handle special characters in filenames', () => {
      const data = [{ name: 'test' }]
      const options = {
        filename: 'my/file\\with:special*chars',
        format: 'csv' as const,
        includeTimestamp: false
      }

      expect(() => exportData(data, options)).not.toThrow()
    })

    it('should handle empty objects in data array', () => {
      const data = [{}, { name: 'John' }, {}]

      const csvResult = convertToCSV(data)
      expect(csvResult).toContain('name')
    })

    it('should handle mixed data types in the same field', () => {
      const data = [
        { value: 'string' },
        { value: 123 },
        { value: true },
        { value: null },
        { value: { nested: 'object' } }
      ]

      expect(() => convertToCSV(data)).not.toThrow()
      expect(() => convertToJSON(data)).not.toThrow()
    })
  })
})