'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@nextsaas/ui'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

const invitationSchema = z.object({
  emails: z.array(z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'member']),
  })).min(1, 'At least one email is required'),
  message: z.string().optional(),
})

type InvitationFormData = z.infer<typeof invitationSchema>

interface InvitationFormProps {
  onSubmit: (data: InvitationFormData) => Promise<void>
  onCancel?: () => void
  defaultRole?: 'admin' | 'member'
  maxInvites?: number
  className?: string
}

export function InvitationForm({
  onSubmit,
  onCancel,
  defaultRole = 'member',
  maxInvites = 10,
  className = '',
}: InvitationFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailFields, setEmailFields] = useState([{ id: '1', email: '', role: defaultRole }])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      emails: [{ email: '', role: defaultRole }],
      message: '',
    },
  })

  const addEmailField = () => {
    if (emailFields.length < maxInvites) {
      const newField = { id: Date.now().toString(), email: '', role: defaultRole }
      setEmailFields([...emailFields, newField])
    }
  }

  const removeEmailField = (id: string) => {
    if (emailFields.length > 1) {
      setEmailFields(emailFields.filter(field => field.id !== id))
    }
  }

  const handleFormSubmit = async (data: InvitationFormData) => {
    setLoading(true)
    setError(null)

    try {
      // Filter out empty emails
      const validEmails = data.emails.filter(e => e.email.trim() !== '')
      
      if (validEmails.length === 0) {
        setError('Please enter at least one email address')
        return
      }

      await onSubmit({ ...data, emails: validEmails })
    } catch (err: any) {
      setError(err.message || 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Email Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Addresses
        </label>
        <div className="space-y-3">
          {emailFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  {...register(`emails.${index}.email` as const)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.emails?.[index]?.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.emails[index]?.email?.message}
                  </p>
                )}
              </div>
              
              <select
                {...register(`emails.${index}.role` as const)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>

              {emailFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmailField(field.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  aria-label="Remove email"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {emailFields.length < maxInvites && (
          <button
            type="button"
            onClick={addEmailField}
            className="mt-3 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add another
          </button>
        )}
      </div>

      {/* Optional Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Personal Message (Optional)
        </label>
        <textarea
          id="message"
          rows={3}
          {...register('message')}
          placeholder="Add a personal message to your invitation..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      {/* Role Explanation */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div>
            <span className="font-medium text-gray-700">Admin:</span> Can manage team members, 
            organization settings, and have full access to all features.
          </div>
          <div>
            <span className="font-medium text-gray-700">Member:</span> Can access organization 
            resources but cannot manage settings or invite new members.
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          Send {emailFields.filter(f => f.email).length > 1 ? 'Invitations' : 'Invitation'}
        </Button>
      </div>
    </form>
  )
}