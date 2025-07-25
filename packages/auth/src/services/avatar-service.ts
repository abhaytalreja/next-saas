'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { UserAvatar, AvatarUploadOptions, AvatarUploadResult } from '../types/user'

interface StorageProvider {
  upload(path: string, file: File): Promise<{ success: boolean; url?: string; error?: string }>
  delete(path: string): Promise<boolean>
  getPublicUrl(path: string): string
}

class BackblazeStorage implements StorageProvider {
  private readonly bucketName: string
  private readonly endpoint: string
  private readonly accessKeyId: string
  private readonly secretAccessKey: string

  constructor() {
    this.bucketName = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME || 'nextsaas-avatars'
    this.endpoint = process.env.NEXT_PUBLIC_BACKBLAZE_ENDPOINT || ''
    this.accessKeyId = process.env.BACKBLAZE_ACCESS_KEY_ID || ''
    this.secretAccessKey = process.env.BACKBLAZE_SECRET_ACCESS_KEY || ''
  }

  async upload(path: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // For client-side uploads to Backblaze, we need to use presigned URLs or direct API calls
      // This is a simplified implementation - in production, you'd want to handle this server-side
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Upload failed' }
      }

      return { success: true, url: result.url }
    } catch (error) {
      console.error('Backblaze upload error:', error)
      return { success: false, error: 'Upload failed' }
    }
  }

  async delete(path: string): Promise<boolean> {
    try {
      const response = await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })

      return response.ok
    } catch (error) {
      console.error('Backblaze delete error:', error)
      return false
    }
  }

  getPublicUrl(path: string): string {
    return `${this.endpoint}/${this.bucketName}/${path}`
  }
}

class SupabaseStorage implements StorageProvider {
  private supabase = createClientComponentClient()
  private readonly bucketName = 'avatars'

  async upload(path: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        return { success: false, error: error.message }
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(path)

      return { success: true, url: urlData.publicUrl }
    } catch (error) {
      return { success: false, error: 'Upload failed' }
    }
  }

  async delete(path: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([path])

      return !error
    } catch (error) {
      return false
    }
  }

  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path)
    return data.publicUrl
  }
}

export class AvatarService {
  private supabase = createClientComponentClient()
  private storage: StorageProvider
  private readonly bucketName = process.env.NEXT_PUBLIC_BACKBLAZE_BUCKET_NAME || 'nextsaas-avatars'
  
  constructor() {
    // Always use Backblaze as per project configuration
    this.storage = new BackblazeStorage()
  }
  
