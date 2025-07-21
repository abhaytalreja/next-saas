'use client'

import { useState } from 'react'
import { TrashIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'
import { Button, Input, Textarea, Switch, Label, LegacyCard as Card, LegacyCardContent as CardContent, LegacyCardHeader as CardHeader, LegacyCardTitle as CardTitle } from '@nextsaas/ui'

interface Project {
  id: string
  name: string
  slug: string
  description?: string
  type: string
  settings: any
  metadata: any
  is_archived: boolean
}

interface ProjectSettingsProps {
  project: Project
  onUpdate: (updates: Partial<Project>) => Promise<void>
  onArchive: () => Promise<void>
  onDelete: () => void
  canDelete: boolean
}

export function ProjectSettings({
  project,
  onUpdate,
  onArchive,
  onDelete,
  canDelete,
}: ProjectSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || '',
    type: project.type,
    settings: project.settings || {},
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onUpdate(formData)
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving project:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: project.name,
      description: project.description || '',
      type: project.type,
      settings: project.settings || {},
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Basic Information</CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter project name"
              />
            ) : (
              <div className="text-gray-900">{project.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter project description"
                rows={3}
              />
            ) : (
              <div className="text-gray-900">
                {project.description || 'No description provided'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Project Type</Label>
            {isEditing ? (
              <select
                id="type"
                value={formData.type}
                onChange={e =>
                  setFormData(prev => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="software">Software</option>
                <option value="marketing">Marketing</option>
                <option value="design">Design</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <div className="text-gray-900 capitalize">{project.type}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Project Slug</Label>
            <div className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
              {project.slug}
            </div>
            <p className="text-xs text-gray-500">
              This is the unique identifier for your project in URLs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Public Project</Label>
              <p className="text-sm text-gray-500">
                Allow anyone in the organization to view this project
              </p>
            </div>
            <Switch
              checked={formData.settings?.isPublic || false}
              onCheckedChange={checked =>
                setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, isPublic: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Comments</Label>
              <p className="text-sm text-gray-500">
                Enable commenting on project items
              </p>
            </div>
            <Switch
              checked={formData.settings?.allowComments !== false}
              onCheckedChange={checked =>
                setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, allowComments: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Notifications</Label>
              <p className="text-sm text-gray-500">
                Send notifications for project updates
              </p>
            </div>
            <Switch
              checked={formData.settings?.enableNotifications !== false}
              onCheckedChange={checked =>
                setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, enableNotifications: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div>
              <h4 className="font-medium text-orange-800">
                {project.is_archived ? 'Unarchive Project' : 'Archive Project'}
              </h4>
              <p className="text-sm text-orange-700">
                {project.is_archived
                  ? 'Restore this project and make it active again.'
                  : 'Archive this project to hide it from active projects.'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onArchive}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <ArchiveBoxIcon className="h-4 w-4 mr-2" />
              {project.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
          </div>

          {canDelete && (
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-800">Delete Project</h4>
                <p className="text-sm text-red-700">
                  Permanently delete this project and all its data. This action
                  cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onDelete}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
