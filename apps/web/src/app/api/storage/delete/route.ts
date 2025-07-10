import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Initialize Backblaze B2 client (compatible with S3 API)
const s3Client = new S3Client({
  region: 'us-west-000', // Backblaze region
  endpoint: process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Backblaze B2
})

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Verify the user owns this file (path should start with user ID)
    if (!path.startsWith(user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this file' },
        { status: 403 }
      )
    }

    // Delete from Backblaze B2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME!,
      Key: path,
    })

    await s3Client.send(deleteCommand)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}

// Handle CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}