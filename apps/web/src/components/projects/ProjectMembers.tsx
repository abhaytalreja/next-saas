'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { useOrganization } from '@nextsaas/auth'
import {
  UserPlusIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Button, LegacyCard as Card, LegacyCardContent as CardContent, LegacyCardHeader as CardHeader, LegacyCardTitle as CardTitle, Badge, Avatar, AvatarFallback, AvatarImage } from '@nextsaas/ui'

interface ProjectMember {
  id: string
  user_id: string
  project_id: string
  role: string
  added_at: string
  added_by: string
  user: {
    id: string
    name?: string
    first_name?: string
    last_name?: string
    email: string
    avatar_url?: string
  }
}

interface ProjectMembersProps {
  projectId: string
  onInviteClick?: () => void
  refreshTrigger?: number
}

export function ProjectMembers({ projectId, onInviteClick, refreshTrigger }: ProjectMembersProps) {
  const supabase = getSupabaseBrowserClient()
  const { hasPermission } = useOrganization()

  const [members, setMembers] = useState<ProjectMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [projectId])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('project_members')
        .select(
          `
          *,
          user:users!user_id(id, name, first_name, last_name, email, avatar_url)
        `
        )
        .eq('project_id', projectId)
        .order('added_at', { ascending: false })

      if (error) throw error

      setMembers(data || [])
    } catch (err: any) {
      console.error('Error fetching project members:', err)
      setError(err.message || 'Failed to load members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (
      !confirm('Are you sure you want to remove this member from the project?')
    ) {
      return
    }

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch (err: any) {
      console.error('Error removing member:', err)
      alert(err.message || 'Failed to remove member')
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      setMembers(prev =>
        prev.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
      )
    } catch (err: any) {
      console.error('Error updating role:', err)
      alert(err.message || 'Failed to update role')
    }
  }

  const canManageMembers = hasPermission('project:manage_members')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Members ({members.length})</CardTitle>
        {canManageMembers && onInviteClick && (
          <Button 
            size="sm" 
            className="flex items-center space-x-2"
            onClick={onInviteClick}
          >
            <UserPlusIcon className="h-4 w-4" />
            <span>Add Member</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No members
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding members to this project.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={member.user.avatar_url}
                      alt={member.user.name || member.user.email}
                    />
                    <AvatarFallback>
                      {(member.user.name || 
                        (member.user.first_name && member.user.last_name 
                          ? `${member.user.first_name} ${member.user.last_name}`
                          : member.user.first_name) || 
                        member.user.email)
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium text-gray-900">
                      {member.user.name || 
                        (member.user.first_name && member.user.last_name 
                          ? `${member.user.first_name} ${member.user.last_name}`
                          : member.user.first_name) || 
                        member.user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{member.role}</Badge>

                  {canManageMembers && (
                    <div className="flex items-center space-x-1">
                      <select
                        value={member.role}
                        onChange={e =>
                          handleUpdateRole(member.id, e.target.value)
                        }
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
