'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@nextsaas/supabase'
import { PlusIcon, CalendarIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline'
import { Button, Badge, LegacyCard as Card, LegacyCardContent as CardContent, LegacyCardHeader as CardHeader, LegacyCardTitle as CardTitle } from '@nextsaas/ui'
import { CreateItemModal } from './CreateItemModal'

interface Item {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: number
  tags: string[]
  assigned_to?: string
  due_date?: string
  created_at: string
  updated_at: string
  created_by: string
  assignee?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    name?: string
    avatar_url?: string
  }
  creator?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    name?: string
    avatar_url?: string
  }
}

interface ProjectItemsProps {
  projectId: string
}

export function ProjectItems({ projectId }: ProjectItemsProps) {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/projects/${projectId}/items`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }

      const itemsData = await response.json()
      setItems(itemsData)
    } catch (err: any) {
      console.error('Error fetching items:', err)
      setError('Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchItems()
    }
  }, [projectId])

  const handleCreateItem = async (itemData: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        throw new Error('Failed to create item')
      }

      const newItem = await response.json()
      setItems(prev => [newItem, ...prev])
      setShowCreateModal(false)
    } catch (err: any) {
      console.error('Error creating item:', err)
      alert(err.message || 'Failed to create item')
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'bg-red-100 text-red-800'
    if (priority >= 2) return 'bg-yellow-100 text-yellow-800'
    if (priority >= 1) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPriorityText = (priority: number) => {
    if (priority >= 3) return 'High'
    if (priority >= 2) return 'Medium'
    if (priority >= 1) return 'Low'
    return 'None'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button
          variant="outline"
          onClick={fetchItems}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Project Items</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Item</span>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <PlusIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-500 text-center max-w-sm mb-4">
              Get started by creating your first item. Items can be tasks, tickets, or any other work items for this project.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create First Item</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {getPriorityText(item.priority)}
                      </Badge>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-gray-600 mb-3">{item.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {item.creator && (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4" />
                          <span>
                            {item.creator.name || 
                             (item.creator.first_name && item.creator.last_name 
                               ? `${item.creator.first_name} ${item.creator.last_name}`
                               : item.creator.first_name) ||
                             item.creator.email}
                          </span>
                        </div>
                      )}

                      {item.assignee && (
                        <div className="flex items-center space-x-1">
                          <span>Assigned to:</span>
                          <span className="font-medium">
                            {item.assignee.name || 
                             (item.assignee.first_name && item.assignee.last_name 
                               ? `${item.assignee.first_name} ${item.assignee.last_name}`
                               : item.assignee.first_name) ||
                             item.assignee.email}
                          </span>
                        </div>
                      )}

                      {item.due_date && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(item.due_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateItemModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateItem}
          projectId={projectId}
        />
      )}
    </div>
  )
}