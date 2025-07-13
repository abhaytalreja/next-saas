'use client'

import { useState } from 'react'
import { X, PlusIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/lib/supabase/client'
import { useOrganization } from '@/hooks/useOrganization'

interface InviteData {
  email: string
  role: string
}

interface InviteProjectMemberModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteProjectMemberModal({
  projectId,
  isOpen,
  onClose,
}: InviteProjectMemberModalProps) {
  const { supabase } = useSupabase()
  const { currentOrganization } = useOrganization()

  const [isLoading, setIsLoading] = useState(false)
  const [invites, setInvites] = useState<InviteData[]>([
    { email: '', role: 'member' },
  ])

  const addInviteRow = () => {
    setInvites(prev => [...prev, { email: '', role: 'member' }])
  }

  const removeInviteRow = (index: number) => {
    setInvites(prev => prev.filter((_, i) => i !== index))
  }

  const updateInvite = (
    index: number,
    field: keyof InviteData,
    value: string
  ) => {
    setInvites(prev =>
      prev.map((invite, i) =>
        i === index ? { ...invite, [field]: value } : invite
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validInvites = invites.filter(invite => invite.email.trim())
    if (validInvites.length === 0) {
      alert('Please enter at least one email address')
      return
    }

    try {
      setIsLoading(true)

      // First, get organization members to invite from
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select('user_id, user:users!user_id(email)')
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'active')

      if (orgError) throw orgError

      const memberEmails = new Set(orgMembers.map(m => m.user.email))

      // Check which emails are valid organization members
      const validMemberInvites = validInvites.filter(invite =>
        memberEmails.has(invite.email)
      )

      if (validMemberInvites.length === 0) {
        alert('None of the provided emails are members of this organization')
        return
      }

      // Add members to project
      const projectMembers = validMemberInvites.map(invite => {
        const orgMember = orgMembers.find(m => m.user.email === invite.email)
        return {
          project_id: projectId,
          user_id: orgMember!.user_id,
          role: invite.role,
          added_by: currentOrganization!.id, // This should be current user ID
        }
      })

      const { error: insertError } = await supabase
        .from('project_members')
        .insert(projectMembers)

      if (insertError) throw insertError

      alert(
        `Successfully added ${validMemberInvites.length} members to the project`
      )
      onClose()
    } catch (err: any) {
      console.error('Error inviting members:', err)
      alert(err.message || 'Failed to invite members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setInvites([{ email: '', role: 'member' }])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Invite Project Members
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Add organization members to this project. You can only invite
              users who are already members of your organization.
            </p>

            <div className="space-y-3">
              {invites.map((invite, index) => (
                <div key={index} className="flex items-end space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`email-${index}`}>Email Address</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={invite.email}
                      onChange={e =>
                        updateInvite(index, 'email', e.target.value)
                      }
                      placeholder="member@example.com"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label htmlFor={`role-${index}`}>Role</Label>
                    <select
                      id={`role-${index}`}
                      value={invite.role}
                      onChange={e =>
                        updateInvite(index, 'role', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  {invites.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInviteRow(index)}
                      disabled={isLoading}
                      className="h-10 w-10 p-0 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInviteRow}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Another</span>
            </Button>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !invites.some(invite => invite.email.trim())
              }
            >
              {isLoading ? 'Adding Members...' : 'Add Members'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
