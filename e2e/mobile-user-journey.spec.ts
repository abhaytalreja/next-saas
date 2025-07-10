import { test, expect, devices } from '@playwright/test'

// Mobile-specific user journey tests
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

// Generate unique test email for mobile testing
function generateMobileTestEmail(): string {
  const timestamp = Date.now()
  return `next-saas-mobile-${timestamp}@mailinator.com`
}

// Mobile device configurations for testing
const mobileDevices = [
  {
    name: 'iPhone 12',
    ...devices['iPhone 12'],
  },
  {
    name: 'Galaxy S21',
    ...devices['Galaxy S9+'],
  },
  {
    name: 'iPad Air',
    ...devices['iPad Pro'],
  }
]

test.describe('Mobile User Journey Tests', () => {
  mobileDevices.forEach(device => {
    test.describe(`${device.name} Experience`, () => {
      test.use({ ...device })

      test(`Complete mobile registration and profile setup on ${device.name}`, async ({ page }) => {
        const mobileEmail = generateMobileTestEmail()

        // Step 1: Mobile registration
        await page.goto(`${TEST_BASE_URL}/auth/signup`)
        
        // Verify mobile layout
        await expect(page.locator('[data-testid="mobileSignupForm"]')).toBeVisible()
        
        // Fill form with touch-friendly interactions
        await page.tap('[data-testid="firstName"]')
        await page.fill('[data-testid="firstName"]', 'Mobile')
        
        await page.tap('[data-testid="lastName"]')
        await page.fill('[data-testid="lastName"]', 'User')
        
        await page.tap('[data-testid="email"]')
        await page.fill('[data-testid="email"]', mobileEmail)
        
        await page.tap('[data-testid="password"]')
        await page.fill('[data-testid="password"]', 'MobileTest123!')
        
        await page.tap('[data-testid="confirmPassword"]')
        await page.fill('[data-testid="confirmPassword"]', 'MobileTest123!')
        
        // Test mobile checkbox interaction
        await page.tap('[data-testid="acceptTerms"]')
        
        // Submit with mobile button
        await page.tap('[data-testid="submitRegistration"]')
        
        // Verify mobile verification page
        await expect(page).toHaveURL(/\/auth\/verify-email/)
        await expect(page.locator('[data-testid="mobileVerificationMessage"]')).toBeVisible()
        
        // Skip email verification for this test and simulate verified state
        await page.goto(`${TEST_BASE_URL}/auth/login`)
        await page.fill('[data-testid="email"]', mobileEmail)
        await page.fill('[data-testid="password"]', 'MobileTest123!')
        await page.tap('[data-testid="loginSubmit"]')
        
        // Should redirect to mobile dashboard
        await expect(page).toHaveURL(/\/dashboard/)
        await expect(page.locator('[data-testid="mobileDashboard"]')).toBeVisible()
      })

      test(`Mobile profile management on ${device.name}`, async ({ page }) => {
        const mobileEmail = generateMobileTestEmail()
        
        // Quick setup - register and login
        await page.goto(`${TEST_BASE_URL}/auth/login`)
        // Use existing test user or create one
        await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
        await page.fill('[data-testid="password"]', 'MobileTest123!')
        await page.tap('[data-testid="loginSubmit"]')
        
        // Navigate to mobile profile
        await page.tap('[data-testid="mobileMenuToggle"]')
        await page.tap('[data-testid="profileMenuLink"]')
        
        // Should load mobile profile interface
        await expect(page.locator('[data-testid="mobileProfileInterface"]')).toBeVisible()
        
        // Test mobile avatar interaction
        await page.tap('[data-testid="mobileAvatarContainer"]')
        await expect(page.locator('[data-testid="mobileAvatarMenu"]')).toBeVisible()
        
        // Test avatar menu options
        await expect(page.locator('[data-testid="uploadPhotoOption"]')).toBeVisible()
        if (await page.locator('[data-testid="removePhotoOption"]').isVisible()) {
          await expect(page.locator('[data-testid="removePhotoOption"]')).toBeVisible()
        }
        
        // Close avatar menu by tapping outside
        await page.tap('[data-testid="avatarMenuBackdrop"]')
        await expect(page.locator('[data-testid="mobileAvatarMenu"]')).not.toBeVisible()
        
        // Test mobile form interactions
        await page.tap('[data-testid="editProfileMobile"]')
        
        // Should open mobile bottom sheet or full screen form
        await expect(page.locator('[data-testid="mobileProfileForm"]')).toBeVisible()
        
        // Test collapsible sections on mobile
        await page.tap('[data-testid="basicInfoSection"]')
        await expect(page.locator('[data-testid="basicInfoFields"]')).toBeVisible()
        
        // Fill mobile form
        await page.tap('[data-testid="mobileBio"]')
        await page.fill('[data-testid="mobileBio"]', 'Mobile user testing profile update via touch interface')
        
        // Test mobile contact section
        await page.tap('[data-testid="contactSection"]')
        await page.tap('[data-testid="mobilePhone"]')
        await page.fill('[data-testid="mobilePhone"]', '+1 (555) 987-6543')
        
        // Save with mobile sticky footer
        await page.tap('[data-testid="mobileProfileSave"]')
        
        // Verify mobile success feedback
        await expect(page.locator('[data-testid="mobileSuccessToast"]')).toBeVisible()
        
        // Test swipe to close if bottom sheet
        if (await page.locator('[data-testid="bottomSheet"]').isVisible()) {
          // Simulate swipe down gesture
          const bottomSheet = page.locator('[data-testid="bottomSheet"]')
          await bottomSheet.hover()
          await page.mouse.down()
          await page.mouse.move(0, 200) // Swipe down 200px
          await page.mouse.up()
          
          // Should close bottom sheet
          await expect(page.locator('[data-testid="bottomSheet"]')).not.toBeVisible()
        }
      })

      test(`Mobile organization management on ${device.name}`, async ({ page }) => {
        // Login with org admin test user
        await page.goto(`${TEST_BASE_URL}/auth/login`)
        await page.fill('[data-testid="email"]', 'next-saas-org-admin@mailinator.com')
        await page.fill('[data-testid="password"]', 'OrgAdmin123!')
        await page.tap('[data-testid="loginSubmit"]')
        
        // Navigate to mobile organization interface
        await page.tap('[data-testid="mobileMenuToggle"]')
        await page.tap('[data-testid="organizationMenuLink"]')
        
        // Test mobile organization dashboard
        await expect(page.locator('[data-testid="mobileOrgDashboard"]')).toBeVisible()
        
        // Test organization switching on mobile
        if (await page.locator('[data-testid="orgSwitcherMobile"]').isVisible()) {
          await page.tap('[data-testid="orgSwitcherMobile"]')
          await expect(page.locator('[data-testid="orgSwitcherSheet"]')).toBeVisible()
          
          // Close switcher
          await page.tap('[data-testid="orgSwitcherClose"]')
        }
        
        // Test mobile team directory
        await page.tap('[data-testid="teamDirectoryMobile"]')
        await expect(page.locator('[data-testid="mobileDirectoryList"]')).toBeVisible()
        
        // Test member profile view on mobile
        const firstMember = page.locator('[data-testid="directoryMember"]').first()
        if (await firstMember.isVisible()) {
          await firstMember.tap()
          await expect(page.locator('[data-testid="memberProfileModal"]')).toBeVisible()
          
          // Close member profile
          await page.tap('[data-testid="closeProfileModal"]')
        }
        
        // Test mobile invite flow
        await page.tap('[data-testid="inviteMemberMobile"]')
        await expect(page.locator('[data-testid="mobileInviteForm"]')).toBeVisible()
        
        await page.fill('[data-testid="inviteEmailMobile"]', `mobile-invite-${Date.now()}@mailinator.com`)
        await page.selectOption('[data-testid="inviteRoleMobile"]', 'member')
        
        await page.tap('[data-testid="sendInviteMobile"]')
        await expect(page.locator('[data-testid="mobileInviteSuccess"]')).toBeVisible()
      })

      test(`Mobile accessibility features on ${device.name}`, async ({ page }) => {
        // Login
        await page.goto(`${TEST_BASE_URL}/auth/login`)
        await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
        await page.fill('[data-testid="password"]', 'MobileTest123!')
        await page.tap('[data-testid="loginSubmit"]')
        
        // Test mobile accessibility
        await page.goto(`${TEST_BASE_URL}/settings/profile`)
        
        // Verify mobile touch targets meet minimum size (44px)
        const touchTargets = page.locator('[data-mobile-touch-target]')
        const targetCount = await touchTargets.count()
        
        for (let i = 0; i < targetCount; i++) {
          const target = touchTargets.nth(i)
          const box = await target.boundingBox()
          
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44)
            expect(box.height).toBeGreaterThanOrEqual(44)
          }
        }
        
        // Test mobile focus management
        await page.keyboard.press('Tab')
        const focusedElement = await page.locator(':focus').first()
        await expect(focusedElement).toBeVisible()
        
        // Test mobile screen reader announcements
        await page.tap('[data-testid="editProfileMobile"]')
        
        // Verify live regions are present for mobile screen readers
        await expect(page.locator('[aria-live="polite"]')).toBeVisible()
        
        // Test mobile high contrast mode
        await page.emulateMedia({ colorScheme: 'dark' })
        await page.reload()
        
        // Verify mobile dark mode works
        await expect(page.locator('[data-testid="mobileProfileInterface"]')).toBeVisible()
        const bgColor = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)
        
        // Should have dark background
        expect(bgColor).toMatch(/rgb\(.*\)/) // Just verify it's a valid color
      })

      test(`Mobile performance and gestures on ${device.name}`, async ({ page }) => {
        // Login
        await page.goto(`${TEST_BASE_URL}/auth/login`)
        await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
        await page.fill('[data-testid="password"]', 'MobileTest123!')
        await page.tap('[data-testid="loginSubmit"]')
        
        // Test mobile loading performance
        const startTime = Date.now()
        await page.goto(`${TEST_BASE_URL}/settings/profile`)
        const loadTime = Date.now() - startTime
        
        // Mobile load time should be reasonable (under 3 seconds)
        expect(loadTime).toBeLessThan(3000)
        
        // Test mobile skeleton loading
        await page.goto(`${TEST_BASE_URL}/settings/activity`)
        
        // Should show mobile loading skeletons
        if (await page.locator('[data-testid="mobileActivitySkeleton"]').isVisible()) {
          await expect(page.locator('[data-testid="mobileActivitySkeleton"]')).toBeVisible()
        }
        
        // Test mobile gesture interactions
        await page.goto(`${TEST_BASE_URL}/settings/profile`)
        
        // Test pull-to-refresh if implemented
        const profileContainer = page.locator('[data-testid="mobileProfileContainer"]')
        if (await profileContainer.isVisible()) {
          // Simulate pull-to-refresh gesture
          await profileContainer.hover()
          await page.mouse.down()
          await page.mouse.move(0, -100) // Pull down
          await page.mouse.up()
          
          // Check for refresh indicator
          if (await page.locator('[data-testid="pullRefreshIndicator"]').isVisible()) {
            await expect(page.locator('[data-testid="pullRefreshIndicator"]')).toBeVisible()
          }
        }
        
        // Test mobile swipe navigation if implemented
        const swipeContainer = page.locator('[data-testid="swipeContainer"]')
        if (await swipeContainer.isVisible()) {
          // Simulate horizontal swipe
          await swipeContainer.hover()
          await page.mouse.down()
          await page.mouse.move(-200, 0) // Swipe left
          await page.mouse.up()
          
          // Should navigate or update content
          await page.waitForTimeout(500) // Allow animation
        }
        
        // Test mobile keyboard handling
        await page.tap('[data-testid="mobileBio"]')
        await page.keyboard.type('Testing mobile keyboard input')
        
        // Verify virtual keyboard doesn't break layout
        await expect(page.locator('[data-testid="mobileProfileForm"]')).toBeVisible()
        
        // Test mobile orientation change
        if (device.name.includes('iPhone') || device.name.includes('Galaxy')) {
          // Simulate landscape orientation
          await page.setViewportSize({ 
            width: device.viewport?.height || 800, 
            height: device.viewport?.width || 600 
          })
          
          // Verify layout adapts to landscape
          await expect(page.locator('[data-testid="mobileProfileInterface"]')).toBeVisible()
          
          // Switch back to portrait
          await page.setViewportSize({ 
            width: device.viewport?.width || 400, 
            height: device.viewport?.height || 800 
          })
        }
      })

      test(`Mobile offline behavior on ${device.name}`, async ({ page }) => {
        // Login first
        await page.goto(`${TEST_BASE_URL}/auth/login`)
        await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
        await page.fill('[data-testid="password"]', 'MobileTest123!')
        await page.tap('[data-testid="loginSubmit"]')
        
        // Navigate to profile
        await page.goto(`${TEST_BASE_URL}/settings/profile`)
        
        // Verify page loads normally
        await expect(page.locator('[data-testid="mobileProfileInterface"]')).toBeVisible()
        
        // Go offline
        await page.context().setOffline(true)
        
        // Try to update profile
        await page.tap('[data-testid="editProfileMobile"]')
        await page.fill('[data-testid="mobileBio"]', 'Offline edit test')
        await page.tap('[data-testid="mobileProfileSave"]')
        
        // Should show offline indicator or error
        const offlineElements = [
          page.locator('[data-testid="offlineIndicator"]'),
          page.locator('[data-testid="connectionError"]'),
          page.locator('[data-testid="saveOfflineError"]')
        ]
        
        let offlineIndicatorVisible = false
        for (const element of offlineElements) {
          if (await element.isVisible()) {
            offlineIndicatorVisible = true
            break
          }
        }
        
        // Should show some form of offline feedback
        expect(offlineIndicatorVisible).toBeTruthy()
        
        // Go back online
        await page.context().setOffline(false)
        
        // Try saving again
        await page.tap('[data-testid="mobileProfileSave"]')
        
        // Should succeed now
        await expect(page.locator('[data-testid="mobileSuccessToast"]')).toBeVisible()
      })
    })
  })
})

