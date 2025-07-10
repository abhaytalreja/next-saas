import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface ProfileCompleteness {
  percentage: number
  score: number
  total_fields: number
  completed_fields: number
  missing_fields: string[]
  suggestions: string[]
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Define profile fields with their weights
    const fields = [
      { key: 'first_name', weight: 2, label: 'First Name' },
      { key: 'last_name', weight: 2, label: 'Last Name' },
      { key: 'display_name', weight: 1, label: 'Display Name' },
      { key: 'bio', weight: 1, label: 'Bio' },
      { key: 'avatar_url', weight: 2, label: 'Profile Picture' },
      { key: 'phone_number', weight: 1, label: 'Phone Number' },
      { key: 'company', weight: 1, label: 'Company' },
      { key: 'job_title', weight: 1, label: 'Job Title' },
      { key: 'location', weight: 1, label: 'Location' },
      { key: 'timezone', weight: 1, label: 'Timezone' },
    ]

    // Calculate completeness
    let completedScore = 0
    let totalScore = 0
    const missingFields: string[] = []
    const suggestions: string[] = []

    fields.forEach(field => {
      totalScore += field.weight
      const value = profile[field.key]
      
      if (value && value.toString().trim().length > 0) {
        completedScore += field.weight
      } else {
        missingFields.push(field.key)
        
        // Add specific suggestions
        switch (field.key) {
          case 'first_name':
          case 'last_name':
            suggestions.push(`Add your ${field.label.toLowerCase()} for a more complete profile`)
            break
          case 'avatar_url':
            suggestions.push('Upload a profile picture to help others recognize you')
            break
          case 'bio':
            suggestions.push('Add a bio to tell others about yourself')
            break
          case 'company':
          case 'job_title':
            suggestions.push(`Add your ${field.label.toLowerCase()} for professional networking`)
            break
          case 'location':
            suggestions.push('Add your location to connect with people nearby')
            break
          case 'timezone':
            suggestions.push('Set your timezone for better scheduling coordination')
            break
          default:
            suggestions.push(`Complete your ${field.label.toLowerCase()}`)
        }
      }
    })

    const percentage = Math.round((completedScore / totalScore) * 100)

    const completeness: ProfileCompleteness = {
      percentage,
      score: completedScore,
      total_fields: fields.length,
      completed_fields: fields.length - missingFields.length,
      missing_fields: missingFields,
      suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
    }

    return NextResponse.json({
      success: true,
      data: { completeness }
    })
  } catch (error) {
    console.error('Profile completeness error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}