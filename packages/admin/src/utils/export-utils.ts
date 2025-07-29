// Data export utilities for admin dashboard

export type ExportFormat = 'csv' | 'json' | 'xlsx'

export interface ExportOptions {
  filename?: string
  format: ExportFormat
  includeHeaders?: boolean
  dateFormat?: string
  includeTimestamp?: boolean
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return ''

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])
  
  // Create CSV header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',')
  
  // Create data rows
  const dataRows = data.map(row => 
    csvHeaders.map(header => escapeCSVValue(row[header] ?? '')).join(',')
  )
  
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return ''
  
  const stringValue = String(value)
  
  // Check if value needs escaping (contains comma, quote, or newline)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Convert data to JSON format
 */
export function convertToJSON(data: any[]): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  baseName: string, 
  format: ExportFormat,
  includeTimestamp = true
): string {
  const timestamp = includeTimestamp 
    ? new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    : ''
  
  const timestampSuffix = timestamp ? `_${timestamp}` : ''
  return `${baseName}${timestampSuffix}.${format}`
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Format data for export (clean up and format fields)
 */
export function formatDataForExport(data: any[], options: Partial<ExportOptions> = {}): any[] {
  const { dateFormat = 'iso' } = options
  
  return data.map(item => {
    const formatted = { ...item }
    
    // Format dates
    Object.keys(formatted).forEach(key => {
      const value = formatted[key]
      
      // Check if value is a date
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        const date = value instanceof Date ? value : new Date(value)
        
        switch (dateFormat) {
          case 'iso':
            formatted[key] = date.toISOString()
            break
          case 'local':
            formatted[key] = date.toLocaleString()
            break
          case 'date-only':
            formatted[key] = date.toLocaleDateString()
            break
          default:
            formatted[key] = date.toISOString()
        }
      }
      
      // Convert objects to JSON strings
      if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
        formatted[key] = JSON.stringify(value)
      }
    })
    
    return formatted
  })
}

/**
 * Main export function
 */
export function exportData(data: any[], options: ExportOptions): void {
  const {
    filename = 'export',
    format,
    includeHeaders = true,
    includeTimestamp = true
  } = options

  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Format data for export
  const formattedData = formatDataForExport(data, options)
  
  // Generate filename
  const exportFilename = generateFilename(filename, format, includeTimestamp)
  
  let content: string
  let mimeType: string

  switch (format) {
    case 'csv':
      content = convertToCSV(formattedData)
      mimeType = 'text/csv;charset=utf-8;'
      break
      
    case 'json':
      content = convertToJSON(formattedData)
      mimeType = 'application/json;charset=utf-8;'
      break
      
    case 'xlsx':
      // For now, fall back to CSV for XLSX
      // In a real implementation, you'd use a library like xlsx or exceljs
      content = convertToCSV(formattedData)
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
      
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }

  downloadFile(content, exportFilename, mimeType)
}

/**
 * Export users data with proper field formatting
 */
export function exportUsers(users: any[], format: ExportFormat = 'csv'): void {
  const formattedUsers = users.map(user => ({
    ID: user.id,
    Name: user.name || 'N/A',
    Email: user.email,
    Status: user.status,
    'System Admin': user.is_system_admin ? 'Yes' : 'No',
    'Email Verified': user.email_verified_at ? 'Yes' : 'No',
    'Last Seen': user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never',
    'Login Count': user.login_count || 0,
    'Organizations': user.organizations?.length || 0,
    'Created At': new Date(user.created_at).toLocaleString(),
    'Updated At': new Date(user.updated_at).toLocaleString()
  }))

  exportData(formattedUsers, {
    filename: 'users',
    format,
    includeHeaders: true,
    includeTimestamp: true
  })
}

/**
 * Export organizations data with proper field formatting
 */
export function exportOrganizations(organizations: any[], format: ExportFormat = 'csv'): void {
  const formattedOrganizations = organizations.map(org => ({
    ID: org.id,
    Name: org.name,
    Slug: org.slug,
    Status: org.status,
    Plan: org.plan || 'Free',
    'Member Count': org.member_count || 0,
    'Monthly Revenue': org.monthly_revenue ? `$${(org.monthly_revenue / 100).toFixed(2)}` : '$0.00',
    'Storage Used': org.storage_used ? `${org.storage_used} MB` : '0 MB',
    'Storage Limit': org.storage_limit ? `${org.storage_limit} MB` : 'Unlimited',
    'Owner Name': org.owner?.name || 'N/A',
    'Owner Email': org.owner?.email || 'N/A',
    'Created At': new Date(org.created_at).toLocaleString(),
    'Updated At': new Date(org.updated_at).toLocaleString()
  }))

  exportData(formattedOrganizations, {
    filename: 'organizations',
    format,
    includeHeaders: true,
    includeTimestamp: true
  })
}

/**
 * Export audit logs with proper field formatting
 */
export function exportAuditLogs(logs: any[], format: ExportFormat = 'csv'): void {
  const formattedLogs = logs.map(log => ({
    ID: log.id,
    'User ID': log.user_id,
    Action: log.action,
    'Resource Type': log.resource_type,
    'Resource ID': log.resource_id || 'N/A',
    Details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details,
    'IP Address': log.ip_address || 'N/A',
    'User Agent': log.user_agent || 'N/A',
    'Created At': new Date(log.created_at).toLocaleString()
  }))

  exportData(formattedLogs, {
    filename: 'audit_logs',
    format,
    includeHeaders: true,
    includeTimestamp: true
  })
}