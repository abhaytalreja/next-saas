import { test, expect, takeComponentScreenshot, testColorModes, testResponsive, testInteractionStates } from '../../test-utils/visual-test-utils'

test.describe('FileUploader Component Visual Tests', () => {
  const baseUrl = 'http://localhost:6006/iframe.html?id=molecules-inputs-fileuploader'

  test.describe('States', () => {
    test('renders all states', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'all-states')
    })

    test('renders default state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'state-default')
    })

    test('renders hover state', async ({ page }) => {
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      
      const dropzone = page.locator('.file-uploader-dropzone').first()
      await dropzone.hover()
      await takeComponentScreenshot(page, 'fileuploader', 'state-hover')
    })

    test('renders dragging state', async ({ page }) => {
      await page.goto(`${baseUrl}--dragging`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'state-dragging')
    })

    test('renders disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'state-disabled')
    })

    test('renders error state', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'state-error')
    })

    test('renders uploading state', async ({ page }) => {
      await page.goto(`${baseUrl}--uploading`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'state-uploading')
    })

    test('renders success state', async ({ page }) => {
      await page.goto(`${baseUrl}--success`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'state-success')
    })
  })

  test.describe('Upload Types', () => {
    test('renders single file upload', async ({ page }) => {
      await page.goto(`${baseUrl}--single-file`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'single-file')
    })

    test('renders multiple file upload', async ({ page }) => {
      await page.goto(`${baseUrl}--multiple-files`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'multiple-files')
    })

    test('renders with file restrictions', async ({ page }) => {
      await page.goto(`${baseUrl}--file-restrictions`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-restrictions')
    })

    test('renders image only upload', async ({ page }) => {
      await page.goto(`${baseUrl}--image-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'image-only')
    })

    test('renders document only upload', async ({ page }) => {
      await page.goto(`${baseUrl}--document-only`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'document-only')
    })

    test('renders with max file size', async ({ page }) => {
      await page.goto(`${baseUrl}--max-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'max-size')
    })
  })

  test.describe('File List', () => {
    test('renders uploaded files list', async ({ page }) => {
      await page.goto(`${baseUrl}--with-files`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-list')
    })

    test('renders file with progress', async ({ page }) => {
      await page.goto(`${baseUrl}--file-progress`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-progress')
    })

    test('renders file with error', async ({ page }) => {
      await page.goto(`${baseUrl}--file-error`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-error')
    })

    test('renders file thumbnails', async ({ page }) => {
      await page.goto(`${baseUrl}--with-thumbnails`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-thumbnails')
    })

    test('renders file actions', async ({ page }) => {
      await page.goto(`${baseUrl}--file-actions`)
      await page.waitForLoadState('networkidle')
      
      // Hover to show actions
      const fileItem = page.locator('.file-item').first()
      await fileItem.hover()
      await takeComponentScreenshot(page, 'fileuploader', 'file-actions-visible')
    })

    test('renders file details', async ({ page }) => {
      await page.goto(`${baseUrl}--file-details`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-details')
    })
  })

  test.describe('Variants', () => {
    test('renders all variants', async ({ page }) => {
      await page.goto(`${baseUrl}--all-variants`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'all-variants')
    })

    test('renders dropzone variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-dropzone`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'variant-dropzone')
    })

    test('renders button variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-button`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'variant-button')
    })

    test('renders compact variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-compact`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'variant-compact')
    })

    test('renders inline variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-inline`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'variant-inline')
    })

    test('renders card variant', async ({ page }) => {
      await page.goto(`${baseUrl}--variant-card`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'variant-card')
    })
  })

  test.describe('Sizes', () => {
    test('renders all sizes', async ({ page }) => {
      await page.goto(`${baseUrl}--all-sizes`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'all-sizes')
    })

    test('renders small size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-small`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'size-small')
    })

    test('renders medium size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-medium`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'size-medium')
    })

    test('renders large size', async ({ page }) => {
      await page.goto(`${baseUrl}--size-large`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'size-large')
    })
  })

  test.describe('Image Preview', () => {
    test('renders image preview grid', async ({ page }) => {
      await page.goto(`${baseUrl}--image-preview-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'image-preview-grid')
    })

    test('renders image preview carousel', async ({ page }) => {
      await page.goto(`${baseUrl}--image-preview-carousel`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'image-preview-carousel')
    })

    test('shows image preview modal', async ({ page }) => {
      await page.goto(`${baseUrl}--image-preview-modal`)
      await page.waitForLoadState('networkidle')
      
      // Click on image to open modal
      await page.click('.preview-image')
      await page.waitForSelector('.preview-modal', { state: 'visible' })
      await takeComponentScreenshot(page, 'fileuploader', 'image-preview-modal')
    })

    test('shows image editing options', async ({ page }) => {
      await page.goto(`${baseUrl}--image-editing`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'image-editing')
    })
  })

  test.describe('Progress Indicators', () => {
    test('renders different progress styles', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-styles`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'progress-styles')
    })

    test('renders linear progress', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-linear`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'progress-linear')
    })

    test('renders circular progress', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-circular`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'progress-circular')
    })

    test('renders progress with percentage', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-percentage`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'progress-percentage')
    })

    test('renders progress with speed', async ({ page }) => {
      await page.goto(`${baseUrl}--progress-speed`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'progress-speed')
    })
  })

  test.describe('Interaction States', () => {
    test('shows drag enter visual feedback', async ({ page }) => {
      await page.goto(`${baseUrl}--drag-feedback`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'interaction-drag-enter')
    })

    test('shows invalid file feedback', async ({ page }) => {
      await page.goto(`${baseUrl}--invalid-file`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'interaction-invalid-file')
    })

    test('shows file hover actions', async ({ page }) => {
      await page.goto(`${baseUrl}--with-files`)
      await page.waitForLoadState('networkidle')
      
      const fileItem = page.locator('.file-item').first()
      await fileItem.hover()
      await takeComponentScreenshot(page, 'fileuploader', 'interaction-file-hover')
    })

    test('shows remove confirmation', async ({ page }) => {
      await page.goto(`${baseUrl}--remove-confirmation`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'interaction-remove-confirm')
    })
  })

  test.describe('Special Cases', () => {
    test('renders with custom icons', async ({ page }) => {
      await page.goto(`${baseUrl}--custom-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'custom-icons')
    })

    test('renders in form context', async ({ page }) => {
      await page.goto(`${baseUrl}--in-form`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'in-form')
    })

    test('renders with validation messages', async ({ page }) => {
      await page.goto(`${baseUrl}--validation-messages`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'validation-messages')
    })

    test('renders with helper text', async ({ page }) => {
      await page.goto(`${baseUrl}--with-helper`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'with-helper')
    })

    test('renders paste to upload', async ({ page }) => {
      await page.goto(`${baseUrl}--paste-upload`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'paste-upload')
    })

    test('renders URL upload', async ({ page }) => {
      await page.goto(`${baseUrl}--url-upload`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'url-upload')
    })

    test('renders cloud storage integration', async ({ page }) => {
      await page.goto(`${baseUrl}--cloud-storage`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'cloud-storage')
    })
  })

  test.describe('File Type Icons', () => {
    test('renders all file type icons', async ({ page }) => {
      await page.goto(`${baseUrl}--file-type-icons`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-type-icons')
    })

    test('renders PDF icon', async ({ page }) => {
      await page.goto(`${baseUrl}--file-pdf`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-type-pdf')
    })

    test('renders Excel icon', async ({ page }) => {
      await page.goto(`${baseUrl}--file-excel`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-type-excel')
    })

    test('renders video icon', async ({ page }) => {
      await page.goto(`${baseUrl}--file-video`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'file-type-video')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('renders correctly on different screen sizes', async ({ page }) => {
      await testResponsive(page, `${baseUrl}--default`, 'fileuploader-responsive')
    })

    test('shows mobile-friendly dropzone', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--default`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'mobile-dropzone')
    })

    test('shows stacked file list on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--with-files`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'mobile-file-list')
    })

    test('shows mobile image grid', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--image-preview-grid`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'mobile-image-grid')
    })

    test('shows fullscreen preview on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(`${baseUrl}--image-preview-modal`)
      await page.waitForLoadState('networkidle')
      
      await page.tap('.preview-image')
      await page.waitForSelector('.preview-modal', { state: 'visible' })
      await takeComponentScreenshot(page, 'fileuploader', 'mobile-fullscreen-preview')
    })
  })

  test.describe('Color Modes', () => {
    test('renders correctly in light and dark modes', async ({ page }) => {
      await testColorModes(page, `${baseUrl}--default`, 'fileuploader-color-modes')
    })

    test('shows all states in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--all-states`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'dark-mode-states')
    })

    test('shows file list in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--with-files`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'dark-mode-file-list')
    })

    test('maintains contrast in dark mode', async ({ page }) => {
      await page.goto(`${baseUrl}--error`)
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'dark-mode-contrast')
    })
  })

  test.describe('Accessibility', () => {
    test('shows focus indicators', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-focus`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'fileuploader', 'accessibility-focus')
    })

    test('maintains contrast for disabled state', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-disabled`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'accessibility-disabled')
    })

    test('shows keyboard navigation for files', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-keyboard`)
      await page.waitForLoadState('networkidle')
      
      // Tab through file items
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await takeComponentScreenshot(page, 'fileuploader', 'accessibility-keyboard-nav')
    })

    test('provides screen reader feedback', async ({ page }) => {
      await page.goto(`${baseUrl}--screen-reader`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'accessibility-screen-reader')
    })

    test('shows drop zone activation', async ({ page }) => {
      await page.goto(`${baseUrl}--accessibility-dropzone`)
      await page.waitForLoadState('networkidle')
      
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await takeComponentScreenshot(page, 'fileuploader', 'accessibility-dropzone-active')
    })
  })

  test.describe('Error Handling', () => {
    test('shows file size error', async ({ page }) => {
      await page.goto(`${baseUrl}--error-size`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'error-file-size')
    })

    test('shows file type error', async ({ page }) => {
      await page.goto(`${baseUrl}--error-type`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'error-file-type')
    })

    test('shows upload failed error', async ({ page }) => {
      await page.goto(`${baseUrl}--error-upload`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'error-upload-failed')
    })

    test('shows retry options', async ({ page }) => {
      await page.goto(`${baseUrl}--error-retry`)
      await page.waitForLoadState('networkidle')
      await takeComponentScreenshot(page, 'fileuploader', 'error-retry-options')
    })
  })
})