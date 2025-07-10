import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { dataExportService } from '@/packages/auth/src/services/data-export-service'
import { auditService } from '@/packages/auth/src/services/audit-service'
import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

export async function GET(
  req: NextRequest,
  { params }: { params: { exportId: string } }
) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.dataExport
  )(req)

  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { exportId } = params

    if (!exportId) {
      return NextResponse.json(
        { success: false, error: 'Export ID is required' },
        { status: 400 }
      )
    }

    // Validate export ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(exportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid export ID format' },
        { status: 400 }
      )
    }

    // Get export file
    const result = await dataExportService.getExportFile(exportId, session.user.id)

    if (!result.success) {
      // Log failed download attempt
      await auditService.logEvent({
        userId: session.user.id,
        action: 'data_export_download_failed',
        resource: 'data_export',
        resourceId: exportId,
        details: {
          error: result.error,
          ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip
        },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
        userAgent: req.headers.get('user-agent') || undefined,
        status: 'failed',
        severity: 'medium'
      })

      const statusCode = result.error?.includes('not found') ? 404 :
                        result.error?.includes('expired') ? 410 :
                        result.error?.includes('not ready') ? 400 : 500

      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
      )
    }

    // Prepare file download response
    const headers = new Headers()
    headers.set('Content-Type', result.mimeType || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${result.filename}"`)
    headers.set('Content-Length', Buffer.byteLength(result.content || '', 'utf8').toString())
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    // Add security headers
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    // Log successful download
    await auditService.logDataAccess({
      userId: session.user.id,
      action: 'data_export_downloaded',
      resource: 'data_export',
      resourceId: exportId,
      details: {
        filename: result.filename,
        mime_type: result.mimeType,
        file_size: Buffer.byteLength(result.content || '', 'utf8'),
        download_method: 'api'
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined
    })

    return new NextResponse(result.content, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Export download error:', error)

    // Log error
    await auditService.logEvent({
      userId: session?.user?.id,
      action: 'data_export_download_error',
      resource: 'data_export',
      resourceId: params.exportId,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined,
      status: 'failed',
      severity: 'high'
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Status check endpoint
export async function HEAD(
  req: NextRequest,
  { params }: { params: { exportId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse(null, { status: 401 })
    }

    const { exportId } = params

    // Check export status
    const result = await dataExportService.getExportStatus(exportId, session.user.id)

    if (!result.success || !result.export) {
      return new NextResponse(null, { status: 404 })
    }

    const exportRecord = result.export

    if (exportRecord.status !== 'completed') {
      return new NextResponse(null, { status: 202 }) // Accepted, still processing
    }

    if (new Date(exportRecord.expires_at) < new Date()) {
      return new NextResponse(null, { status: 410 }) // Gone, expired
    }

    // Export is ready for download
    const headers = new Headers()
    headers.set('Content-Type', exportRecord.mime_type || 'application/octet-stream')
    headers.set('Content-Length', (exportRecord.file_size || 0).toString())
    headers.set('Last-Modified', new Date(exportRecord.completed_at).toUTCString())
    headers.set('Cache-Control', 'no-cache')

    return new NextResponse(null, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Export status check error:', error)
    return new NextResponse(null, { status: 500 })
  }
}