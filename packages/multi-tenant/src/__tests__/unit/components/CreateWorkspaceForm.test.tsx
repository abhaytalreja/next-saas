import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateWorkspaceForm } from '../../../components/workspace/CreateWorkspaceForm'

const mockCreateWorkspace = vi.fn()
const mockOnSuccess = vi.fn()
const mockOnCancel = vi.fn()

vi.mock('../../../hooks/useWorkspaceActions', () => ({
  useWorkspaceActions: () => ({
    createWorkspace: mockCreateWorkspace,
    isCreating: false
  })
}))

describe('CreateWorkspaceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateWorkspace.mockResolvedValue({
      id: 'ws-123',
      name: 'Test Workspace',
      slug: 'test-workspace'
    })
  })

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      expect(screen.getByLabelText(/workspace name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByText(/choose icon/i)).toBeInTheDocument()
      expect(screen.getByText(/choose color/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create workspace/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should show required field indicators', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameField = screen.getByLabelText(/workspace name/i)
      expect(nameField).toHaveAttribute('required')
    })

    it('should display character count for name field', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      expect(screen.getByText('0 / 50')).toBeInTheDocument()
    })

    it('should display character count for description field', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      expect(screen.getByText('0 / 200')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate required name field', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/workspace name is required/i)).toBeInTheDocument()
      })
      
      expect(mockCreateWorkspace).not.toHaveBeenCalled()
    })

    it('should validate name length', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      const longName = 'a'.repeat(51)
      
      fireEvent.change(nameInput, { target: { value: longName } })
      fireEvent.blur(nameInput)
      
      await waitFor(() => {
        expect(screen.getByText(/name cannot exceed 50 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate description length', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const descriptionInput = screen.getByLabelText(/description/i)
      const longDescription = 'a'.repeat(201)
      
      fireEvent.change(descriptionInput, { target: { value: longDescription } })
      fireEvent.blur(descriptionInput)
      
      await waitFor(() => {
        expect(screen.getByText(/description cannot exceed 200 characters/i)).toBeInTheDocument()
      })
    })

    it('should validate name format', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: '  ' } }) // Only spaces
      fireEvent.blur(nameInput)
      
      await waitFor(() => {
        expect(screen.getByText(/workspace name is required/i)).toBeInTheDocument()
      })
    })

    it('should trim whitespace from name', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: '  Test Workspace  ' } })
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateWorkspace).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Workspace'
          })
        )
      })
    })
  })

  describe('Icon Selection', () => {
    it('should display icon options', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const iconButton = screen.getByText(/choose icon/i)
      fireEvent.click(iconButton)
      
      expect(screen.getByText('🏢')).toBeInTheDocument()
      expect(screen.getByText('💼')).toBeInTheDocument()
      expect(screen.getByText('🎯')).toBeInTheDocument()
      expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('should select an icon', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const iconButton = screen.getByText(/choose icon/i)
      fireEvent.click(iconButton)
      
      const rocketIcon = screen.getByText('🚀')
      fireEvent.click(rocketIcon)
      
      expect(screen.getByDisplayValue('🚀')).toBeInTheDocument()
    })

    it('should allow custom icon input', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const iconInput = screen.getByDisplayValue('🏢') // Default icon
      fireEvent.change(iconInput, { target: { value: '🎨' } })
      
      expect(screen.getByDisplayValue('🎨')).toBeInTheDocument()
    })

    it('should validate emoji input', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const iconInput = screen.getByDisplayValue('🏢')
      fireEvent.change(iconInput, { target: { value: 'invalid' } })
      fireEvent.blur(iconInput)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid emoji/i)).toBeInTheDocument()
      })
    })
  })

  describe('Color Selection', () => {
    it('should display color options', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const colorButton = screen.getByText(/choose color/i)
      fireEvent.click(colorButton)
      
      const colorOptions = screen.getAllByTestId('color-option')
      expect(colorOptions.length).toBeGreaterThan(5)
    })

    it('should select a color', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const colorButton = screen.getByText(/choose color/i)
      fireEvent.click(colorButton)
      
      const greenColor = screen.getByTestId('color-option-green')
      fireEvent.click(greenColor)
      
      const colorInput = screen.getByDisplayValue('#10B981')
      expect(colorInput).toBeInTheDocument()
    })

    it('should allow custom hex color input', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const colorInput = screen.getByDisplayValue('#3B82F6') // Default color
      fireEvent.change(colorInput, { target: { value: '#FF6B6B' } })
      
      expect(screen.getByDisplayValue('#FF6B6B')).toBeInTheDocument()
    })

    it('should validate hex color format', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const colorInput = screen.getByDisplayValue('#3B82F6')
      fireEvent.change(colorInput, { target: { value: 'invalid-color' } })
      fireEvent.blur(colorInput)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid hex color/i)).toBeInTheDocument()
      })
    })
  })

  describe('Slug Generation', () => {
    it('should generate slug from name automatically', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'Design Team' } })
      
      await waitFor(() => {
        const slugPreview = screen.getByText(/slug: design-team/i)
        expect(slugPreview).toBeInTheDocument()
      })
    })

    it('should handle special characters in slug generation', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'R&D Team #1!' } })
      
      await waitFor(() => {
        const slugPreview = screen.getByText(/slug: r-d-team-1/i)
        expect(slugPreview).toBeInTheDocument()
      })
    })

    it('should show slug conflict warning', async () => {
      mockCreateWorkspace.mockRejectedValue({
        message: 'A workspace with this name already exists'
      })
      
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'Existing Workspace' } })
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/workspace with this name already exists/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      fireEvent.change(nameInput, { target: { value: 'New Workspace' } })
      fireEvent.change(descriptionInput, { target: { value: 'A great workspace' } })
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateWorkspace).toHaveBeenCalledWith({
          name: 'New Workspace',
          description: 'A great workspace',
          icon: '🏢',
          color: '#3B82F6',
          is_default: false,
          settings: {}
        })
      })
    })

    it('should call onSuccess after successful creation', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'New Workspace' } })
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          id: 'ws-123',
          name: 'Test Workspace',
          slug: 'test-workspace'
        })
      })
    })

    it('should handle submission errors', async () => {
      mockCreateWorkspace.mockRejectedValue(new Error('Network error'))
      
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'New Workspace' } })
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to create workspace/i)).toBeInTheDocument()
      })
      
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })

    it('should disable submit button during submission', async () => {
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      mockCreateWorkspace.mockReturnValue(pendingPromise)
      
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'New Workspace' } })
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/creating.../i)).toBeInTheDocument()
      
      resolvePromise!({ id: 'ws-123' })
    })
  })

  describe('Form Reset and Cancel', () => {
    it('should call onCancel when cancel button clicked', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should reset form when reset called', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      const descriptionInput = screen.getByLabelText(/description/i)
      
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
      
      const resetButton = screen.getByRole('button', { name: /reset/i })
      fireEvent.click(resetButton)
      
      expect(nameInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })

    it('should show confirmation dialog for unsaved changes', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      fireEvent.change(nameInput, { target: { value: 'Unsaved Changes' } })
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)
      
      expect(screen.getByText(/unsaved changes will be lost/i)).toBeInTheDocument()
    })
  })

  describe('Default Workspace Option', () => {
    it('should show default workspace checkbox', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      expect(screen.getByLabelText(/set as default workspace/i)).toBeInTheDocument()
    })

    it('should handle default workspace selection', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      const defaultCheckbox = screen.getByLabelText(/set as default workspace/i)
      
      fireEvent.change(nameInput, { target: { value: 'Default Workspace' } })
      fireEvent.click(defaultCheckbox)
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockCreateWorkspace).toHaveBeenCalledWith(
          expect.objectContaining({
            is_default: true
          })
        )
      })
    })

    it('should warn about changing default workspace', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const defaultCheckbox = screen.getByLabelText(/set as default workspace/i)
      fireEvent.click(defaultCheckbox)
      
      expect(screen.getByText(/this will replace the current default workspace/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      expect(screen.getByLabelText(/workspace name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      nameInput.focus()
      
      expect(nameInput).toHaveFocus()
      
      // Tab through form fields
      fireEvent.keyDown(nameInput, { key: 'Tab' })
      // Should move to next field
    })

    it('should announce validation errors to screen readers', async () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const submitButton = screen.getByRole('button', { name: /create workspace/i })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/workspace name is required/i)
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })

    it('should have proper ARIA descriptions for complex fields', () => {
      render(<CreateWorkspaceForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
      
      const nameInput = screen.getByLabelText(/workspace name/i)
      expect(nameInput).toHaveAttribute('aria-describedby')
    })
  })
})