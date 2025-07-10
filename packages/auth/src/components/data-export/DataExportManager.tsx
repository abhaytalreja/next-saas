'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Download, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Loader2,
  Archive
} from 'lucide-react'
import { toast } from 'sonner'

interface DataExport {
  id: string
  exportType: 'full' | 'profile' | 'activity' | 'preferences' | 'avatars'
  format: 'json' | 'csv'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  filename?: string
  fileSize?: number
  requestedAt: string
  completedAt?: string
  expiresAt: string
  downloadUrl?: string
  errorMessage?: string
  canDownload: boolean
}

interface ExportStatistics {
  totalExports: number
  pendingExports: number
  canRequestNew: boolean
  nextRequestAvailable: string
}

export function DataExportManager() {
  const [exports, setExports] = useState<DataExport[]>([])
  const [statistics, setStatistics] = useState<ExportStatistics>({
    totalExports: 0,
    pendingExports: 0,
    canRequestNew: true,
    nextRequestAvailable: 'now'
  })
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Export request form state
  const [exportType, setExportType] = useState<'full' | 'profile' | 'activity' | 'preferences' | 'avatars'>('full')
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [includeDeleted, setIncludeDeleted] = useState(false)

  useEffect(() => {
    loadExports()
    // Poll for status updates every 30 seconds if there are pending exports
    const interval = setInterval(() => {
      if (statistics.pendingExports > 0) {
        loadExports()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [statistics.pendingExports])

  const loadExports = async () => {
    try {
      const response = await fetch('/api/profile/data-export')
      
      if (response.ok) {
        const data = await response.json()
        setExports(data.data.exports || [])
        setStatistics(data.data.statistics || statistics)
      } else {
        toast.error('Failed to load export history')
      }
    } catch (error) {
      console.error('Error loading exports:', error)
      toast.error('Failed to load export history')
    } finally {
      setLoading(false)
    }
  }

  const requestExport = async () => {
    if (!statistics.canRequestNew) {
      toast.error('You have reached the daily export limit or have a pending export')
      return
    }

    setRequesting(true)

    try {
      const response = await fetch('/api/profile/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          export_type: exportType,
          format,
          include_deleted: includeDeleted
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.data.message)
        loadExports() // Refresh the list
      } else {
        toast.error(result.error || 'Failed to request export')
      }
    } catch (error) {
      console.error('Error requesting export:', error)
      toast.error('Failed to request export')
    } finally {
      setRequesting(false)
    }
  }

  const downloadExport = async (exportData: DataExport) => {
    if (!exportData.canDownload) {
      toast.error('Export is not ready for download')
      return
    }

    setDownloadingId(exportData.id)

    try {
      const response = await fetch(`/api/profile/data-export/${exportData.id}/download`)

      if (response.ok) {
        // Get the filename from the response headers or use the stored filename
        const contentDisposition = response.headers.get('content-disposition')
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : exportData.filename || `export-${exportData.id}.${exportData.format}`

        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('Export downloaded successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to download export')
      }
    } catch (error) {
      console.error('Error downloading export:', error)
      toast.error('Failed to download export')
    } finally {
      setDownloadingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getExportTypeLabel = (type: string) => {
    const labels = {
      full: 'Complete Data Export',
      profile: 'Profile Data',
      activity: 'Activity History',
      preferences: 'Preferences',
      avatars: 'Avatar History'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading export data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* GDPR Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Data Portability Rights</AlertTitle>
        <AlertDescription>
          Under GDPR Article 20, you have the right to receive your personal data in a structured, 
          commonly used format. Exports are available for 7 days and are limited to 2 requests per day.
        </AlertDescription>
      </Alert>

      {/* Export Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="h-5 w-5" />
            <span>Request Data Export</span>
          </CardTitle>
          <CardDescription>
            Export your personal data in a structured format for download
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="export-type">Export Type</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Complete Data Export</SelectItem>
                  <SelectItem value="profile">Profile Data Only</SelectItem>
                  <SelectItem value="activity">Activity History Only</SelectItem>
                  <SelectItem value="preferences">Preferences Only</SelectItem>
                  <SelectItem value="avatars">Avatar History Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Structured)</SelectItem>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-deleted" 
              checked={includeDeleted}
              onCheckedChange={(checked) => setIncludeDeleted(checked as boolean)}
            />
            <Label htmlFor="include-deleted">
              Include deleted/revoked items (where applicable)
            </Label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              {statistics.canRequestNew ? (
                'You can request a new export'
              ) : (
                `Next export available: ${statistics.nextRequestAvailable}`
              )}
            </div>
            <Button 
              onClick={requestExport}
              disabled={!statistics.canRequestNew || requesting}
            >
              {requesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Request Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export History</span>
          </CardTitle>
          <CardDescription>
            View and download your previous data exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Archive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No data exports requested yet</p>
              <p className="text-sm">Request your first export above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exports.map((exportData) => (
                <div
                  key={exportData.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(exportData.status)}
                        <h4 className="font-medium">
                          {getExportTypeLabel(exportData.exportType)}
                        </h4>
                        <Badge className={getStatusColor(exportData.status)}>
                          {exportData.status}
                        </Badge>
                        <span className="text-sm text-gray-500 uppercase">
                          {exportData.format}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Requested: {formatDate(exportData.requestedAt)}
                        {exportData.completedAt && (
                          <> • Completed: {formatDate(exportData.completedAt)}</>
                        )}
                      </p>
                      {exportData.fileSize && (
                        <p className="text-sm text-gray-600">
                          File size: {formatFileSize(exportData.fileSize)}
                        </p>
                      )}
                      {exportData.status === 'completed' && (
                        <p className="text-sm text-gray-600">
                          Expires: {formatDate(exportData.expiresAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {exportData.status === 'processing' && (
                        <div className="flex items-center space-x-2">
                          <Progress value={undefined} className="w-24" />
                          <span className="text-sm text-gray-600">Processing...</span>
                        </div>
                      )}

                      {exportData.canDownload && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadExport(exportData)}
                          disabled={downloadingId === exportData.id}
                        >
                          {downloadingId === exportData.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {exportData.errorMessage && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {exportData.errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {exportData.status === 'expired' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This export has expired. Request a new export if you need the data.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Statistics */}
      {statistics.totalExports > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{statistics.totalExports}</div>
                <div className="text-sm text-gray-600">Total Exports</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{statistics.pendingExports}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {statistics.canRequestNew ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Can Request New</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}