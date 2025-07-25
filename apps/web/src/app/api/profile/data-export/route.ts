import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { z } from 'zod'
import { createDataExportService } from '@nextsaas/auth/services/data-export-service'

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
  try {
    const supabase = getSupabaseServerClient()
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
      .gte('requested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['pending', 'processing', 'completed'])

    if (recentExports && recentExports.length >= 2) {
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

    // Create data export service and request export
    const dataExportService = createDataExportService(supabase)
    const result = await dataExportService.requestDataExport(exportRequest)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

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
  try {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's export history using the service
    const dataExportService = createDataExportService(supabase)
    const exports = await dataExportService.getUserExports(session.user.id, 10)

    // Format exports for client
    const formattedExports = exports.map(exportRecord => ({
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
    }))

    // Get export statistics
    const totalExports = exports.length
    const pendingExports = exports.filter(e => e.status === 'pending' || e.status === 'processing').length
    const recentExports = exports.filter(e => 
      new Date(e.requested_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
    const canRequestNew = pendingExports === 0 && recentExports < 2

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