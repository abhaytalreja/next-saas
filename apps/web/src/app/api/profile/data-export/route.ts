import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { dataExportService } from '@/packages/auth/src/services/data-export-service'
import { auditService } from '@/packages/auth/src/services/audit-service'
import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

const dataExportRequestSchema = z.object({
  export_type: z.enum(['full', 'profile', 'activity', 'preferences', 'avatars']).default('full'),
  format: z.enum(['json', 'csv']).default('json'),
  include_deleted: z.boolean().optional().default(false),
  date_range: z.object({
    from: z.string().datetime(),
    to: z.string().datetime()
  }).optional()
})

export async function POST(req: NextRequest) {
  // Apply strict rate limiting for data exports
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

    // Parse and validate request body
    const body = await req.json()
    const { export_type, format, include_deleted, date_range } = dataExportRequestSchema.parse(body)

    // Check if user has exceeded export limits (GDPR allows reasonable limits)
    const { data: recentExports } = await supabase
      .from('data_exports')
      .select('id')
      .eq('user_id', session.user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['pending', 'processing', 'completed'])

    if (recentExports && recentExports.length >= 2) {
      // Log rate limit violation
      await auditService.logSecurityViolation({
        userId: session.user.id,
        violationType: 'rate_limit',
        resource: 'data_export',
        details: {
          reason: 'Daily export limit exceeded',
          recent_exports_count: recentExports.length
        },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
        userAgent: req.headers.get('user-agent') || undefined
      })

      return NextResponse.json(
        { 
          success: false, 
          error: 'Export limit reached. You can request up to 2 data exports per day.',
          retryAfter: '24 hours'
        },
        { status: 429 }
      )
    }

    // Check for pending exports
    const { data: pendingExports } = await supabase
      .from('data_exports')
      .select('id')
      .eq('user_id', session.user.id)
      .in('status', ['pending', 'processing'])

    if (pendingExports && pendingExports.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You already have a pending data export. Please wait for it to complete.',
          pendingExportId: pendingExports[0].id
        },
        { status: 400 }
      )
    }

    // Prepare export request
    const exportRequest = {
      userId: session.user.id,
      exportType: export_type,
      format,
      includeDeleted: include_deleted,
      dateRange: date_range ? {
        from: new Date(date_range.from),
        to: new Date(date_range.to)
      } : undefined
    }

    // Request data export
    const result = await dataExportService.requestDataExport(exportRequest)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Log successful export request
    await auditService.logDataAccess({
      userId: session.user.id,
      action: 'data_export_requested',
      resource: 'data_export',
      resourceId: result.exportId,
      details: {
        export_type,
        format,
        include_deleted,
        has_date_range: !!date_range
      },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
      userAgent: req.headers.get('user-agent') || undefined
    })

    return NextResponse.json({
      success: true,
      data: {
        exportId: result.exportId,
        expiresAt: result.expiresAt,
        message: 'Data export request submitted successfully. You will be notified when it is ready for download.',
        estimatedTime: '5-10 minutes'
      }
    })

  } catch (error) {
    console.error('Data export request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(
    async () => NextResponse.next(),
    rateLimiters.api
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

    // Get user's export history
    const { data: exports, error } = await supabase
      .from('data_exports')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch export history' },
        { status: 500 }
      )
    }

    // Format exports for client
    const formattedExports = exports?.map(exportRecord => ({
      id: exportRecord.id,
      exportType: exportRecord.export_type,
      format: exportRecord.format,
      status: exportRecord.status,
      filename: exportRecord.filename,
      fileSize: exportRecord.file_size,
      requestedAt: exportRecord.requested_at,
      completedAt: exportRecord.completed_at,
      expiresAt: exportRecord.expires_at,
      downloadUrl: exportRecord.status === 'completed' ? `/api/profile/data-export/${exportRecord.id}/download` : null,
      errorMessage: exportRecord.error_message,
      canDownload: exportRecord.status === 'completed' && new Date(exportRecord.expires_at) > new Date()
    })) || []

    // Get export statistics
    const totalExports = exports?.length || 0
    const pendingExports = exports?.filter(e => e.status === 'pending' || e.status === 'processing').length || 0
    const canRequestNew = pendingExports === 0 && 
      (exports?.filter(e => 
        new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length || 0) < 2

    return NextResponse.json({
      success: true,
      data: {
        exports: formattedExports,
        statistics: {
          totalExports,
          pendingExports,
          canRequestNew,
          nextRequestAvailable: canRequestNew ? 'now' : '24 hours'
        }
      }
    })

  } catch (error) {
    console.error('Export history fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}