  // Default upload options
  private readonly defaultOptions: AvatarUploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    quality: 0.9,
    outputSize: 256,
  }

  /**
   * Upload and process user avatar
   */
  async uploadAvatar(
    file: File,
    userId: string,
    options: Partial<AvatarUploadOptions> = {}
  ): Promise<AvatarUploadResult> {
    try {
      const opts = { ...this.defaultOptions, ...options }
      
      // Validate file
      const validation = this.validateAvatarFile(file, opts)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Process the image
      const processedFile = await this.processImage(file, opts)
      if (!processedFile) {
        return { success: false, error: 'Failed to process image' }
      }

      // Generate file path
      const timestamp = Date.now()
      const extension = this.getFileExtension(processedFile.type)
      const filePath = `${userId}/avatar-${timestamp}.${extension}`

      // Upload to configured storage provider
      const uploadResult = await this.storage.upload(filePath, processedFile)

      if (!uploadResult.success) {
        console.error('Upload error:', uploadResult.error)
        return { success: false, error: uploadResult.error || 'Failed to upload avatar' }
      }

      // Get public URL
      const publicUrl = uploadResult.url || this.storage.getPublicUrl(filePath)

      // Generate different size variants
      const variants = await this.generateVariants(processedFile, filePath)

      // Calculate file hash for deduplication
      const fileHash = await this.calculateFileHash(processedFile)

      // Save avatar metadata to database
      const avatarData = {
        user_id: userId,
        storage_path: filePath,
        storage_bucket: this.bucketName,
        public_url: publicUrl,
        original_filename: file.name,
        file_size: processedFile.size,
        mime_type: processedFile.type,
        width: opts.outputSize,
        height: opts.outputSize,
        is_processed: true,
        processing_status: 'completed' as const,
        variants: variants,
        file_hash: fileHash,
        uploaded_via: 'web',
        is_active: false, // Will be activated separately
        is_approved: true, // Auto-approve for now
        virus_scan_status: 'clean' as const,
      }

      // Insert avatar record
      const { data: avatar, error: dbError } = await this.supabase
        .from('user_avatars')
        .insert(avatarData)
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        // Clean up uploaded file
        await this.storage.delete(filePath)
        return { success: false, error: 'Failed to save avatar data' }
      }

      return { success: true, avatar: avatar as UserAvatar }
    } catch (error) {
      console.error('Avatar upload error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Activate an avatar (set as current)
   */
  async activateAvatar(avatarId: string, userId: string): Promise<boolean> {
    try {
      // First, deactivate all current avatars
      await this.supabase
        .from('user_avatars')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true)

      // Activate the selected avatar
      const { error } = await this.supabase
        .from('user_avatars')
        .update({ is_active: true })
        .eq('id', avatarId)
        .eq('user_id', userId)

      if (error) {
        console.error('Activation error:', error)
        return false
      }

      // Update user's avatar_url
      const { data: avatar } = await this.supabase
        .from('user_avatars')
        .select('public_url')
        .eq('id', avatarId)
        .single()

      if (avatar) {
        await this.supabase
          .from('profiles')
          .update({ avatar_url: avatar.public_url })
          .eq('id', userId)
      }

      return true
    } catch (error) {
      console.error('Avatar activation error:', error)
      return false
    }
  }

  /**
   * Delete an avatar
   */
  async deleteAvatar(avatarId: string, userId: string): Promise<boolean> {
    try {
      // Get avatar data
      const { data: avatar, error: fetchError } = await this.supabase
        .from('user_avatars')
        .select('storage_path, is_active')
        .eq('id', avatarId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !avatar) {
        return false
      }

      // Delete from storage
      await this.storage.delete(avatar.storage_path)

      // Delete from database
      const { error: deleteError } = await this.supabase
        .from('user_avatars')
        .delete()
        .eq('id', avatarId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return false
      }

      // If this was the active avatar, clear user's avatar_url
      if (avatar.is_active) {
        await this.supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('id', userId)
      }

      return true
    } catch (error) {
      console.error('Avatar deletion error:', error)
      return false
    }
  }

  /**
   * Get user's avatars
   */
  async getUserAvatars(userId: string): Promise<UserAvatar[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch avatars error:', error)
        return []
      }

      return data as UserAvatar[]
    } catch (error) {
      console.error('Get avatars error:', error)
      return []
    }
  }

  /**
   * Get user's current active avatar
   */
  async getCurrentAvatar(userId: string): Promise<UserAvatar | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('is_approved', true)
        .single()

      if (error) {
        return null
      }

      return data as UserAvatar
    } catch (error) {
      return null
    }
  }

  /**
   * Validate avatar file
   */
  private validateAvatarFile(
    file: File,
    options: AvatarUploadOptions
  ): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxSize) {
      const maxSizeMB = Math.round(options.maxSize / (1024 * 1024))
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` }
    }

    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, or WebP' }
    }

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' }
    }

    return { valid: true }
  }

  /**
   * Process and optimize image
   */
  private async processImage(
    file: File,
    options: AvatarUploadOptions
  ): Promise<File | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        try {
          // Calculate dimensions (square crop from center)
          const size = Math.min(img.width, img.height)
          const offsetX = (img.width - size) / 2
          const offsetY = (img.height - size) / 2

          // Set canvas size to output size
          canvas.width = options.outputSize
          canvas.height = options.outputSize

          // Draw and crop image
          ctx.drawImage(
            img,
            offsetX,
            offsetY,
            size,
            size,
            0,
            0,
            options.outputSize,
            options.outputSize
          )

          // Convert to WebP for optimization
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], `avatar.webp`, {
                  type: 'image/webp',
                })
                resolve(processedFile)
              } else {
                resolve(null)
              }
            },
            'image/webp',
            options.quality
          )
        } catch (error) {
          console.error('Image processing error:', error)
          resolve(null)
        }
      }

      img.onerror = () => {
        resolve(null)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Generate different size variants
   */
  private async generateVariants(
    file: File,
    basePath: string
  ): Promise<Record<string, string>> {
    const variants: Record<string, string> = {}
    const sizes = {
      small: 64,
      medium: 128,
      large: 256,
    }

    try {
      for (const [size, pixels] of Object.entries(sizes)) {
        const variantFile = await this.resizeImage(file, pixels)
        if (variantFile) {
          const variantPath = basePath.replace('.webp', `_${size}.webp`)
          
          const uploadResult = await this.storage.upload(variantPath, variantFile)

          if (uploadResult.success) {
            variants[size] = uploadResult.url || this.storage.getPublicUrl(variantPath)
          }
        }
      }
    } catch (error) {
      console.error('Variant generation error:', error)
    }

    return variants
  }

  /**
   * Resize image to specific dimensions
   */
  private async resizeImage(file: File, size: number): Promise<File | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        canvas.width = size
        canvas.height = size

        ctx.drawImage(img, 0, 0, size, size)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], `avatar_${size}.webp`, { type: 'image/webp' }))
            } else {
              resolve(null)
            }
          },
          'image/webp',
          0.9
        )
      }

      img.onerror = () => resolve(null)
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Calculate file hash for deduplication
   */
  private async calculateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.error('Hash calculation error:', error)
      return ''
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    return extensions[mimeType] || 'jpg'
  }

  /**
   * Clean up expired avatar uploads
   */
  async cleanupExpiredAvatars(): Promise<void> {
    try {
      // Get expired avatars
      const { data: expiredAvatars } = await this.supabase
        .from('user_avatars')
        .select('storage_path')
        .lt('expires_at', new Date().toISOString())
        .eq('processing_status', 'pending')

      if (expiredAvatars && expiredAvatars.length > 0) {
        // Delete from storage
        for (const avatar of expiredAvatars) {
          await this.storage.delete(avatar.storage_path)
        }

        // Update database records
        await this.supabase
          .from('user_avatars')
          .update({ 
            processing_status: 'failed',
            processing_error: 'Upload expired'
          })
          .lt('expires_at', new Date().toISOString())
          .eq('processing_status', 'pending')
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }
}

// Export singleton instance
export const avatarService = new AvatarService()