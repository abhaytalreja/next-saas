'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button, Input, Textarea, Label } from '@nextsaas/ui'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { useOrganization } from '@nextsaas/auth'

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (itemData: any) => void
  projectId: string
}

interface ProjectMember {
  id: string
  email: string
  first_name?: string
  last_name?: string
  name?: string
}

export function CreateItemModal({ isOpen, onClose, onSubmit, projectId }: CreateItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task',
    priority: 1,
    assigned_to: '',
    due_date: '',
    tags: '',
  })

  const { currentOrganization } = useOrganization()

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectMembers()
    }
  }, [isOpen, projectId])

  const fetchProjectMembers = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      
      const { data: members, error } = await supabase
        .from('project_members')
        .select(`
          user_id,
          user:users!project_members_user_id_fkey(
            id,
            email,
            first_name,
            last_name,
            name
          )
        `)
        .eq('project_id', projectId)

      if (error) {
        console.error('Error fetching project members:', error)
        return
      }

      const memberUsers = members?.map(m => m.user).filter(Boolean) || []
      setProjectMembers(memberUsers as ProjectMember[])
    } catch (err) {
      console.error('Error fetching project members:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }

    setIsLoading(true)

    const itemData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      type: formData.type,
      priority: parseInt(formData.priority.toString()),
      assigned_to: formData.assigned_to || null,
      due_date: formData.due_date || null,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
    }

    try {
      await onSubmit(itemData)
      setFormData({
        title: '',
        description: '',
        type: 'task',
        priority: 1,
        assigned_to: '',
        due_date: '',
        tags: '',
      })
    } catch (err) {
      console.error('Error creating item:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create New Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter item title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter item description"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="story">Story</option>
                <option value="epic">Epic</option>
                <option value="ticket">Ticket</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority.toString()}
                onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="0">None</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
                <option value="4">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To</Label>
              <select
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || 
                     (member.first_name && member.last_name 
                       ? `${member.first_name} ${member.last_name}`
                       : member.first_name) ||
                     member.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}