'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { useOrganization } from '../../hooks/useOrganization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Button } from '@nextsaas/ui'
import { Input } from '@nextsaas/ui'
import { Label } from '@nextsaas/ui'
import { Textarea } from '@nextsaas/ui'
import { Badge } from '@nextsaas/ui'
import { toast } from 'sonner'
import { User, Building, Mail, Phone, Globe, MapPin, Briefcase, Calendar } from 'lucide-react'

// Organization-specific profile schema
const organizationProfileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(100),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  start_date: z.string().optional(),
  visibility: z.enum(['public', 'organization', 'private']),
  skills: z.array(z.string()).optional(),
  pronouns: z.string().max(20).optional(),
  status: z.string().max(100).optional(),
})

type OrganizationProfileFormData = z.infer<typeof organizationProfileSchema>

interface OrganizationProfileData {
  id?: string
  user_id: string
  organization_id: string
  display_name: string
  title?: string
  department?: string
  bio?: string
  phone?: string
  location?: string
  start_date?: string
  visibility: 'public' | 'organization' | 'private'
  skills?: string[]
  pronouns?: string
  status?: string
  created_at?: string
  updated_at?: string
}

interface OrganizationProfileFormProps {
  className?: string
}

export function OrganizationProfileForm({ className = '' }: OrganizationProfileFormProps) {
  const { user } = useAuth()
  const { currentOrganization, hasPermission } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [orgProfile, setOrgProfile] = useState<OrganizationProfileData | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch
  } = useForm<OrganizationProfileFormData>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      visibility: 'organization',
      skills: []
    }
  })

  const watchedValues = watch()

  // Load organization profile data
  useEffect(() => {
    if (!user || !currentOrganization) return

    const loadOrganizationProfile = async () => {
      try {
        const response = await fetch(`/api/profile/organization/${currentOrganization.id}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.profile) {
            setOrgProfile(data.profile)
            reset({
              display_name: data.profile.display_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email,
              title: data.profile.title || '',
              department: data.profile.department || '',
              bio: data.profile.bio || '',
              phone: data.profile.phone || '',
              location: data.profile.location || '',
              start_date: data.profile.start_date || '',
              visibility: data.profile.visibility || 'organization',
              skills: data.profile.skills || [],
              pronouns: data.profile.pronouns || '',
              status: data.profile.status || ''
            })
          } else {
            // No organization profile exists, use default values
            reset({
              display_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email,
              title: '',
              department: '',
              bio: '',
              phone: '',
              location: '',
              start_date: '',
              visibility: 'organization',
              skills: [],
              pronouns: '',
              status: ''
            })
          }
        }
      } catch (error) {
        console.error('Error loading organization profile:', error)
        toast.error('Failed to load organization profile')
      } finally {
        setInitialLoading(false)
      }
    }

    loadOrganizationProfile()
  }, [user, currentOrganization, reset])

  const onSubmit = async (data: OrganizationProfileFormData) => {
    if (!user || !currentOrganization) {
      toast.error('No organization selected')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/profile/organization/${currentOrganization.id}`, {
        method: orgProfile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          user_id: user.id,
          organization_id: currentOrganization.id
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setOrgProfile(result.profile)
        toast.success(orgProfile ? 'Organization profile updated successfully!' : 'Organization profile created successfully!')
      } else {
        toast.error(result.error || 'Failed to save organization profile')
      }
    } catch (error) {
      console.error('Error saving organization profile:', error)
      toast.error('Failed to save organization profile')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = (skill: string) => {
    if (!skill.trim()) return
    const currentSkills = watchedValues.skills || []
    if (!currentSkills.includes(skill.trim())) {
      setValue('skills', [...currentSkills, skill.trim()], { shouldDirty: true })
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = watchedValues.skills || []
    setValue('skills', currentSkills.filter(skill => skill !== skillToRemove), { shouldDirty: true })
  }

  if (initialLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2">Loading organization profile...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentOrganization) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Selected</h3>
            <p className="text-gray-600">Please select an organization to manage your organization profile.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="h-5 w-5" />
          <span>Organization Profile</span>
        </CardTitle>
        <CardDescription>
          Manage how you appear to other members in <strong>{currentOrganization.name}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-6"
          noValidate
          aria-label="Organization profile settings"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  {...register('display_name')}
                  error={errors.display_name?.message}
                  placeholder="How you want to appear to others"
                />
              </div>

              <div>
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  {...register('pronouns')}
                  error={errors.pronouns?.message}
                  placeholder="they/them, she/her, he/him"
                />
              </div>

              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  error={errors.title?.message}
                  placeholder="Software Engineer, Product Manager"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register('department')}
                  error={errors.department?.message}
                  placeholder="Engineering, Marketing, Sales"
                />
              </div>

              <div>
                <Label htmlFor="phone">Work Phone</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  error={errors.phone?.message}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  error={errors.location?.message}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                  error={errors.start_date?.message}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  {...register('status')}
                  error={errors.status?.message}
                  placeholder="🌴 On vacation, 🏠 Working from home"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                error={errors.bio?.message}
                placeholder="Tell your team about yourself, your role, and what you're working on..."
                className="min-h-20"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Skills & Expertise
            </h4>
            
            <div>
              <Label>Skills</Label>
              <div className="mt-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(watchedValues.skills || []).map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add a skill (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter to add skills</p>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Privacy Settings</h4>
            
            <div>
              <Label htmlFor="visibility">Profile Visibility</Label>
              <select
                id="visibility"
                {...register('visibility')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="organization">Organization - Visible to organization members only</option>
                <option value="private">Private - Only visible to you</option>
              </select>
              {errors.visibility && (
                <p className="text-sm text-red-600 mt-1">{errors.visibility.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || loading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={loading || !isDirty}
              className="min-w-32"
            >
              {loading ? 'Saving...' : orgProfile ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}