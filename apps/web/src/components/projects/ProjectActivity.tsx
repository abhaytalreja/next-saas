'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import {
  ClockIcon,
  UserCircleIcon,
  DocumentIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Activity {
  id: string
  action: string
  entity_type: string
  entity_id: string
  entity_title?: string
  description?: string
  metadata?: any
  created_at: string
  user_id: string
  user?: {
    id: string
    full_name?: string
    email: string
    avatar_url?: string
  }
}

interface ProjectActivityProps {
  projectId: string
}

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const { supabase } = useSupabase()

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [projectId])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          *,
          user:users!user_id(id, full_name, email, avatar_url)
        `
        )
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setActivities(data || [])
    } catch (err: any) {
      console.error('Error fetching activities:', err)
      setError(err.message || 'Failed to load activity')
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    if (action.includes('created')) {
      return <PlusIcon className="h-4 w-4 text-green-600" />
    } else if (action.includes('updated')) {
      return <PencilIcon className="h-4 w-4 text-blue-600" />
    } else if (action.includes('deleted')) {
      return <TrashIcon className="h-4 w-4 text-red-600" />
    } else {
      return <DocumentIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (action: string) => {
    if (action.includes('created')) {
      return 'bg-green-100 text-green-800'
    } else if (action.includes('updated')) {
      return 'bg-blue-100 text-blue-800'
    } else if (action.includes('deleted')) {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
  }

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
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No activity yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as team members work on this project.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {activity.user?.avatar_url ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.user.avatar_url}
                        alt={activity.user.full_name || activity.user.email}
                      />
                      <AvatarFallback>
                        {(activity.user.full_name || activity.user.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(activity.action)}
                    <Badge
                      variant="secondary"
                      className={getActivityColor(activity.action)}
                    >
                      {formatAction(activity.action)}
                    </Badge>
                  </div>

                  <div className="mt-1">
                    <span className="font-medium text-gray-900">
                      {activity.user?.full_name ||
                        activity.user?.email ||
                        'Unknown user'}
                    </span>
                    <span className="text-gray-700 ml-1">
                      {activity.description ||
                        `${formatAction(activity.action)} ${activity.entity_title || activity.entity_type}`}
                    </span>
                  </div>

                  {activity.entity_title && (
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">
                        {activity.entity_title}
                      </span>
                    </div>
                  )}

                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </div>

                  {activity.metadata &&
                    Object.keys(activity.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View details
                        </summary>
                        <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
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
