'use client'

import React, { useState } from 'react'
import { 
  MoreHorizontal, 
  X, 
  Mail, 
  UserX, 
  UserCheck, 
  Trash2, 
  Download,
  AlertTriangle
} from 'lucide-react'
import {
  Button,
  Badge
} from '@nextsaas/ui'

export interface BulkAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive'
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationDescription?: string
  disabled?: boolean
  action: (selectedIds: string[]) => void | Promise<void>
}

interface BulkActionsProps {
  selectedIds: string[]
  onClearSelection: () => void
  actions: BulkAction[]
  className?: string
  maxSelectedDisplay?: number
}

export function BulkActions({
  selectedIds,
  onClearSelection,
  actions,
  className = '',
  maxSelectedDisplay = 3
}: BulkActionsProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null)
  const [showAllActions, setShowAllActions] = useState(false)

  const selectedCount = selectedIds.length

  if (selectedCount === 0) {
    return null
  }

  const handleActionClick = (action: BulkAction) => {
    if (action.disabled) return

    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        action.confirmationDescription || 
        `Are you sure you want to perform this action on ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'}? This action cannot be undone.`
      )
      if (confirmed) {
        executeAction(action)
      }
    } else {
      executeAction(action)
    }
  }

  const executeAction = async (action: BulkAction) => {
    if (isExecuting || action.disabled) return

    setIsExecuting(true)

    try {
      await action.action(selectedIds)
    } catch (error) {
      console.error('Bulk action failed:', error)
      // In a real app, you'd show a toast notification here
    } finally {
      setIsExecuting(false)
      setConfirmAction(null)
    }
  }

  const formatSelectedText = () => {
    if (selectedCount <= maxSelectedDisplay) {
      return `${selectedCount} selected`
    }
    return `${selectedCount} selected`
  }

  return (
    <>
      <div className={`flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {formatSelectedText()}
          </Badge>
          
          <div className="text-sm text-blue-700">
            {selectedCount === 1 ? 'item' : 'items'} selected
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Show all actions or first few */}
          {(showAllActions ? actions : actions.slice(0, 3)).map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                size="sm"
                onClick={() => handleActionClick(action)}
                disabled={isExecuting || action.disabled}
                className="text-xs"
              >
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {action.label}
              </Button>
            )
          })}

          {/* Show more button */}
          {actions.length > 3 && !showAllActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllActions(true)}
              disabled={isExecuting}
              className="text-xs"
            >
              <MoreHorizontal className="h-3 w-3 mr-1" />
              More
            </Button>
          )}

          {/* Show less button */}
          {showAllActions && actions.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllActions(false)}
              disabled={isExecuting}
              className="text-xs"
            >
              Less
            </Button>
          )}

          {/* Clear selection */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            disabled={isExecuting}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>
    </>
  )
}

// Predefined bulk actions for common use cases
export const createUserBulkActions = (
  onExport: (selectedIds: string[]) => void,
  onSuspend: (selectedIds: string[]) => Promise<void>,
  onActivate: (selectedIds: string[]) => Promise<void>,
  onDelete: (selectedIds: string[]) => Promise<void>,
  onSendEmail: (selectedIds: string[]) => void
): BulkAction[] => [
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    action: onExport
  },
  {
    id: 'send-email',
    label: 'Send Email',
    icon: Mail,
    action: onSendEmail
  },
  {
    id: 'activate',
    label: 'Activate',
    icon: UserCheck,
    action: onActivate
  },
  {
    id: 'suspend',
    label: 'Suspend',
    icon: UserX,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationTitle: 'Suspend Users',
    confirmationDescription: 'Are you sure you want to suspend the selected users? They will lose access to the platform until reactivated.',
    action: onSuspend
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationTitle: 'Delete Users',
    confirmationDescription: 'Are you sure you want to permanently delete the selected users? This action cannot be undone and will remove all their data.',
    action: onDelete
  }
]