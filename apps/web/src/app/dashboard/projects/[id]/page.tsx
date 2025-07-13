'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/supabase/client'
import { useOrganization } from '@/hooks/useOrganization'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectMembers } from '@/components/projects/ProjectMembers'
import { ProjectSettings } from '@/components/projects/ProjectSettings'
import { ProjectActivity } from '@/components/projects/ProjectActivity'
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
    full_name?: string
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
  const { supabase } = useSupabase()
  const { currentOrganization, hasPermission } = useOrganization()

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
    if (!projectId || !currentOrganization) return
    fetchProject()
  }, [projectId, currentOrganization])

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          creator:users!created_by(id, full_name, email, avatar_url),
          _count:project_members(count)
        `
        )
        .eq('id', projectId)
        .eq('organization_id', currentOrganization!.id)
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Project not found')
        } else {
          throw error
        }
        return
      }

      setProject(data)
    } catch (err: any) {
      console.error('Error fetching project:', err)
      setError(err.message || 'Failed to load project')
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
    <div className="space-y-6">
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
              {project.creator?.full_name ||
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

        <TabsContent value="members">
          <ProjectMembers projectId={project.id} />
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
