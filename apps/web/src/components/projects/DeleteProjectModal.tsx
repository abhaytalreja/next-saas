'use client'

import { useState } from 'react'
import { X, AlertTriangleIcon } from 'lucide-react'
import { Button, Input, Label } from '@nextsaas/ui'

interface Project {
  id: string
  name: string
}

interface DeleteProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onDelete: () => Promise<void>
}

export function DeleteProjectModal({
  project,
  isOpen,
  onClose,
  onDelete,
}: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (confirmText !== project.name) {
      alert('Please type the project name exactly to confirm deletion')
      return
    }

    try {
      setIsLoading(true)
      await onDelete()
    } catch (err) {
      console.error('Error deleting project:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setConfirmText('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Project
            </h2>
          </div>
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
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This will permanently delete the project "{project.name}"
                      and all of its data, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All project items and content</li>
                      <li>Project member associations</li>
                      <li>Project settings and configuration</li>
                      <li>Activity history and logs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <strong>{project.name}</strong> to confirm deletion:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={project.name}
                disabled={isLoading}
                className="font-mono"
              />
            </div>
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
              variant="destructive"
              disabled={isLoading || confirmText !== project.name}
            >
              {isLoading ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
