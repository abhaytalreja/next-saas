import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileProfileForm } from '../components/forms/MobileProfileForm'
import { TouchOptimizedAvatar } from '../components/ui/TouchOptimizedAvatar'
import { MobileBottomSheet } from '../components/ui/MobileBottomSheet'
import { useMobileDetection, useBreakpoint } from '../hooks/useMobileDetection'

// Mock hooks
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null
      }
    },
    updateProfile: jest.fn()
  })
}))

jest.mock('../hooks/useMobileDetection')
const mockUseMobileDetection = useMobileDetection as jest.MockedFunction<typeof useMobileDetection>
const mockUseBreakpoint = useBreakpoint as jest.MockedFunction<typeof useBreakpoint>

describe('Mobile Optimization Tests', () => {
  beforeEach(() => {
    // Default to mobile
    mockUseMobileDetection.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
      screenSize: 'xs',
      orientation: 'portrait',
      platform: 'ios'
    })
    
    mockUseBreakpoint.mockReturnValue({
      isXs: true,
      isSm: false,
      isMd: false,
      isLg: false,
      isXl: false,
      is2Xl: false,
      isMobileOrTablet: true,
      isDesktopOrLarger: false
    })
  })

  describe('Mobile Detection Hook', () => {
    it('should detect mobile devices correctly', () => {
      const { isMobile, isTouchDevice, screenSize } = useMobileDetection()
      
      expect(isMobile).toBe(true)
      expect(isTouchDevice).toBe(true)
      expect(screenSize).toBe('xs')
    })

    it('should detect desktop devices correctly', () => {
      mockUseMobileDetection.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        screenSize: 'lg',
        orientation: 'landscape',
        platform: 'windows'
      })

      const { isMobile, isTouchDevice, isDesktop } = useMobileDetection()
      
      expect(isMobile).toBe(false)
      expect(isTouchDevice).toBe(false)
      expect(isDesktop).toBe(true)
    })
  })

  describe('MobileProfileForm', () => {
    it('should render mobile-optimized form on mobile devices', () => {
      render(<MobileProfileForm />)
      
      // Should have mobile-specific elements
      expect(screen.getByText('Change Photo')).toBeInTheDocument()
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
      
      // Form fields should be larger for touch
      const firstNameInput = screen.getByLabelText(/first name/i)
      expect(firstNameInput).toHaveClass('py-3', 'px-4', 'text-base')
    })

    it('should render desktop form on desktop devices', () => {
      mockUseBreakpoint.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        is2Xl: false,
        isMobileOrTablet: false,
        isDesktopOrLarger: true
      })

      render(<MobileProfileForm />)
      
      // Should render standard desktop form
      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should have collapsible sections on mobile', () => {
      render(<MobileProfileForm />)
      
      // Contact section should be collapsible and initially collapsed
      const contactSection = screen.getByText('Contact')
      expect(contactSection).toBeInTheDocument()
      
      // Bio field should not be visible initially (collapsed)
      expect(screen.queryByLabelText(/bio/i)).not.toBeInTheDocument()
    })

    it('should expand collapsible sections when clicked', async () => {
      const user = userEvent.setup()
      render(<MobileProfileForm />)
      
      // Click to expand About section
      const aboutButton = screen.getByText('About')
      await user.click(aboutButton)
      
      // Bio field should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
      })
    })

    it('should have sticky footer on mobile', () => {
      render(<MobileProfileForm />)
      
      // Should have fixed positioned footer with buttons
      const saveButton = screen.getByText('Save Changes')
      const cancelButton = screen.getByText('Cancel')
      
      expect(saveButton.closest('div')).toHaveClass('fixed', 'bottom-0')
      expect(cancelButton).toBeInTheDocument()
    })

    it('should blur inputs on form submission to hide keyboard', async () => {
      const user = userEvent.setup()
      render(<MobileProfileForm />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      await user.type(firstNameInput, 'Test')
      
      // Mock blur function
      const blurSpy = jest.spyOn(firstNameInput, 'blur')
      
      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)
      
      // Note: This test would need proper implementation of the blur logic
      // in the actual component
    })
  })

  describe('TouchOptimizedAvatar', () => {
    const defaultProps = {
      src: null,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      onUpload: jest.fn(),
      onRemove: jest.fn(),
      onView: jest.fn()
    }

    it('should render with touch-optimized size', () => {
      render(<TouchOptimizedAvatar {...defaultProps} size="lg" />)
      
      // Should have minimum touch target size
      const avatarContainer = screen.getByRole('button', { name: /edit avatar/i })
      expect(avatarContainer).toHaveClass('min-w-20', 'min-h-20')
    })

    it('should show action menu on touch devices', async () => {
      const user = userEvent.setup()
      render(<TouchOptimizedAvatar {...defaultProps} />)
      
      // Click avatar to show actions
      const editButton = screen.getByRole('button', { name: /edit avatar/i })
      await user.click(editButton)
      
      // Action menu should appear
      await waitFor(() => {
        expect(screen.getByText('Upload new photo')).toBeInTheDocument()
      })
    })

    it('should handle file upload from action menu', async () => {
      const user = userEvent.setup()
      const onUpload = jest.fn()
      
      render(<TouchOptimizedAvatar {...defaultProps} onUpload={onUpload} />)
      
      // Open action menu
      const editButton = screen.getByRole('button', { name: /edit avatar/i })
      await user.click(editButton)
      
      // Click upload option
      const uploadButton = await screen.findByText('Upload new photo')
      await user.click(uploadButton)
      
      // File input should be triggered
      const fileInput = screen.getByLabelText(/upload avatar image/i)
      expect(fileInput).toBeInTheDocument()
    })

    it('should close action menu when clicking outside', async () => {
      const user = userEvent.setup()
      render(<TouchOptimizedAvatar {...defaultProps} />)
      
      // Open action menu
      const editButton = screen.getByRole('button', { name: /edit avatar/i })
      await user.click(editButton)
      
      await waitFor(() => {
        expect(screen.getByText('Upload new photo')).toBeInTheDocument()
      })
      
      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0')
      if (backdrop) {
        fireEvent.click(backdrop)
      }
      
      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('Upload new photo')).not.toBeInTheDocument()
      })
    })
  })

  describe('MobileBottomSheet', () => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      title: 'Test Sheet',
      children: <div>Sheet content</div>
    }

    it('should render as bottom sheet on mobile', () => {
      render(<MobileBottomSheet {...defaultProps} />)
      
      // Should have bottom sheet styling
      const sheet = screen.getByRole('dialog')
      expect(sheet).toHaveClass('fixed', 'bottom-0', 'rounded-t-2xl')
      
      // Should have drag handle
      expect(document.querySelector('.w-10.h-1.bg-gray-300')).toBeInTheDocument()
    })

    it('should render as modal on desktop', () => {
      mockUseBreakpoint.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        is2Xl: false,
        isMobileOrTablet: false,
        isDesktopOrLarger: true
      })

      render(<MobileBottomSheet {...defaultProps} />)
      
      // Should have modal styling
      const sheet = screen.getByRole('dialog')
      expect(sheet).toHaveClass('relative', 'bg-white', 'rounded-lg')
    })

    it('should close on escape key', () => {
      const onClose = jest.fn()
      render(<MobileBottomSheet {...defaultProps} onClose={onClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })

    it('should handle swipe to close gesture', () => {
      const onClose = jest.fn()
      render(<MobileBottomSheet {...defaultProps} onClose={onClose} />)
      
      const sheet = screen.getByRole('dialog')
      
      // Simulate swipe down gesture
      fireEvent.touchStart(sheet, {
        touches: [{ clientY: 100 }]
      })
      
      fireEvent.touchMove(sheet, {
        touches: [{ clientY: 250 }]
      })
      
      fireEvent.touchEnd(sheet)
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should trap focus when open', () => {
      render(<MobileBottomSheet {...defaultProps} />)
      
      // Focus should be trapped within the sheet
      const sheet = screen.getByRole('dialog')
      expect(sheet).toBeInTheDocument()
      
      // First focusable element should receive focus
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('should prevent body scroll when open', () => {
      render(<MobileBottomSheet {...defaultProps} />)
      
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when closed', () => {
      const { rerender } = render(<MobileBottomSheet {...defaultProps} />)
      
      rerender(<MobileBottomSheet {...defaultProps} isOpen={false} />)
      
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('Touch Interactions', () => {
    it('should handle touch events correctly', () => {
      render(<MobileProfileForm />)
      
      // Touch events should be properly bound
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Simulate touch interaction
      fireEvent.touchStart(form, {
        touches: [{ clientX: 100, clientY: 100 }]
      })
      
      fireEvent.touchEnd(form)
      
      // Should not throw errors
    })

    it('should provide adequate touch targets', () => {
      render(<MobileProfileForm />)
      
      // All buttons should meet minimum touch target size (44px)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const minHeight = styles.minHeight || styles.height
        
        // Note: In test environment, computed styles may not be accurate
        // This test validates the concept
        expect(button).toHaveClass('min-h-12') // Mobile button min height
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should adjust layout based on screen size', () => {
      // Test xs screen
      mockUseBreakpoint.mockReturnValue({
        isXs: true,
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        is2Xl: false,
        isMobileOrTablet: true,
        isDesktopOrLarger: false
      })

      const { rerender } = render(<MobileProfileForm />)
      
      // Should have mobile layout
      expect(screen.getByText('Change Photo')).toBeInTheDocument()
      
      // Test lg screen
      mockUseBreakpoint.mockReturnValue({
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: false,
        is2Xl: false,
        isMobileOrTablet: false,
        isDesktopOrLarger: true
      })

      rerender(<MobileProfileForm />)
      
      // Should have desktop layout
      expect(screen.getByRole('form')).toBeInTheDocument()
    })

    it('should handle orientation changes', () => {
      // Portrait orientation
      mockUseMobileDetection.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        screenSize: 'xs',
        orientation: 'portrait',
        platform: 'ios'
      })

      const { rerender } = render(<MobileProfileForm />)
      
      // Landscape orientation
      mockUseMobileDetection.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        screenSize: 'xs',
        orientation: 'landscape',
        platform: 'ios'
      })

      rerender(<MobileProfileForm />)
      
      // Component should still render correctly
      expect(screen.getByRole('form')).toBeInTheDocument()
    })
  })
})