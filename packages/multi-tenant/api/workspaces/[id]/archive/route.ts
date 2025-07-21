import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../../../middleware/tenant-context'
import { requirePermission } from '../../../../middleware/permission-check'
import { withAuditLog } from '../../../../middleware/tenant-context'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/workspaces/:id/archive - Archive workspace
export const POST = withTenantContext(
  requirePermission('workspace:update')(
    withAuditLog('archive_workspace', 'workspace')(
      async (req: NextRequest, context, { params }: { params: { id: string } }) => {
        try {
          const workspaceId = params.id

          // Check workspace exists and user has access
          const { data: workspace, error: fetchError } = await supabase
            .from('workspaces')
            .select('id, name, is_default, is_archived')
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .single()

          if (fetchError || !workspace) {
            return NextResponse.json(
              { error: 'Workspace not found' },
              { status: 404 }
            )
          }

          // Prevent archiving of default workspace
          if (workspace.is_default) {
            return NextResponse.json(
              { error: 'Cannot archive the default workspace' },
              { status: 400 }
            )
          }

          // Check if already archived
          if (workspace.is_archived) {
            return NextResponse.json(
              { error: 'Workspace is already archived' },
              { status: 400 }
            )
          }

          // Archive the workspace
          const { data: updatedWorkspace, error } = await supabase
            .from('workspaces')
            .update({ 
              is_archived: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .select()
            .single()

          if (error) {
            console.error('Failed to archive workspace:', error)
            return NextResponse.json(
              { error: 'Failed to archive workspace' },
              { status: 500 }
            )
          }

          return NextResponse.json({
            workspace: updatedWorkspace,
            message: 'Workspace archived successfully'
          })
        } catch (error) {
          console.error('Workspace archive error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)

// DELETE /api/workspaces/:id/archive - Restore workspace from archive
export const DELETE = withTenantContext(
  requirePermission('workspace:update')(
    withAuditLog('restore_workspace', 'workspace')(
      async (req: NextRequest, context, { params }: { params: { id: string } }) => {
        try {
          const workspaceId = params.id

          // Check workspace exists and user has access
          const { data: workspace, error: fetchError } = await supabase
            .from('workspaces')
            .select('id, name, is_archived')
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .single()

          if (fetchError || !workspace) {
            return NextResponse.json(
              { error: 'Workspace not found' },
              { status: 404 }
            )
          }

          // Check if workspace is archived
          if (!workspace.is_archived) {
            return NextResponse.json(
              { error: 'Workspace is not archived' },
              { status: 400 }
            )
          }

          // Restore the workspace
          const { data: updatedWorkspace, error } = await supabase
            .from('workspaces')
            .update({ 
              is_archived: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .select()
            .single()

          if (error) {
            console.error('Failed to restore workspace:', error)
            return NextResponse.json(
              { error: 'Failed to restore workspace' },
              { status: 500 }
            )
          }

          return NextResponse.json({
            workspace: updatedWorkspace,
            message: 'Workspace restored successfully'
          })
        } catch (error) {
          console.error('Workspace restore error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)