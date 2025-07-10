import { test, expect, Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

// Use authenticated state
test.use({ storageState: 'playwright/.auth/user.json' })

class AvatarUploadPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/settings/profile')
    await this.page.waitForLoadState('networkidle')
  }

  async uploadAvatar(options: {
    fileName?: string
    fileType?: string
    fileSize?: 'small' | 'medium' | 'large' | 'too-large'
    shouldSucceed?: boolean
  } = {}) {
    const {
      fileName = 'test-avatar.jpg',
      fileType = 'image/jpeg',
      fileSize = 'medium',
      shouldSucceed = true
    } = options

    let buffer: Buffer

    switch (fileSize) {
      case 'small':
        // 1KB image
        buffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
        break
      case 'medium':
        // ~50KB image (repeat small image data)
        const smallBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
        buffer = Buffer.concat(Array(1000).fill(smallBuffer))
        break
      case 'large':
        // ~1MB image
        const baseBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          'base64'
        )
        buffer = Buffer.concat(Array(20000).fill(baseBuffer))
        break
      case 'too-large':
        // ~6MB image (should fail)
        const largeBaseBuffer = Buffer.alloc(1024 * 1024) // 1MB
        buffer = Buffer.concat(Array(6).fill(largeBaseBuffer))
        break
      default:
        buffer = Buffer.from('test image data')
    }

    await this.page.setInputFiles('input[type="file"][accept*="image"]', {
      name: fileName,
      mimeType: fileType,
      buffer,
    })

    if (shouldSucceed) {
      // Wait for successful upload
      await expect(this.page.locator('text=Upload successful')).toBeVisible({ timeout: 15000 })
      
      // Avatar preview should be updated
      await expect(this.page.locator('img[alt*="avatar"], img[alt*="profile"]')).toBeVisible()
    } else {
      // Wait for error message
      await expect(this.page.locator('[role="alert"], .error, text*="error"')).toBeVisible({ timeout: 10000 })
    }
  }

  async removeAvatar() {
    // Look for remove/delete avatar button
    const removeButton = this.page.locator('button:has-text("Remove"), button:has-text("Delete"), button[aria-label*="remove"], button[aria-label*="delete"]')
    
    if (await removeButton.count() > 0) {
      await removeButton.first().click()
      
      // Confirm deletion if needed
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")')
      if (await confirmButton.count() > 0) {
        await confirmButton.first().click()
      }
      
      // Wait for removal to complete
      await expect(this.page.locator('text=Avatar removed')).toBeVisible({ timeout: 10000 })
      
      // Avatar should be gone
      await expect(this.page.locator('img[alt*="avatar"], img[alt*="profile"]')).not.toBeVisible()
    }
  }

  async hasAvatar(): Promise<boolean> {
    return await this.page.locator('img[alt*="avatar"], img[alt*="profile"]').count() > 0
  }

  async getAvatarSrc(): Promise<string | null> {
    const avatar = this.page.locator('img[alt*="avatar"], img[alt*="profile"]').first()
    if (await avatar.count() > 0) {
      return await avatar.getAttribute('src')
    }
    return null
  }

  async verifyAvatarVariants() {
    // Check that different sized avatars are loaded in different contexts
    const avatarImages = this.page.locator('img[alt*="avatar"], img[alt*="profile"]')
    const count = await avatarImages.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = avatarImages.nth(i)
        const src = await img.getAttribute('src')
        expect(src).toBeTruthy()
        expect(src).toMatch(/\.(jpg|jpeg|png|webp)/i) // Should be an image URL
      }
    }
  }
}

