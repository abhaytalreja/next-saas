import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface CreateOrganizationParams {
  name: string
  ownerId: string
  slug?: string
  description?: string
  settings?: any
}

export async function createTestOrganization(params: CreateOrganizationParams) {
  try {
    const { name, ownerId, slug, description, settings } = params
    
    // Generate slug if not provided
    const orgSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug: orgSlug,
        description: description || `Test organization: ${name}`,
        status: 'active',
        settings: settings || {
          max_workspaces: 10,
          max_members: 50,
          features: ['workspaces', 'projects', 'api_access']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`)
    }
    
    // Add owner as organization member
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        user_id: ownerId,
        organization_id: organization.id,
        role: 'owner',
        status: 'active',
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      })
    
    if (memberError) {
      console.warn('Failed to add owner as member:', memberError.message)
    }
    
    console.log(`Created test organization: ${name} (${organization.id})`)
    
    return organization
  } catch (error) {
    console.error('Failed to create test organization:', error)
    throw error
  }
}

export async function addOrganizationMember(organizationId: string, userId: string, role: string = 'member') {
  try {
    const { data: member, error } = await supabase
      .from('organization_members')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        role,
        status: 'active',
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to add organization member: ${error.message}`)
    }
    
    console.log(`Added member ${userId} to organization ${organizationId} with role ${role}`)
    
    return member
  } catch (error) {
    console.error('Failed to add organization member:', error)
    throw error
  }
}

export async function removeOrganizationMember(organizationId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(`Failed to remove organization member: ${error.message}`)
    }
    
    console.log(`Removed member ${userId} from organization ${organizationId}`)
  } catch (error) {
    console.error('Failed to remove organization member:', error)
    throw error
  }
}

export async function updateOrganizationMemberRole(organizationId: string, userId: string, newRole: string) {
  try {
    const { data: member, error } = await supabase
      .from('organization_members')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update member role: ${error.message}`)
    }
    
    console.log(`Updated member ${userId} role to ${newRole} in organization ${organizationId}`)
    
    return member
  } catch (error) {
    console.error('Failed to update member role:', error)
    throw error
  }
}

export async function createOrganizationInvitation(organizationId: string, email: string, role: string, invitedBy: string) {
  try {
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        status: 'pending',
        invited_by: invitedBy,
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to create invitation: ${error.message}`)
    }
    
    console.log(`Created invitation for ${email} to organization ${organizationId} with role ${role}`)
    
    return invitation
  } catch (error) {
    console.error('Failed to create invitation:', error)
    throw error
  }
}

export async function acceptOrganizationInvitation(invitationId: string, userId: string) {
  try {
    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single()
    
    if (inviteError || !invitation) {
      throw new Error(`Invitation not found: ${inviteError?.message}`)
    }
    
    // Add as organization member
    await addOrganizationMember(invitation.organization_id, userId, invitation.role)
    
    // Update invitation status
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId
      })
      .eq('id', invitationId)
    
    if (updateError) {
      console.warn('Failed to update invitation status:', updateError.message)
    }
    
    console.log(`Accepted invitation ${invitationId} for user ${userId}`)
    
    return invitation
  } catch (error) {
    console.error('Failed to accept invitation:', error)
    throw error
  }
}

export async function deleteTestOrganization(organizationId: string) {
  try {
    // Delete related data first (respecting foreign key constraints)
    const tables = [
      'invitations',
      'project_members',
      'projects',
      'workspace_members',
      'workspaces',
      'organization_members'
    ]
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('organization_id', organizationId)
      
      if (error && !error.message.includes('does not exist')) {
        console.warn(`Warning deleting ${table} for org ${organizationId}:`, error.message)
      }
    }
    
    // Delete organization
    const { error: orgError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organizationId)
    
    if (orgError) {
      console.warn(`Failed to delete organization ${organizationId}:`, orgError.message)
    }
    
    console.log(`Deleted test organization: ${organizationId}`)
  } catch (error) {
    console.error('Failed to delete test organization:', error)
  }
}

export async function getOrganizationMembers(organizationId: string) {
  try {
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        user:user_profiles(*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
    
    if (error) {
      throw new Error(`Failed to get organization members: ${error.message}`)
    }
    
    return members || []
  } catch (error) {
    console.error('Failed to get organization members:', error)
    return []
  }
}

export async function getOrganizationInvitations(organizationId: string) {
  try {
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
    
    if (error) {
      throw new Error(`Failed to get organization invitations: ${error.message}`)
    }
    
    return invitations || []
  } catch (error) {
    console.error('Failed to get organization invitations:', error)
    return []
  }
}

export async function updateOrganizationSettings(organizationId: string, settings: any) {
  try {
    const { data: organization, error } = await supabase
      .from('organizations')
      .update({ 
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to update organization settings: ${error.message}`)
    }
    
    console.log(`Updated settings for organization ${organizationId}`)
    
    return organization
  } catch (error) {
    console.error('Failed to update organization settings:', error)
    throw error
  }
}