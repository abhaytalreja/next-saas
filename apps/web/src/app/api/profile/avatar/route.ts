import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@nextsaas/supabase'
import { UniversalProfileManager } from '@nextsaas/auth'
import { createActivityService } from '@nextsaas/auth/services/activity-service'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = getFileExtension(file.type)
    const fileName = `${session.user.id}/avatar-${timestamp}.${extension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Save avatar metadata to database
    const { data: avatar, error: dbError } = await supabase
      .from('user_avatars')
      .insert({
        user_id: session.user.id,
        storage_path: fileName,
        storage_bucket: 'avatars',
        public_url: publicUrl,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_processed: true,
        processing_status: 'completed',
        is_active: false,
        is_approved: true,
        virus_scan_status: 'clean',
        uploaded_via: 'web',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file
      await supabase.storage.from('avatars').remove([fileName])
      return NextResponse.json(
        { success: false, error: 'Failed to save avatar data' },
        { status: 500 }
      )
    }

    // Log activity using activity service
    const activityService = createActivityService(supabase)
    await activityService.trackProfileActivity(
      {
        userId: session.user.id,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
        userAgent: req.headers.get('user-agent') || undefined
      },
      {
        action: 'avatar_upload',
        details: {
          avatar_id: avatar.id,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: fileName
        },
        metadata: {
          method: 'POST',
          endpoint: '/api/profile/avatar'
        }
      }
    )

    return NextResponse.json({
      success: true,
      avatar: {
        id: avatar.id,
        public_url: publicUrl,
        original_filename: file.name
      }
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { avatarId, action } = await req.json()
    
    if (!avatarId || !action) {
      return NextResponse.json(
        { success: false, error: 'Avatar ID and action are required' },
        { status: 400 }
      )
    }

    if (action === 'activate') {
      // Deactivate all current avatars
      await supabase
        .from('user_avatars')
        .update({ is_active: false })
        .eq('user_id', session.user.id)
        .eq('is_active', true)

      // Activate selected avatar
      const { data: avatar, error: activateError } = await supabase
        .from('user_avatars')
        .update({ is_active: true })
        .eq('id', avatarId)
        .eq('user_id', session.user.id)
        .select('public_url')
        .single()

      if (activateError) {
        return NextResponse.json(
          { success: false, error: 'Failed to activate avatar' },
          { status: 500 }
        )
      }

      // Update profile avatar URL
      await supabase
        .from('profiles')
        .update({ avatar_url: avatar.public_url })
        .eq('id', session.user.id)

      // Log activity
      const activityService = createActivityService(supabase)
      await activityService.trackUserActivity(
        {
          userId: session.user.id,
          ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
          userAgent: req.headers.get('user-agent') || undefined
        },
        'avatar_activate',
        'avatar',
        {
          avatar_id: avatarId,
          avatar_url: avatar.public_url,
          method: 'PATCH',
          endpoint: '/api/profile/avatar'
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Avatar activated successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Avatar update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const avatarId = searchParams.get('id')
    
    if (!avatarId) {
      return NextResponse.json(
        { success: false, error: 'Avatar ID is required' },
        { status: 400 }
      )
    }

    // Get avatar data
    const { data: avatar, error: fetchError } = await supabase
      .from('user_avatars')
      .select('storage_path, is_active')
      .eq('id', avatarId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    await supabase.storage
      .from('avatars')
      .remove([avatar.storage_path])

    // Delete from database
    const { error: deleteError } = await supabase
      .from('user_avatars')
      .delete()
      .eq('id', avatarId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete avatar' },
        { status: 500 }
      )
    }

    // If this was the active avatar, clear user's avatar_url
    if (avatar.is_active) {
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session.user.id)
    }

    // Log activity
    const activityService = createActivityService(supabase)
    await activityService.trackProfileActivity(
      {
        userId: session.user.id,
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip,
        userAgent: req.headers.get('user-agent') || undefined
      },
      {
        action: 'avatar_delete',
        details: {
          avatar_id: avatarId,
          storage_path: avatar.storage_path,
          was_active: avatar.is_active
        },
        metadata: {
          method: 'DELETE',
          endpoint: '/api/profile/avatar'
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    })
  } catch (error) {
    console.error('Avatar deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return extensions[mimeType] || 'jpg'
}