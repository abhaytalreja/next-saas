import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
// TODO: Re-enable when packages are properly exported
// import { avatarUploadSchema } from '@nextsaas/auth/validation/profile-schemas'
// import { AvatarService } from '@nextsaas/auth/services/avatar-service'
import { z } from 'zod'

const deleteAvatarSchema = z.object({
  avatar_id: z.string().uuid('Invalid avatar ID'),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const replaceExisting = formData.get('replace_existing') === 'true'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // TODO: Re-enable when packages are properly exported
    // Validate file
    // const validationResult = avatarUploadSchema.safeParse({
    //   file,
    //   replace_existing: replaceExisting,
    // })

    // if (!validationResult.success) {
    //   return NextResponse.json(
    //     { 
    //       success: false, 
    //       error: 'Invalid file',
    //       errors: validationResult.error.errors 
    //     },
    //     { status: 400 }
    //   )
    // }

    // const avatarService = new AvatarService()

    // Upload and process avatar
    // const uploadResult = await avatarService.uploadAvatar(
    //   session.user.id,
    //   file,
    //   { replaceExisting }
    // )

    // if (!uploadResult.success) {
    //   return NextResponse.json(
    //     { success: false, error: uploadResult.error },
    //     { status: 400 }
    //   )
    // }

    // Temporary implementation
    return NextResponse.json(
      { success: false, error: 'Avatar upload service not available' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { avatar_id } = deleteAvatarSchema.parse(body)

    // Get avatar details to verify ownership
    const { data: avatar, error: avatarError } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('id', avatar_id)
      .eq('user_id', session.user.id)
      .single()

    if (avatarError || !avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar not found' },
        { status: 404 }
      )
    }

    // TODO: Re-enable when packages are properly exported
    // const avatarService = new AvatarService()

    // Delete avatar files from storage
    // const deleteResult = await avatarService.deleteAvatar(avatar_id, session.user.id)

    // if (!deleteResult.success) {
    //   return NextResponse.json(
    //     { success: false, error: deleteResult.error },
    //     { status: 500 }
    //   )
    // }

    // Temporary implementation
    return NextResponse.json(
      { success: false, error: 'Avatar deletion service not available' },
      { status: 503 }
    )
  } catch (error) {
    console.error('Avatar deletion error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          errors: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}