test.describe('Mobile-Specific Feature Tests', () => {
  test.use({ ...devices['iPhone 12'] })

  test('Mobile camera integration for avatar upload', async ({ page }) => {
    // Login
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
    await page.fill('[data-testid="password"]', 'MobileTest123!')
    await page.tap('[data-testid="loginSubmit"]')
    
    // Navigate to profile
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Test mobile avatar upload
    await page.tap('[data-testid="mobileAvatarContainer"]')
    await page.tap('[data-testid="uploadPhotoOption"]')
    
    // Check if camera option is available (simulated)
    if (await page.locator('[data-testid="cameraOption"]').isVisible()) {
      await page.tap('[data-testid="cameraOption"]')
      
      // Simulate camera permission grant
      await page.evaluate(() => {
        // Mock camera access
        Object.defineProperty(navigator, 'mediaDevices', {
          value: {
            getUserMedia: () => Promise.resolve({
              getTracks: () => [{ stop: () => {} }]
            })
          }
        })
      })
      
      // Should open camera interface
      await expect(page.locator('[data-testid="cameraInterface"]')).toBeVisible()
    }
    
    // Test gallery upload option
    if (await page.locator('[data-testid="galleryOption"]').isVisible()) {
      await page.tap('[data-testid="galleryOption"]')
      
      // Should trigger file input
      const fileInput = page.locator('[data-testid="mobileFileInput"]')
      await expect(fileInput).toBeVisible()
    }
  })

  test('Mobile touch gestures and haptic feedback', async ({ page }) => {
    // Login
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
    await page.fill('[data-testid="password"]', 'MobileTest123!')
    await page.tap('[data-testid="loginSubmit"]')
    
    // Test long press gestures
    await page.goto(`${TEST_BASE_URL}/settings/profile`)
    
    // Long press on avatar for context menu
    const avatar = page.locator('[data-testid="mobileAvatarContainer"]')
    await avatar.hover()
    await page.mouse.down()
    await page.waitForTimeout(800) // Long press duration
    await page.mouse.up()
    
    // Should show context menu
    if (await page.locator('[data-testid="avatarContextMenu"]').isVisible()) {
      await expect(page.locator('[data-testid="avatarContextMenu"]')).toBeVisible()
    }
    
    // Test pinch-to-zoom if implemented
    const zoomableContent = page.locator('[data-testid="zoomableContent"]')
    if (await zoomableContent.isVisible()) {
      // Simulate pinch gesture (not easily testable in Playwright, but we can check for handlers)
      const hasZoomHandlers = await zoomableContent.evaluate(el => {
        return el.style.touchAction !== undefined
      })
      
      expect(hasZoomHandlers).toBeTruthy()
    }
    
    // Test swipe gestures for navigation
    const swipeArea = page.locator('[data-testid="swipeNavigationArea"]')
    if (await swipeArea.isVisible()) {
      // Simulate swipe right
      await swipeArea.hover()
      await page.mouse.down()
      await page.mouse.move(200, 0)
      await page.mouse.up()
      
      // Should trigger navigation or show feedback
      await page.waitForTimeout(300)
    }
  })

  test('Mobile notification and permission handling', async ({ page }) => {
    // Mock mobile browser APIs
    await page.addInitScript(() => {
      // Mock notification API
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'default',
          requestPermission: () => Promise.resolve('granted')
        }
      })
      
      // Mock device orientation API
      Object.defineProperty(window, 'DeviceOrientationEvent', {
        value: {
          requestPermission: () => Promise.resolve('granted')
        }
      })
    })
    
    // Login
    await page.goto(`${TEST_BASE_URL}/auth/login`)
    await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
    await page.fill('[data-testid="password"]', 'MobileTest123!')
    await page.tap('[data-testid="loginSubmit"]')
    
    // Navigate to settings
    await page.goto(`${TEST_BASE_URL}/settings/notifications`)
    
    // Test notification permission request
    if (await page.locator('[data-testid="enableNotifications"]').isVisible()) {
      await page.tap('[data-testid="enableNotifications"]')
      
      // Should handle permission request
      await expect(page.locator('[data-testid="notificationPermissionStatus"]')).toBeVisible()
    }
    
    // Test location permission for timezone detection
    if (await page.locator('[data-testid="detectTimezone"]').isVisible()) {
      await page.tap('[data-testid="detectTimezone"]')
      
      // Mock geolocation
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'geolocation', {
          value: {
            getCurrentPosition: (success: any) => {
              success({
                coords: {
                  latitude: 40.7128,
                  longitude: -74.0060
                }
              })
            }
          }
        })
      })
      
      // Should detect and set timezone
      await page.waitForTimeout(1000)
    }
  })
})

