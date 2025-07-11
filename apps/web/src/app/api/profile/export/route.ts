import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
// TODO: Re-enable when services and middleware are properly exported from @/packages/auth
// import { dataExportService } from '@/packages/auth/src/services/data-export-service'
// import { auditService } from '@/packages/auth/src/services/audit-service'
// import { rateLimiters, withRateLimit } from '@/packages/auth/src/middleware/rate-limiting'

const exportRequestSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  include_activity: z.boolean().default(true),
  include_preferences: z.boolean().default(true),
  include_sessions: z.boolean().default(false),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})

interface ExportData {
  user_info: any
  profile: any
  preferences?: any
  activity?: any[]
  sessions?: any[]
  export_metadata: {
    exported_at: string
    format: string
    user_id: string
    filters_applied: any
  }
}

export async function POST(req: NextRequest) {
  // TODO: Re-enable rate limiting when middleware is properly exported
  // const rateLimitResponse = await withRateLimit(
  //   async () => NextResponse.next(),
  //   rateLimiters.dataExport
  // )(req)

  // if (rateLimitResponse.status === 429) {
  //   return rateLimitResponse
  // }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Re-enable audit logging when service is properly exported
    // await auditService.logEvent({
    //   userId: session.user.id,
    //   action: 'deprecated_export_endpoint_used',
    //   resource: 'data_export',
    //   details: {
    //     deprecated_endpoint: '/api/profile/export',
    //     recommended_endpoint: '/api/profile/data-export',
    //     migration_note: 'Please use the new GDPR-compliant data export endpoint'
    //   },
    //   ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
    //   userAgent: req.headers.get('user-agent') || undefined,
    //   status: 'success',
    //   severity: 'low'
    // })

    // Return deprecation notice with redirect information
    return NextResponse.json({
      success: false,
      error: 'This endpoint is deprecated',
      message: 'Please use the new GDPR-compliant data export endpoint at /api/profile/data-export',
      migration: {
        new_endpoint: '/api/profile/data-export',
        method: 'POST',
        body_format: {
          export_type: 'full|profile|activity|preferences|avatars',
          format: 'json|csv',
          include_deleted: 'boolean (optional)'
        },
        benefits: [
          'GDPR compliant with proper audit trails',
          'Asynchronous processing for large datasets',
          'Secure download links with expiration',
          'Better rate limiting and security',
          'Comprehensive export options'
        ]
      }
    }, { 
      status: 410, // Gone
      headers: {
        'X-Deprecated': 'true',
        'X-Replacement-Endpoint': '/api/profile/data-export',
        'X-Deprecation-Date': '2024-01-01',
        'X-Removal-Date': '2024-06-01'
      }
    })
  } catch (error) {
    console.error('Data export error:', error)

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