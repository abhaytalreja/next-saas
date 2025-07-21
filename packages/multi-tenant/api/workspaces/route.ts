import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '../../middleware/tenant-context'
import { requirePermission, requireResourceAccess } from '../../middleware/permission-check'
import { withAuditLog } from '../../middleware/tenant-context'
import { withRateLimit } from '../../middleware/rate-limiter'
import { withSecurity } from '../../middleware/security-headers'
import { withSecurityMonitoring } from '../../middleware/security-monitor'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Request validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_default: z.boolean().optional(),
  settings: z.record(z.any()).optional()
})

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_default: z.boolean().optional(),
  settings: z.record(z.any()).optional()
})

// GET /api/workspaces - List all workspaces for the organization
export const GET = withTenantContext(
  withRateLimit('api/workspaces')(
    withSecurityMonitoring()(
      withSecurity()(
        requirePermission('workspace:view')(
          withAuditLog('list_workspaces', 'workspace')(
      async (req: NextRequest, context) => {
        try {
          const { data: workspaces, error } = await supabase
            .from('workspaces')
            .select(`
              id,
              name,
              slug,
              description,
              icon,
              color,
              settings,
              is_default,
              is_archived,
              metadata,
              created_at,
              updated_at,
              projects:projects(count)
            `)
            .eq('organization_id', context.organizationId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Failed to fetch workspaces:', error)
            return NextResponse.json(
              { error: 'Failed to fetch workspaces' },
              { status: 500 }
            )
          }

          // Transform data to include project count
          const transformedWorkspaces = workspaces?.map(workspace => ({
            ...workspace,
            project_count: workspace.projects?.[0]?.count || 0
          })) || []

          return NextResponse.json({
            workspaces: transformedWorkspaces,
            total: transformedWorkspaces.length
          })
        } catch (error) {
          console.error('Workspace list error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
          )
        )
      )
    )
  )
)

// POST /api/workspaces - Create a new workspace
export const POST = withTenantContext(
  withRateLimit('api/workspaces', { maxRequests: 10 })(
    withSecurityMonitoring()(
      withSecurity()(
        requirePermission('workspace:create')(
          withAuditLog('create_workspace', 'workspace')(
      async (req: NextRequest, context) => {
        try {
          const body = await req.json()
          const validatedData = createWorkspaceSchema.parse(body)

          // Generate slug from name
          const slug = validatedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

          // Check if workspace with this slug already exists
          const { data: existingWorkspace } = await supabase
            .from('workspaces')
            .select('id')
            .eq('organization_id', context.organizationId)
            .eq('slug', slug)
            .single()

          if (existingWorkspace) {
            return NextResponse.json(
              { error: 'A workspace with this name already exists' },
              { status: 409 }
            )
          }

          // If setting as default, unset other default workspaces
          if (validatedData.is_default) {
            await supabase
              .from('workspaces')
              .update({ is_default: false })
              .eq('organization_id', context.organizationId)
          }

          // Create the workspace
          const { data: workspace, error } = await supabase
            .from('workspaces')
            .insert({
              organization_id: context.organizationId,
              name: validatedData.name,
              slug,
              description: validatedData.description,
              icon: validatedData.icon || '🏢',
              color: validatedData.color || '#3B82F6',
              is_default: validatedData.is_default || false,
              settings: validatedData.settings || {},
              created_by: context.userId
            })
            .select()
            .single()

          if (error) {
            console.error('Failed to create workspace:', error)
            return NextResponse.json(
              { error: 'Failed to create workspace' },
              { status: 500 }
            )
          }

          // Add creator as workspace admin
          await supabase
            .from('workspace_members')
            .insert({
              workspace_id: workspace.id,
              user_id: context.userId,
              role: 'admin'
            })

          return NextResponse.json(workspace, { status: 201 })
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Invalid request data', details: error.errors },
              { status: 400 }
            )
          }

          console.error('Workspace creation error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
          )
        )
      )
    )
  )
)

// PUT /api/workspaces/:id - Update workspace
export const PUT = withTenantContext(
  requireResourceAccess('workspace')(
    withAuditLog('update_workspace', 'workspace')(
      async (req: NextRequest, context) => {
        try {
          const url = new URL(req.url)
          const workspaceId = url.pathname.split('/').pop()

          if (!workspaceId) {
            return NextResponse.json(
              { error: 'Workspace ID is required' },
              { status: 400 }
            )
          }

          const body = await req.json()
          const validatedData = updateWorkspaceSchema.parse(body)

          // Check workspace exists and user has access
          const { data: existingWorkspace } = await supabase
            .from('workspaces')
            .select('id, name, slug')
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .single()

          if (!existingWorkspace) {
            return NextResponse.json(
              { error: 'Workspace not found' },
              { status: 404 }
            )
          }

          // Generate new slug if name changed
          let updateData: any = { ...validatedData }
          if (validatedData.name && validatedData.name !== existingWorkspace.name) {
            const slug = validatedData.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')

            // Check slug uniqueness
            const { data: slugExists } = await supabase
              .from('workspaces')
              .select('id')
              .eq('organization_id', context.organizationId)
              .eq('slug', slug)
              .neq('id', workspaceId)
              .single()

            if (slugExists) {
              return NextResponse.json(
                { error: 'A workspace with this name already exists' },
                { status: 409 }
              )
            }

            updateData.slug = slug
          }

          // If setting as default, unset other default workspaces
          if (validatedData.is_default) {
            await supabase
              .from('workspaces')
              .update({ is_default: false })
              .eq('organization_id', context.organizationId)
              .neq('id', workspaceId)
          }

          const { data: workspace, error } = await supabase
            .from('workspaces')
            .update({
              ...updateData,
              updated_at: new Date().toISOString()
            })
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .select()
            .single()

          if (error) {
            console.error('Failed to update workspace:', error)
            return NextResponse.json(
              { error: 'Failed to update workspace' },
              { status: 500 }
            )
          }

          return NextResponse.json(workspace)
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Invalid request data', details: error.errors },
              { status: 400 }
            )
          }

          console.error('Workspace update error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)

// DELETE /api/workspaces/:id - Delete workspace
export const DELETE = withTenantContext(
  requirePermission('workspace:delete')(
    withAuditLog('delete_workspace', 'workspace')(
      async (req: NextRequest, context) => {
        try {
          const url = new URL(req.url)
          const workspaceId = url.pathname.split('/').pop()

          if (!workspaceId) {
            return NextResponse.json(
              { error: 'Workspace ID is required' },
              { status: 400 }
            )
          }

          // Check workspace exists and user has access
          const { data: workspace } = await supabase
            .from('workspaces')
            .select('id, name, is_default')
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)
            .single()

          if (!workspace) {
            return NextResponse.json(
              { error: 'Workspace not found' },
              { status: 404 }
            )
          }

          // Prevent deletion of default workspace
          if (workspace.is_default) {
            return NextResponse.json(
              { error: 'Cannot delete the default workspace' },
              { status: 400 }
            )
          }

          // Check if workspace has projects
          const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('workspace_id', workspaceId)
            .limit(1)

          if (projects && projects.length > 0) {
            return NextResponse.json(
              { error: 'Cannot delete workspace with existing projects' },
              { status: 400 }
            )
          }

          // Soft delete the workspace
          const { error } = await supabase
            .from('workspaces')
            .update({
              deleted_at: new Date().toISOString(),
              is_archived: true
            })
            .eq('id', workspaceId)
            .eq('organization_id', context.organizationId)

          if (error) {
            console.error('Failed to delete workspace:', error)
            return NextResponse.json(
              { error: 'Failed to delete workspace' },
              { status: 500 }
            )
          }

          return NextResponse.json({ success: true })
        } catch (error) {
          console.error('Workspace deletion error:', error)
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)