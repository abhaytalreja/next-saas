import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { FileUploader, FileItem } from './FileUploader'
import { testAccessibility } from '../../test-utils'

// Mock FileReader for testing
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  result: 'data:image/png;base64,test',
  onload: null,
  onerror: null,
})) as any

// Create mock File objects
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('FileUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dropzone variant by default', () => {
      render(<FileUploader />)
      expect(screen.getByText('Upload files')).toBeInTheDocument()
      expect(screen.getByText('Drag and drop files here, or click to select files')).toBeInTheDocument()
    })

    it('renders button variant', () => {
      render(<FileUploader variant="button" />)
      expect(screen.getByRole('button', { name: /choose files/i })).toBeInTheDocument()
    })

    it('renders minimal variant', () => {
      render(<FileUploader variant="minimal" />)
      expect(screen.getByRole('button', { name: /upload files/i })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<FileUploader className="custom-uploader" />)
      const uploader = screen.getByText('Upload files').closest('div')
      expect(uploader).toHaveClass('custom-uploader')
    })

    it('shows custom placeholder text', () => {
      const placeholder = {
        title: 'Custom Title',
        description: 'Custom description',
      }
      render(<FileUploader placeholder={placeholder} />)
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom description')).toBeInTheDocument()
    })
  })

  describe('File Input', () => {
    it('opens file dialog when dropzone is clicked', () => {
      const mockClick = jest.fn()
      const inputElement = { click: mockClick }
      
      jest.spyOn(React, 'useRef').mockReturnValue({ current: inputElement })
      
      render(<FileUploader />)
      fireEvent.click(screen.getByText('Upload files'))
      
      expect(mockClick).toHaveBeenCalled()
    })

    it('handles file selection via input', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader onFileSelect={onFileSelect} />)
      
      const file = createMockFile('test.txt', 1024, 'text/plain')
      const input = document.querySelector('input[type="file"]')
      
      Object.defineProperty(input, 'files', {
        value: [file],
        configurable: true,
      })
      
      fireEvent.change(input!)
      expect(onFileSelect).toHaveBeenCalledWith([file])
    })

    it('supports multiple file selection', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader multiple onFileSelect={onFileSelect} />)
      
      const files = [
        createMockFile('test1.txt', 1024, 'text/plain'),
        createMockFile('test2.txt', 2048, 'text/plain'),
      ]
      
      const input = document.querySelector('input[type="file"]')
      Object.defineProperty(input, 'files', { value: files, configurable: true })
      
      fireEvent.change(input!)
      expect(onFileSelect).toHaveBeenCalledWith(files)
    })

    it('sets correct input attributes', () => {
      render(<FileUploader accept=".jpg,.png" multiple />)
      
      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', '.jpg,.png')
      expect(input).toHaveAttribute('multiple')
    })
  })

  describe('Drag and Drop', () => {
    it('handles drag enter event', () => {
      render(<FileUploader />)
      const dropzone = screen.getByText('Upload files').closest('div')
      
      fireEvent.dragEnter(dropzone!)
      expect(dropzone).toHaveClass('border-primary', 'bg-primary/5')
    })

    it('handles drag leave event', () => {
      render(<FileUploader />)
      const dropzone = screen.getByText('Upload files').closest('div')
      
      fireEvent.dragEnter(dropzone!)
      fireEvent.dragLeave(dropzone!)
      expect(dropzone).not.toHaveClass('border-primary')
    })

    it('handles file drop', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader onFileSelect={onFileSelect} />)
      
      const file = createMockFile('dropped.txt', 1024, 'text/plain')
      const dropzone = screen.getByText('Upload files').closest('div')
      
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
        configurable: true,
      })
      
      fireEvent(dropzone!, dropEvent)
      expect(onFileSelect).toHaveBeenCalledWith([file])
    })

    it('prevents default behavior on drag events', () => {
      render(<FileUploader />)
      const dropzone = screen.getByText('Upload files').closest('div')
      
      const dragEvent = new Event('dragover', { bubbles: true })
      const preventDefault = jest.fn()
      Object.defineProperty(dragEvent, 'preventDefault', { value: preventDefault })
      
      fireEvent(dropzone!, dragEvent)
      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe('File Validation', () => {
    it('validates file size', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader maxSize={1024} onFileSelect={onFileSelect} />)
      
      const largeFile = createMockFile('large.txt', 2048, 'text/plain')
      const input = document.querySelector('input[type="file"]')
      
      Object.defineProperty(input, 'files', { value: [largeFile], configurable: true })
      fireEvent.change(input!)
      
      // Large file should be rejected, so onFileSelect shouldn't be called
      expect(onFileSelect).not.toHaveBeenCalled()
    })

    it('validates file type by extension', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader accept=".pdf" onFileSelect={onFileSelect} />)
      
      const wrongFile = createMockFile('test.txt', 1024, 'text/plain')
      const input = document.querySelector('input[type="file"]')
      
      Object.defineProperty(input, 'files', { value: [wrongFile], configurable: true })
      fireEvent.change(input!)
      
      expect(onFileSelect).not.toHaveBeenCalled()
    })

    it('validates file type by MIME type', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader accept="image/*" onFileSelect={onFileSelect} />)
      
      const imageFile = createMockFile('test.jpg', 1024, 'image/jpeg')
      const textFile = createMockFile('test.txt', 1024, 'text/plain')
      
      const input = document.querySelector('input[type="file"]')
      
      // Test valid image file
      Object.defineProperty(input, 'files', { value: [imageFile], configurable: true })
      fireEvent.change(input!)
      expect(onFileSelect).toHaveBeenCalledWith([imageFile])
      
      // Test invalid text file
      Object.defineProperty(input, 'files', { value: [textFile], configurable: true })
      fireEvent.change(input!)
      expect(onFileSelect).toHaveBeenCalledTimes(1) // Still only called once
    })

    it('respects maxFiles limit', () => {
      const onFileSelect = jest.fn()
      const existingFiles: FileItem[] = [
        {
          id: '1',
          file: createMockFile('existing.txt', 1024, 'text/plain'),
          status: 'success',
        },
      ]
      
      render(<FileUploader maxFiles={2} files={existingFiles} onFileSelect={onFileSelect} />)
      
      const newFiles = [
        createMockFile('new1.txt', 1024, 'text/plain'),
        createMockFile('new2.txt', 1024, 'text/plain'),
      ]
      
      const input = document.querySelector('input[type="file"]')
      Object.defineProperty(input, 'files', { value: newFiles, configurable: true })
      fireEvent.change(input!)
      
      expect(onFileSelect).not.toHaveBeenCalled()
    })
  })

  describe('File Display', () => {
    it('displays uploaded files', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.txt', 1024, 'text/plain'),
          status: 'success',
        },
      ]
      
      render(<FileUploader files={files} />)
      
      expect(screen.getByText('test.txt')).toBeInTheDocument()
      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })

    it('shows upload progress', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.txt', 1024, 'text/plain'),
          status: 'uploading',
          progress: 50,
        },
      ]
      
      render(<FileUploader files={files} />)
      
      const progressBar = document.querySelector('.bg-primary')
      expect(progressBar).toHaveStyle('width: 50%')
    })

    it('shows error state', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.txt', 1024, 'text/plain'),
          status: 'error',
          error: 'Upload failed',
        },
      ]
      
      render(<FileUploader files={files} />)
      
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })

    it('shows success state', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.txt', 1024, 'text/plain'),
          status: 'success',
        },
      ]
      
      render(<FileUploader files={files} />)
      
      // Check for success icon (Check component)
      const successIcon = document.querySelector('.text-green-600')
      expect(successIcon).toBeInTheDocument()
    })
  })

  describe('File Removal', () => {
    it('allows file removal when allowRemove is true', () => {
      const onFileRemove = jest.fn()
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.txt', 1024, 'text/plain'),
          status: 'success',
        },
      ]
      
      render(<FileUploader files={files} allowRemove onFileRemove={onFileRemove} />)
      
      const removeButton = screen.getByRole('button', { name: '' }) // X button has no text
      fireEvent.click(removeButton)
      
      expect(onFileRemove).toHaveBeenCalledWith('1')
    })

    it('hides remove button when allowRemove is false', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.txt', 1024, 'text/plain'),
          status: 'success',
        },
      ]
      
      render(<FileUploader files={files} allowRemove={false} />)
      
      expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument()
    })
  })

  describe('Upload Functionality', () => {
    it('calls onUpload when file is selected', async () => {
      const onUpload = jest.fn().mockResolvedValue({ url: 'http://example.com/file.txt' })
      const onFileSelect = jest.fn()
      
      render(<FileUploader onUpload={onUpload} onFileSelect={onFileSelect} />)
      
      const file = createMockFile('test.txt', 1024, 'text/plain')
      const input = document.querySelector('input[type="file"]')
      
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      fireEvent.change(input!)
      
      await waitFor(() => {
        expect(onUpload).toHaveBeenCalledWith(file)
      })
    })

    it('handles upload errors', async () => {
      const onUpload = jest.fn().mockRejectedValue(new Error('Network error'))
      
      render(<FileUploader onUpload={onUpload} />)
      
      const file = createMockFile('test.txt', 1024, 'text/plain')
      const input = document.querySelector('input[type="file"]')
      
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      fireEvent.change(input!)
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })
  })

  describe('Disabled State', () => {
    it('applies disabled styling', () => {
      render(<FileUploader disabled />)
      
      const dropzone = screen.getByText('Upload files').closest('div')
      expect(dropzone).toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('does not process files when disabled', () => {
      const onFileSelect = jest.fn()
      render(<FileUploader disabled onFileSelect={onFileSelect} />)
      
      const file = createMockFile('test.txt', 1024, 'text/plain')
      const dropzone = screen.getByText('Upload files').closest('div')
      
      const dropEvent = new Event('drop', { bubbles: true })
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
        configurable: true,
      })
      
      fireEvent(dropzone!, dropEvent)
      expect(onFileSelect).not.toHaveBeenCalled()
    })

    it('button variant is disabled', () => {
      render(<FileUploader variant="button" disabled />)
      
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('File Format Display', () => {
    it('shows accepted formats', () => {
      render(<FileUploader accept=".jpg,.png,.pdf" />)
      
      expect(screen.getByText('Accepted formats: .jpg,.png,.pdf')).toBeInTheDocument()
    })

    it('shows maximum file size', () => {
      render(<FileUploader maxSize={5 * 1024 * 1024} />)
      
      expect(screen.getByText('Maximum file size: 5 MB')).toBeInTheDocument()
    })
  })

  describe('File Previews', () => {
    it('shows image previews when showPreview is true', async () => {
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/png;base64,test',
        onload: null,
        onerror: null,
      }
      
      ;(global as any).FileReader = jest.fn(() => mockFileReader)
      
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('test.png', 1024, 'image/png'),
          status: 'success',
          preview: 'data:image/png;base64,test',
        },
      ]
      
      render(<FileUploader files={files} showPreview />)
      
      const preview = screen.getByAltText('test.png')
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveAttribute('src', 'data:image/png;base64,test')
    })

    it('shows file icons for non-image files', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('document.pdf', 1024, 'application/pdf'),
          status: 'success',
        },
      ]
      
      render(<FileUploader files={files} />)
      
      // Should show file icon, not image preview
      expect(screen.queryByAltText('document.pdf')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      await testAccessibility(<FileUploader />)
    })

    it('file input is properly hidden', () => {
      render(<FileUploader />)
      
      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveClass('hidden')
    })

    it('buttons have proper roles and are keyboard accessible', () => {
      render(<FileUploader variant="button" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
      
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Forwarded Ref', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<FileUploader ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('File Size Formatting', () => {
    it('formats file sizes correctly', () => {
      const files: FileItem[] = [
        {
          id: '1',
          file: createMockFile('small.txt', 512, 'text/plain'),
          status: 'success',
        },
        {
          id: '2',
          file: createMockFile('medium.txt', 1536, 'text/plain'),
          status: 'success',
        },
        {
          id: '3',
          file: createMockFile('large.txt', 1024 * 1024, 'text/plain'),
          status: 'success',
        },
      ]
      
      render(<FileUploader files={files} />)
      
      expect(screen.getByText('512 Bytes')).toBeInTheDocument()
      expect(screen.getByText('1.5 KB')).toBeInTheDocument()
      expect(screen.getByText('1 MB')).toBeInTheDocument()
    })
  })
})