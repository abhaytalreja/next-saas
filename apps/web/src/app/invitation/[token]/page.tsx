'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthLayout } from '@nextsaas/auth'
import { useAuth } from '@nextsaas/auth'
import { Button, Alert, Spinner } from '@nextsaas/ui'
import {
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

interface InvitationDetails {
  id: string
  organizationName: string
  organizationId: string
  inviterName: string
  inviterEmail: string
  role: 'admin' | 'member'
  expiresAt: string
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    fetchInvitationDetails()
  }, [token])

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true)

      // In production, this would be an API call
      // Simulating API response
      setTimeout(() => {
        setInvitation({
          id: '123',
          organizationName: 'Acme Corporation',
          organizationId: 'org_123',
          inviterName: 'John Doe',
          inviterEmail: 'john@acme.com',
          role: 'member',
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        setLoading(false)
      }, 1000)
    } catch (err) {
      setError('Invalid or expired invitation link')
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Store invitation token and redirect to sign up
      sessionStorage.setItem('pending_invitation', token)
      router.push(`/auth/sign-up?invitation=${token}`)
      return
    }

    try {
      setAccepting(true)

      // In production, this would call the accept invitation API
      const response = await fetch('/api/organization/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept invitation')
      }

      setAccepted(true)

      // Redirect to organization after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  const handleDeclineInvitation = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <AuthLayout title="Loading Invitation..." showLogo={true}>
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              Loading invitation details...
            </p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (error && !invitation) {
    return (
      <AuthLayout title="Invalid Invitation" showLogo={true}>
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircleIcon className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            <p className="text-sm text-gray-600 mb-6">
              This invitation link may have expired or already been used.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Home
            </Button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (accepted) {
    return (
      <AuthLayout title="Invitation Accepted!" showLogo={true}>
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to {invitation?.organizationName}!
            </h3>
            <p className="text-sm text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="You're Invited!"
      subtitle={`Join ${invitation?.organizationName}`}
      showLogo={true}
    >
      <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
        {error && (
          <Alert type="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {invitation && (
          <>
            {/* Organization Info */}
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-lg bg-gray-100 mb-4">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {invitation.organizationName}
              </h2>
              <p className="text-sm text-gray-600">
                {invitation.inviterName} ({invitation.inviterEmail}) has invited
                you to join as a{' '}
                <span className="font-medium text-gray-900">
                  {invitation.role === 'admin'
                    ? 'Administrator'
                    : 'Team Member'}
                </span>
              </p>
            </div>

            {/* Role Description */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {invitation.role === 'admin'
                      ? 'Administrator Access'
                      : 'Member Access'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {invitation.role === 'admin'
                      ? "You'll have access to manage team members, organization settings, and all features."
                      : "You'll have access to organization resources and can collaborate with your team."}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!user && (
                <p className="text-sm text-gray-600 text-center mb-4">
                  You'll need to create an account or sign in to accept this
                  invitation.
                </p>
              )}

              <Button
                onClick={handleAcceptInvitation}
                loading={accepting}
                disabled={accepting}
                className="w-full"
              >
                {user ? 'Accept Invitation' : 'Sign Up & Accept'}
              </Button>

              {user && (
                <Button
                  onClick={() => router.push('/auth/sign-in')}
                  variant="outline"
                  className="w-full"
                >
                  Sign In with Different Account
                </Button>
              )}

              <button
                onClick={handleDeclineInvitation}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Decline Invitation
              </button>
            </div>

            {/* Expiration Notice */}
            <p className="mt-6 text-xs text-center text-gray-500">
              This invitation expires on{' '}
              {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