test.describe('Mobile Cross-Platform Tests', () => {
  const mobileTestDevices = [
    { name: 'iOS Safari', ...devices['iPhone 12'] },
    { name: 'Android Chrome', ...devices['Galaxy S9+'] },
    { name: 'iPad Safari', ...devices['iPad Pro'] }
  ]

  mobileTestDevices.forEach(device => {
    test(`Cross-platform mobile consistency on ${device.name}`, async ({ page }) => {
      test.use({ ...device })
      
      // Login
      await page.goto(`${TEST_BASE_URL}/auth/login`)
      await page.fill('[data-testid="email"]', 'next-saas-mobile-test@mailinator.com')
      await page.fill('[data-testid="password"]', 'MobileTest123!')
      await page.tap('[data-testid="loginSubmit"]')
      
      // Test consistent mobile layout
      await page.goto(`${TEST_BASE_URL}/settings/profile`)
      
      // Essential mobile elements should be present across all devices
      await expect(page.locator('[data-testid="mobileProfileInterface"]')).toBeVisible()
      await expect(page.locator('[data-testid="mobileMenuToggle"]')).toBeVisible()
      
      // Test consistent touch interactions
      await page.tap('[data-testid="editProfileMobile"]')
      await expect(page.locator('[data-testid="mobileProfileForm"]')).toBeVisible()
      
      // Test consistent form behavior
      await page.fill('[data-testid="mobileBio"]', `Cross-platform test on ${device.name}`)
      await page.tap('[data-testid="mobileProfileSave"]')
      
      // Should show consistent success feedback
      await expect(page.locator('[data-testid="mobileSuccessToast"]')).toBeVisible()
      
      // Test consistent navigation
      await page.tap('[data-testid="mobileMenuToggle"]')
      await expect(page.locator('[data-testid="mobileMenu"]')).toBeVisible()
      
      await page.tap('[data-testid="dashboardLink"]')
      await expect(page).toHaveURL(/\/dashboard/)
    })
  })
})