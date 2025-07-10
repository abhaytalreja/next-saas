'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@nextsaas/ui'
import { Input } from '@nextsaas/ui'
import { Badge } from '@nextsaas/ui'
import { Button } from '@nextsaas/ui'
import { Label } from '@nextsaas/ui'
import { toast } from 'sonner'
import { 
  Users, 
  Search, 
  Filter, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  Briefcase,
  Clock
} from 'lucide-react'

interface OrganizationProfile {
  profile_id: string
  user_id: string
  email: string
  display_name: string
  title?: string
  department?: string
  bio?: string
  phone?: string
  location?: string
  start_date?: string
  pronouns?: string
  status?: string
  skills?: string[]
  visibility: 'public' | 'organization' | 'private'
  role: string
  member_status: string
  joined_at: string
  last_seen_at?: string
}

interface Department {
  department: string
  member_count: number
}

interface Skill {
  skill: string
  member_count: number
}

interface OrganizationDirectoryProps {
  className?: string
}

export function OrganizationDirectory({ className = '' }: OrganizationDirectoryProps) {
  const { currentOrganization } = useOrganization()
  const [profiles, setProfiles] = useState<OrganizationProfile[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Load organization directory data
  useEffect(() => {
    if (!currentOrganization) return

    const loadDirectoryData = async () => {
      setLoading(true)
      try {
        // Load profiles, departments, and skills in parallel
        const [profilesResponse, departmentsResponse, skillsResponse] = await Promise.all([
          fetch(`/api/organization/${currentOrganization.id}/directory`),
          fetch(`/api/organization/${currentOrganization.id}/departments`),
          fetch(`/api/organization/${currentOrganization.id}/skills`)
        ])

        const [profilesData, departmentsData, skillsData] = await Promise.all([
          profilesResponse.json(),
          departmentsResponse.json(),
          skillsResponse.json()
        ])

        if (profilesData.success) {
          setProfiles(profilesData.profiles || [])
        }
        if (departmentsData.success) {
          setDepartments(departmentsData.departments || [])
        }
        if (skillsData.success) {
          setSkills(skillsData.skills || [])
        }
      } catch (error) {
        console.error('Error loading directory data:', error)
        toast.error('Failed to load organization directory')
      } finally {
        setLoading(false)
      }
    }

    loadDirectoryData()
  }, [currentOrganization])

  // Filter profiles based on search and filters
  const filteredProfiles = profiles.filter(profile => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        profile.display_name.toLowerCase().includes(query) ||
        profile.title?.toLowerCase().includes(query) ||
        profile.department?.toLowerCase().includes(query) ||
        profile.bio?.toLowerCase().includes(query) ||
        profile.skills?.some(skill => skill.toLowerCase().includes(query))
      
      if (!matchesSearch) return false
    }

    // Department filter
    if (selectedDepartment && profile.department !== selectedDepartment) {
      return false
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      const hasRequiredSkills = selectedSkills.every(skill => 
        profile.skills?.includes(skill)
      )
      if (!hasRequiredSkills) return false
    }

    return true
  })

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('')
    setSelectedSkills([])
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  if (!currentOrganization) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Selected</h3>
            <p className="text-gray-600">Please select an organization to view the directory.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Organization Directory</span>
          </CardTitle>
          <CardDescription>
            Browse and connect with members of {currentOrganization.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, title, department, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {(selectedDepartment || selectedSkills.length > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {(selectedDepartment ? 1 : 0) + selectedSkills.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department Filter */}
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.department} value={dept.department}>
                          {dept.department} ({dept.member_count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <Label>Skills ({selectedSkills.length} selected)</Label>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 20).map(skill => (
                          <Badge
                            key={skill.skill}
                            variant={selectedSkills.includes(skill.skill) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleSkillFilter(skill.skill)}
                          >
                            {skill.skill} ({skill.member_count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading directory...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredProfiles.length} of {profiles.length} members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map(profile => (
              <Card key={profile.profile_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{profile.display_name}</span>
                          {profile.pronouns && (
                            <span className="text-sm text-gray-500 font-normal">
                              ({profile.pronouns})
                            </span>
                          )}
                        </h4>
                        {profile.title && (
                          <p className="text-sm text-gray-600">{profile.title}</p>
                        )}
                        {profile.department && (
                          <p className="text-sm text-gray-500">{profile.department}</p>
                        )}
                      </div>
                      <Badge variant="outline" size="sm">
                        {profile.role}
                      </Badge>
                    </div>

                    {/* Status */}
                    {profile.status && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{profile.status}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">{profile.bio}</p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{profile.phone}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{profile.location}</span>
                        </div>
                      )}
                      {profile.start_date && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Started {formatDate(profile.start_date)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {profile.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {profile.skills.length > 3 && (
                            <Badge variant="outline" size="sm">
                              +{profile.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                      <span>Joined {formatDate(profile.joined_at)}</span>
                      <span>Last seen {getTimeAgo(profile.last_seen_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProfiles.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedDepartment || selectedSkills.length > 0
                  ? 'Try adjusting your search criteria.'
                  : 'No members have set up their organization profiles yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}