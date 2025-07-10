import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

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

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string

    if (!file || !path) {
      return NextResponse.json(
        { error: 'File and path are required' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    // Upload to Backblaze B2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME!,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      CacheControl: 'max-age=3600',
      Metadata: {
        'original-name': file.name,
        'user-id': user.id,
        'upload-time': new Date().toISOString(),
      },
    })

    await s3Client.send(uploadCommand)

    // Generate public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT}/${process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME}/${path}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: path,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// Handle CORS for client-side uploads
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}