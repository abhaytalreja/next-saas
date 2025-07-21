import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../../middleware/tenant-context'
import { requireAuditAccess } from '../../../middleware/permission-check'
import { withAuditLog } from '../../../middleware/tenant-context'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const exportQuerySchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  action: z.string().optional(),
  resource_type: z.string().optional(),
  actor_id: z.string().optional(),
  result: z.enum(['success', 'failure', 'partial']).optional()
})

// POST /api/audit/export - Export audit logs
export const POST = withTenantContext(
  requireAuditAccess()(
    withAuditLog('export_audit_logs', 'audit')(
      async (req: NextRequest, context) => {
        try {
          const body = await req.json()
          const {
            format,
            start_date,
            end_date,
            action,
            resource_type,
            actor_id,
            result
          } = exportQuerySchema.parse(body)

          // Default to last 30 days if no dates provided
          const defaultStartDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          const defaultEndDate = end_date || new Date().toISOString()

          let query = supabase
            .from('audit_logs')
            .select(`
              id,
              organization_id,
              workspace_id,
              project_id,
              actor_id,
              actor_type,
              actor_name,
              actor_email,
              action,
              resource_type,
              resource_id,
              resource_name,
              changes,
              result,
              error_message,
              ip_address,
              user_agent,
              location,
              metadata,
              created_at,
              workspaces:workspace_id(name),
              projects:project_id(name)
            `)
            .eq('organization_id', context.organizationId)
            .gte('created_at', defaultStartDate)
            .lte('created_at', defaultEndDate)

          // Apply filters
          if (action) {
            query = query.eq('action', action)
          }

          if (resource_type) {
            query = query.eq('resource_type', resource_type)
          }

          if (actor_id) {
            query = query.eq('actor_id', actor_id)
          }

          if (result) {
            query = query.eq('result', result)
          }

          query = query.order('created_at', { ascending: false })

          const { data: logs, error } = await query

          if (error) {
            console.error('Failed to fetch audit logs for export:', error)
            return NextResponse.json(
              { error: 'Failed to fetch audit logs' },
              { status: 500 }
            )
          }

          // Transform data for export
          const exportData = logs?.map(log => ({
            id: log.id,
            timestamp: log.created_at,
            actor_name: log.actor_name,
            actor_email: log.actor_email,
            action: log.action,
            resource_type: log.resource_type,
            resource_name: log.resource_name,
            workspace_name: log.workspaces?.name || '',
            project_name: log.projects?.name || '',
            result: log.result,
            error_message: log.error_message || '',
            ip_address: log.ip_address || '',
            user_agent: log.user_agent || '',
            changes: JSON.stringify(log.changes || {}),
            metadata: JSON.stringify(log.metadata || {})
          })) || []

          if (format === 'json') {
            const response = NextResponse.json({
              data: exportData,
              meta: {
                total_records: exportData.length,
                export_date: new Date().toISOString(),
                filters: {
                  start_date: defaultStartDate,
                  end_date: defaultEndDate,
                  action,
                  resource_type,
                  actor_id,
                  result
                },
                organization_id: context.organizationId
              }
            })

            response.headers.set(
              'Content-Disposition',
              `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`
            )
            response.headers.set('Content-Type', 'application/json')

            return response
          }

          // Generate CSV
          if (exportData.length === 0) {
            return NextResponse.json(
              { error: 'No data found for export' },
              { status: 404 }
            )
          }

          const headers = Object.keys(exportData[0])
          const csvRows = [
            headers.join(','),
            ...exportData.map(row => 
              headers.map(header => {
                const value = row[header as keyof typeof row]
                // Escape CSV values that contain commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                  return `"${value.replace(/"/g, '""')}"`
                }
                return value
              }).join(',')
            )
          ]

          const csvContent = csvRows.join('\n')

          const response = new NextResponse(csvContent)
          response.headers.set(
            'Content-Disposition',
            `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
          )
          response.headers.set('Content-Type', 'text/csv')

          return response
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Invalid request parameters', details: error.errors },
              { status: 400 }
            )
          }

          console.error('Audit export error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)

// GET /api/audit/export/status - Check export job status
export const GET = withTenantContext(
  requireAuditAccess()(
    async (req: NextRequest, context) => {
      try {
        const url = new URL(req.url)
        const jobId = url.searchParams.get('job_id')

        if (!jobId) {
          return NextResponse.json(
            { error: 'Job ID is required' },
            { status: 400 }
          )
        }

        // Mock export job status
        // In real implementation, you would:
        // 1. Store export jobs in database or cache
        // 2. Process exports asynchronously for large datasets
        // 3. Return actual job status and download links

        const mockJob = {
          id: jobId,
          status: 'completed',
          progress: 100,
          total_records: 1500,
          processed_records: 1500,
          download_url: `/api/audit/export/download/${jobId}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          completed_at: new Date().toISOString()
        }

        return NextResponse.json({ job: mockJob })
      } catch (error) {
        console.error('Export status check error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  )
)