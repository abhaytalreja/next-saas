'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { useOrganization, useAuth } from '@nextsaas/auth'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { Button, Badge, LegacyCard as Card, LegacyCardContent as CardContent, LegacyCardHeader as CardHeader, LegacyCardTitle as CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@nextsaas/ui'
import { ProjectMembers } from '@/components/projects/ProjectMembers'
import { ProjectSettings } from '@/components/projects/ProjectSettings'
import { ProjectActivity } from '@/components/projects/ProjectActivity'
import { ProjectItems } from '@/components/projects/ProjectItems'
import { EditProjectModal } from '@/components/projects/EditProjectModal'
import { DeleteProjectModal } from '@/components/projects/DeleteProjectModal'
import { InviteProjectMemberModal } from '@/components/projects/InviteProjectMemberModal'

interface Project {
  id: string
  name: string
  slug: string
  description?: string
  type: string
  settings: any
  metadata: any
  is_archived: boolean
  created_by: string
  created_at: string
  updated_at: string
  organization_id: string
  creator?: {
    id: string
    name?: string
    first_name?: string
    last_name?: string
    email: string
    avatar_url?: string
  }
  _count?: {
    members: number
    items: number
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { currentOrganization, hasPermission } = useOrganization()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const projectId = params.id as string

  useEffect(() => {
    if (!projectId || !currentOrganization || !user) return
    // Add a small delay to ensure authentication is fully established
    const timer = setTimeout(() => {
      fetchProject()
    }, 100)
    return () => clearTimeout(timer)
  }, [projectId, currentOrganization, user])

  const fetchProject = async () => {
    console.log('fetchProject called, user:', user?.id)
    console.log('Current organization:', currentOrganization?.id)
    
    if (!user?.id) {
      setError('Not authenticated')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Instead of getting session from page client, get it from the auth provider client
      // This ensures we're using the same client instance that has the working auth state
      const globalSupabase = getSupabaseBrowserClient()
      const { data: sessionData } = await globalSupabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      
      console.log('Session data from auth provider client:', { 
        hasSession: !!sessionData.session,
        hasToken: !!accessToken,
        userId: sessionData.session?.user?.id,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'None'
      })
      
      const headers: HeadersInit = { 
        'Content-Type': 'application/json'
      }
      
      // Send token in Authorization header as backup
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
        console.log('Added Authorization header with token')
      } else {
        console.log('No access token to send - trying cookies only')
      }
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'GET',
        headers,
        credentials: 'include', // Also send cookies
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', { 
          status: response.status, 
          errorData
        })
        
        if (response.status === 401) {
          setError('Unauthorized')
        } else if (response.status === 403) {
          setError('Access denied')  
        } else if (response.status === 404) {
          setError('Project not found')
        } else {
          setError('Failed to load project')
        }
        return
      }

      const result = await response.json()
      console.log('Project API result:', result)
      
      if (result.success && result.data) {
        setProject(result.data)
      } else {
        setError(result.error || 'Failed to load project')
      }
    } catch (err: any) {
      console.error('Error fetching project:', err)
      setError('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!project) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)
        .select()
        .single()

      if (error) throw error

      setProject(data)
      setShowEditModal(false)
    } catch (err: any) {
      console.error('Error updating project:', err)
      alert(err.message || 'Failed to update project')
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', project.id)

      if (error) throw error

      setShowDeleteModal(false)
      router.push('/dashboard/projects')
    } catch (err: any) {
      console.error('Error deleting project:', err)
      alert(err.message || 'Failed to delete project')
    }
  }

  const handleArchiveProject = async () => {
    if (!project) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          is_archived: !project.is_archived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)

      if (error) throw error

      setProject(prev =>
        prev ? { ...prev, is_archived: !prev.is_archived } : null
      )
    } catch (err: any) {
      console.error('Error archiving project:', err)
      alert(err.message || 'Failed to archive project')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {error || 'Project not found'}
        </h3>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/projects')}
          className="flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Projects</span>
        </Button>
      </div>
    )
  }

  const canEdit = hasPermission('project:update')
  const canDelete = hasPermission('project:delete')
  const canManageMembers = hasPermission('project:manage_members')

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/projects')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              {project.is_archived && (
                <Badge variant="secondary">Archived</Badge>
              )}
              <Badge variant="outline">{project.type}</Badge>
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-gray-600">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canManageMembers && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Invite Member</span>
            </Button>
          )}

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}

          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
            {/* Dropdown menu would go here */}
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {project._count?.members || 0}
            </div>
            <div className="text-sm text-gray-600">Members</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {project._count?.items || 0}
            </div>
            <div className="text-sm text-gray-600">Items</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Date(project.created_at).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">Created</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {project.creator?.name ||
                (project.creator?.first_name && project.creator?.last_name
                  ? `${project.creator.first_name} ${project.creator.last_name}`
                  : project.creator?.first_name) ||
                project.creator?.email ||
                'Unknown'}
            </div>
            <div className="text-sm text-gray-600">Created by</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {canEdit && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-gray-900">{project.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-gray-900">
                  {project.description || 'No description provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Type
                </label>
                <p className="text-gray-900">{project.type}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="text-gray-900">
                  {project.is_archived ? 'Archived' : 'Active'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="text-gray-900">
                  {new Date(project.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Updated
                </label>
                <p className="text-gray-900">
                  {new Date(project.updated_at).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <ProjectItems projectId={project.id} />
        </TabsContent>

        <TabsContent value="members">
          <ProjectMembers 
            projectId={project.id} 
            onInviteClick={() => setShowInviteModal(true)}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ProjectActivity projectId={project.id} />
        </TabsContent>

        {canEdit && (
          <TabsContent value="settings">
            <ProjectSettings
              project={project}
              onUpdate={handleUpdateProject}
              onArchive={handleArchiveProject}
              onDelete={() => setShowDeleteModal(true)}
              canDelete={canDelete}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateProject}
        />
      )}

      {showDeleteModal && (
        <DeleteProjectModal
          project={project}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteProject}
        />
      )}

      {showInviteModal && (
        <InviteProjectMemberModal
          projectId={project.id}
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}