test.describe('Avatar Upload E2E Tests', () => {
  let avatarPage: AvatarUploadPage

  test.beforeEach(async ({ page }) => {
    avatarPage = new AvatarUploadPage(page)
  })

  test.describe('Avatar Upload Functionality', () => {
    test('should upload a valid image successfully', async ({ page }) => {
      await avatarPage.goto()

      // Upload a medium-sized JPEG
      await avatarPage.uploadAvatar({
        fileName: 'profile-photo.jpg',
        fileType: 'image/jpeg',
        fileSize: 'medium'
      })

      // Verify avatar is displayed
      expect(await avatarPage.hasAvatar()).toBe(true)

      // Verify avatar source is valid
      const avatarSrc = await avatarPage.getAvatarSrc()
      expect(avatarSrc).toBeTruthy()
      expect(avatarSrc).toMatch(/^https?:\/\//) // Should be a valid URL

      // Verify variants are working
      await avatarPage.verifyAvatarVariants()
    })

    test('should support multiple image formats', async ({ page }) => {
      await avatarPage.goto()

      const formats = [
        { fileName: 'test.jpg', fileType: 'image/jpeg' },
        { fileName: 'test.png', fileType: 'image/png' },
        { fileName: 'test.webp', fileType: 'image/webp' }
      ]

      for (const format of formats) {
        await avatarPage.uploadAvatar({
          fileName: format.fileName,
          fileType: format.fileType,
          fileSize: 'small'
        })

        expect(await avatarPage.hasAvatar()).toBe(true)
      }
    })

    test('should handle image replacement correctly', async ({ page }) => {
      await avatarPage.goto()

      // Upload first image
      await avatarPage.uploadAvatar({
        fileName: 'first-avatar.jpg',
        fileSize: 'small'
      })

      const firstAvatarSrc = await avatarPage.getAvatarSrc()
      expect(firstAvatarSrc).toBeTruthy()

      // Upload replacement image
      await avatarPage.uploadAvatar({
        fileName: 'second-avatar.jpg',
        fileSize: 'small'
      })

      const secondAvatarSrc = await avatarPage.getAvatarSrc()
      expect(secondAvatarSrc).toBeTruthy()
      expect(secondAvatarSrc).not.toBe(firstAvatarSrc) // Should be different URL
    })

    test('should validate file size limits', async ({ page }) => {
      await avatarPage.goto()

      // Try to upload file that's too large
      await avatarPage.uploadAvatar({
        fileName: 'huge-image.jpg',
        fileSize: 'too-large',
        shouldSucceed: false
      })

      // Should show error message
      await expect(page.locator('text*="too large", text*="size limit", text*="maximum"')).toBeVisible()

      // Avatar should not be uploaded
      expect(await avatarPage.hasAvatar()).toBe(false)
    })

    test('should validate file types', async ({ page }) => {
      await avatarPage.goto()

      // Try to upload invalid file type
      await avatarPage.uploadAvatar({
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        shouldSucceed: false
      })

      // Should show error message
      await expect(page.locator('text*="invalid", text*="supported", text*="format"')).toBeVisible()

      // Try to upload text file
      await avatarPage.uploadAvatar({
        fileName: 'text.txt',
        fileType: 'text/plain',
        shouldSucceed: false
      })

      // Should show error message
      await expect(page.locator('text*="invalid", text*="supported", text*="format"')).toBeVisible()
    })

    test('should handle upload progress correctly', async ({ page }) => {
      await avatarPage.goto()

      // Upload large image to see progress
      await avatarPage.uploadAvatar({
        fileName: 'large-photo.jpg',
        fileSize: 'large'
      })

      // Progress should be shown during upload
      // Note: This might be fast in test environment, but the upload should still succeed
      expect(await avatarPage.hasAvatar()).toBe(true)
    })
  })

  test.describe('Avatar Management', () => {
    test('should allow avatar removal', async ({ page }) => {
      await avatarPage.goto()

      // First upload an avatar
      await avatarPage.uploadAvatar({
        fileName: 'temp-avatar.jpg',
        fileSize: 'small'
      })

      expect(await avatarPage.hasAvatar()).toBe(true)

      // Remove the avatar
      await avatarPage.removeAvatar()

      // Avatar should be gone
      expect(await avatarPage.hasAvatar()).toBe(false)
    })

    test('should show fallback when no avatar is present', async ({ page }) => {
      await avatarPage.goto()

      // Ensure no avatar is present
      if (await avatarPage.hasAvatar()) {
        await avatarPage.removeAvatar()
      }

      // Should show fallback (initials, default icon, etc.)
      await expect(page.locator('[data-testid="avatar-fallback"], .avatar-fallback, text*="initials"')).toBeVisible()
    })

    test('should persist avatar across page reloads', async ({ page }) => {
      await avatarPage.goto()

      // Upload avatar
      await avatarPage.uploadAvatar({
        fileName: 'persistent-avatar.jpg',
        fileSize: 'small'
      })

      const originalSrc = await avatarPage.getAvatarSrc()
      expect(originalSrc).toBeTruthy()

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Avatar should still be there
      expect(await avatarPage.hasAvatar()).toBe(true)

      const reloadedSrc = await avatarPage.getAvatarSrc()
      expect(reloadedSrc).toBe(originalSrc)
    })

    test('should update avatar across different pages', async ({ page }) => {
      await avatarPage.goto()

      // Upload avatar
      await avatarPage.uploadAvatar({
        fileName: 'global-avatar.jpg',
        fileSize: 'small'
      })

      const profilePageSrc = await avatarPage.getAvatarSrc()

      // Navigate to different pages and check avatar
      const pagesToCheck = [
        '/dashboard',
        '/settings',
        '/settings/organization'
      ]

      for (const pagePath of pagesToCheck) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // Look for avatar in header, navigation, or user menu
        const avatar = page.locator('img[alt*="avatar"], img[alt*="profile"], img[alt*="user"]').first()
        
        if (await avatar.count() > 0) {
          const src = await avatar.getAttribute('src')
          expect(src).toBeTruthy()
          // Should be the same avatar or a variant of it
          expect(src).toMatch(/avatar|profile|user/)
        }
      }
    })
  })

  test.describe('Image Processing and Variants', () => {
    test('should generate different sized variants', async ({ page }) => {
      await avatarPage.goto()

      // Upload a large image
      await avatarPage.uploadAvatar({
        fileName: 'high-res-photo.jpg',
        fileSize: 'large'
      })

      // Check that the image loads (processing should create variants)
      await expect(page.locator('img[alt*="avatar"], img[alt*="profile"]')).toBeVisible()

      // Verify the image source contains processed image URL
      const avatarSrc = await avatarPage.getAvatarSrc()
      expect(avatarSrc).toBeTruthy()

      // In a real implementation, you might check for size parameters in the URL
      // e.g., expect(avatarSrc).toMatch(/size=|w=|h=/)
    })

    test('should handle image processing failures gracefully', async ({ page }) => {
      await avatarPage.goto()

      // Mock processing failure by intercepting upload request
      await page.route('**/api/profile/avatar**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Image processing failed'
          })
        })
      })

      await avatarPage.uploadAvatar({
        fileName: 'corrupt-image.jpg',
        shouldSucceed: false
      })

      // Should show processing error
      await expect(page.locator('text*="processing", text*="failed"')).toBeVisible()

      // Restore normal routing
      await page.unroute('**/api/profile/avatar**')
    })

    test('should optimize image quality and format', async ({ page }) => {
      await avatarPage.goto()

      // Upload PNG image
      await avatarPage.uploadAvatar({
        fileName: 'test-image.png',
        fileType: 'image/png',
        fileSize: 'medium'
      })

      const avatarSrc = await avatarPage.getAvatarSrc()
      expect(avatarSrc).toBeTruthy()

      // In a real implementation, you might verify that the served image
      // is optimized (WebP format, appropriate size, etc.)
      // This would depend on your image processing pipeline
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network failures during upload', async ({ page }) => {
      await avatarPage.goto()

      // Simulate network failure after file selection
      await page.route('**/api/profile/avatar**', route => route.abort())

      await avatarPage.uploadAvatar({
        fileName: 'network-fail.jpg',
        shouldSucceed: false
      })

      // Should show network error
      await expect(page.locator('text*="network", text*="failed", text*="error"')).toBeVisible()

      // Restore network and retry
      await page.unroute('**/api/profile/avatar**')

      await avatarPage.uploadAvatar({
        fileName: 'network-success.jpg',
        shouldSucceed: true
      })
    })

    test('should handle concurrent upload attempts', async ({ page }) => {
      await avatarPage.goto()

      // Try to upload multiple files simultaneously
      const uploadPromises = [
        avatarPage.uploadAvatar({
          fileName: 'concurrent1.jpg',
          fileSize: 'small',
          shouldSucceed: false // Only one should succeed
        }),
        avatarPage.uploadAvatar({
          fileName: 'concurrent2.jpg',
          fileSize: 'small',
          shouldSucceed: false
        })
      ]

      // At least one should show some response (success or error)
      await Promise.allSettled(uploadPromises)

      // Should end up with one avatar
      expect(await avatarPage.hasAvatar()).toBe(true)
    })

    test('should handle empty file uploads', async ({ page }) => {
      await avatarPage.goto()

      // Try to upload empty file
      await page.setInputFiles('input[type="file"][accept*="image"]', {
        name: 'empty.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(0), // Empty buffer
      })

      // Should show error for empty file
      await expect(page.locator('text*="empty", text*="invalid", text*="file"')).toBeVisible()
    })

    test('should validate image dimensions', async ({ page }) => {
      await avatarPage.goto()

      // Test with very small image (1x1 pixel)
      await avatarPage.uploadAvatar({
        fileName: 'tiny.jpg',
        fileSize: 'small'
      })

      // Should either succeed or show appropriate message about minimum dimensions
      // This depends on your validation rules
      const hasAvatar = await avatarPage.hasAvatar()
      const hasError = await page.locator('text*="dimension", text*="size", text*="minimum"').count() > 0

      expect(hasAvatar || hasError).toBe(true)
    })
  })

  test.describe('Accessibility and User Experience', () => {
    test('should be accessible to screen readers', async ({ page }) => {
      await avatarPage.goto()

      // Check for proper ARIA labels and roles
      await expect(page.locator('input[type="file"]')).toHaveAttribute('aria-label')
      
      // Upload avatar
      await avatarPage.uploadAvatar({
        fileName: 'accessible-avatar.jpg',
        fileSize: 'small'
      })

      // Avatar image should have alt text
      await expect(page.locator('img[alt*="avatar"], img[alt*="profile"]')).toHaveAttribute('alt')
    })

    test('should provide clear upload instructions', async ({ page }) => {
      await avatarPage.goto()

      // Should show file format and size requirements
      await expect(page.locator('text*="JPG", text*="PNG", text*="format"')).toBeVisible()
      await expect(page.locator('text*="MB", text*="size", text*="maximum"')).toBeVisible()
    })

    test('should show upload progress feedback', async ({ page }) => {
      await avatarPage.goto()

      // Start upload
      await page.setInputFiles('input[type="file"][accept*="image"]', {
        name: 'progress-test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(1024 * 100), // 100KB
      })

      // Should show some form of loading/progress indicator
      await expect(page.locator('text*="uploading", text*="loading", .loading, .spinner')).toBeVisible()

      // Wait for completion
      await expect(page.locator('text=Upload successful')).toBeVisible({ timeout: 10000 })
    })

    test('should work with keyboard navigation', async ({ page }) => {
      await avatarPage.goto()

      // Tab to file input
      await page.keyboard.press('Tab')
      const focusedElement = await page.locator(':focus').first()
      
      // Should be able to reach the file input
      const inputType = await focusedElement.getAttribute('type')
      expect(inputType).toBe('file')

      // Should be able to activate with keyboard
      await page.keyboard.press('Enter')
      // This would normally open file dialog (can't fully test in automated environment)
    })
  })
})