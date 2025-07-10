'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  Trash2, 
  Info, 
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Database,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface DeletionStatus {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  scheduledFor: string
  requestedAt: string
  reason?: string
  canCancel: boolean
  daysRemaining: number
  isOverdue: boolean
  canStillCancel: boolean
  formattedScheduledDate: string
  formattedRequestDate: string
}

interface DeletionInfo {
  hasPendingDeletion: boolean
  deletion?: DeletionStatus
  canRequestNew: boolean
  info: {
    gracePeriodDays: number
    whatGetsDeleted: string[]
    whatIsRetained: string[]
    gdprRights: string[]
  }
}

export function AccountDeletionManager() {
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  
  // Form state
  const [confirmationText, setConfirmationText] = useState('')
  const [reason, setReason] = useState('')
  const [understandConsequences, setUnderstandConsequences] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    loadDeletionStatus()
  }, [])

  const loadDeletionStatus = async () => {
    try {
      const response = await fetch('/api/profile/delete-account')
      
      if (response.ok) {
        const data = await response.json()
        setDeletionInfo(data.data)
      } else {
        toast.error('Failed to load deletion status')
      }
    } catch (error) {
      console.error('Error loading deletion status:', error)
      toast.error('Failed to load deletion status')
    } finally {
      setLoading(false)
    }
  }

  const requestDeletion = async () => {
    if (!understandConsequences) {
      toast.error('You must acknowledge that you understand the consequences')
      return
    }

    if (confirmationText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" exactly as shown')
      return
    }

    setRequesting(true)

    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmation_text: confirmationText,
          reason: reason || undefined,
          understand_consequences: understandConsequences
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.data.message)
        setShowConfirmation(false)
        setConfirmationText('')
        setReason('')
        setUnderstandConsequences(false)
        loadDeletionStatus() // Refresh status
      } else {
        toast.error(result.error || 'Failed to request account deletion')
        if (result.field_errors) {
          Object.values(result.field_errors).forEach((error: any) => {
            toast.error(error)
          })
        }
      }
    } catch (error) {
      console.error('Error requesting deletion:', error)
      toast.error('Failed to request account deletion')
    } finally {
      setRequesting(false)
    }
  }

  const cancelDeletion = async () => {
    if (!deletionInfo?.deletion?.id) return

    setCancelling(true)

    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deletion_id: deletionInfo.deletion.id,
          reason: 'User cancelled via dashboard'
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.data.message)
        loadDeletionStatus() // Refresh status
      } else {
        toast.error(result.error || 'Failed to cancel deletion')
      }
    } catch (error) {
      console.error('Error cancelling deletion:', error)
      toast.error('Failed to cancel deletion')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'cancelled':
        return 'text-gray-700 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading account deletion information...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!deletionInfo) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load account deletion information. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* GDPR Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Right to Erasure (GDPR Article 17)</AlertTitle>
        <AlertDescription>
          You have the right to request deletion of your personal data. We provide a 30-day grace period 
          during which you can cancel the deletion request if you change your mind.
        </AlertDescription>
      </Alert>

      {/* Current Deletion Status */}
      {deletionInfo.hasPendingDeletion && deletionInfo.deletion && (
        <Card className={`border-l-4 ${getStatusColor(deletionInfo.deletion.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(deletionInfo.deletion.status)}
              <span>Account Deletion Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <p className="text-lg font-semibold capitalize">{deletionInfo.deletion.status}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Scheduled For</Label>
                <p className="text-lg font-semibold">{deletionInfo.deletion.formattedScheduledDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Days Remaining</Label>
                <p className="text-lg font-semibold">
                  {deletionInfo.deletion.daysRemaining} days
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Requested</Label>
                <p className="text-lg font-semibold">{deletionInfo.deletion.formattedRequestDate}</p>
              </div>
            </div>

            {deletionInfo.deletion.status === 'pending' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Progress</Label>
                  <Progress 
                    value={Math.max(0, 100 - (deletionInfo.deletion.daysRemaining / 30) * 100)} 
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Grace period: {deletionInfo.deletion.daysRemaining} of 30 days remaining
                  </p>
                </div>

                {deletionInfo.deletion.canStillCancel && (
                  <Button
                    variant="outline"
                    onClick={cancelDeletion}
                    disabled={cancelling}
                    className="w-full"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Deletion Request
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {deletionInfo.deletion.reason && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Reason</Label>
                <p className="text-sm text-gray-800">{deletionInfo.deletion.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deletion Request Form */}
      {deletionInfo.canRequestNew && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Account</span>
            </CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showConfirmation ? (
              <Button
                variant="destructive"
                onClick={() => setShowConfirmation(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Request Account Deletion
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning: This action is irreversible</AlertTitle>
                  <AlertDescription>
                    Once confirmed, your account will be scheduled for deletion. You will have 30 days to cancel this request.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reason">Reason for deletion (optional)</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Help us improve by sharing why you're leaving..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmation">Type "DELETE MY ACCOUNT" to confirm</Label>
                    <Input
                      id="confirmation"
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="DELETE MY ACCOUNT"
                      className="mt-1 font-mono"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="understand"
                      checked={understandConsequences}
                      onCheckedChange={(checked) => setUnderstandConsequences(checked as boolean)}
                    />
                    <Label htmlFor="understand" className="text-sm">
                      I understand that this will delete all my data and cannot be undone
                    </Label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmation(false)
                      setConfirmationText('')
                      setReason('')
                      setUnderstandConsequences(false)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={requestDeletion}
                    disabled={requesting || confirmationText !== 'DELETE MY ACCOUNT' || !understandConsequences}
                    className="flex-1"
                  >
                    {requesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Confirm Deletion
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Gets Deleted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-red-500" />
              <span>What Gets Deleted</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {deletionInfo.info.whatGetsDeleted.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* What Is Retained */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>What Is Retained</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {deletionInfo.info.whatIsRetained.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* GDPR Rights Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-500" />
            <span>Your GDPR Rights</span>
          </CardTitle>
          <CardDescription>
            Under the General Data Protection Regulation, you have the following rights:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {deletionInfo.info.gdprRights.map((right, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{right}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Grace Period Information */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertTitle>30-Day Grace Period</AlertTitle>
        <AlertDescription>
          After requesting account deletion, you have {deletionInfo.info.gracePeriodDays} days to change your mind. 
          During this period, your account remains active and you can cancel the deletion request at any time.
        </AlertDescription>
      </Alert>
    </div>
  )
}