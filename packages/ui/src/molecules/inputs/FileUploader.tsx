import React, { forwardRef, useState, useRef, useCallback } from 'react'
import { Upload, File, Image, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface FileItem {
  id: string
  file: File
  progress?: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
  preview?: string
}

export interface FileUploaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  disabled?: boolean
  variant?: 'dropzone' | 'button' | 'minimal'
  showPreview?: boolean
  allowRemove?: boolean
  onFileSelect?: (files: File[]) => void
  onFileRemove?: (fileId: string) => void
  onUpload?: (file: File) => Promise<{ url?: string; error?: string }>
  files?: FileItem[]
  placeholder?: {
    title?: string
    description?: string
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return Image
  }
  return File
}

const createFilePreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string || null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    } else {
      resolve(null)
    }
  })
}

export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(
  ({ 
    accept,
    multiple = false,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    disabled = false,
    variant = 'dropzone',
    showPreview = true,
    allowRemove = true,
    onFileSelect,
    onFileRemove,
    onUpload,
    files = [],
    placeholder,
    className,
    ...props 
  }, ref) => {
    const [dragActive, setDragActive] = useState(false)
    const [internalFiles, setInternalFiles] = useState<FileItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const currentFiles = files.length > 0 ? files : internalFiles

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`
      }
      
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim())
        const fileType = file.type
        const fileName = file.name.toLowerCase()
        
        const isAccepted = acceptedTypes.some(acceptedType => {
          if (acceptedType.startsWith('.')) {
            return fileName.endsWith(acceptedType.toLowerCase())
          }
          if (acceptedType.includes('*')) {
            const [mainType] = acceptedType.split('/')
            return fileType.startsWith(mainType)
          }
          return fileType === acceptedType
        })
        
        if (!isAccepted) {
          return `File type not accepted. Allowed types: ${accept}`
        }
      }
      
      return null
    }

    const processFiles = useCallback(async (newFiles: File[]) => {
      if (disabled) return

      const validFiles: File[] = []
      const errors: string[] = []

      // Validate each file
      for (const file of newFiles) {
        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      // Check max files limit
      if (maxFiles && currentFiles.length + validFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`)
        return
      }

      if (validFiles.length === 0) return

      // Create file items with previews
      const fileItems: FileItem[] = await Promise.all(
        validFiles.map(async (file) => {
          const preview = showPreview ? await createFilePreview(file) : null
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            status: 'pending' as const,
            preview: preview || undefined,
          }
        })
      )

      // Update files
      if (files.length === 0) {
        setInternalFiles(prev => [...prev, ...fileItems])
      }

      // Call external handler
      onFileSelect?.(validFiles)

      // Auto-upload if handler provided
      if (onUpload) {
        fileItems.forEach(fileItem => uploadFile(fileItem))
      }
    }, [disabled, maxFiles, maxSize, accept, currentFiles.length, files.length, onFileSelect, onUpload, showPreview])

    const uploadFile = async (fileItem: FileItem) => {
      if (!onUpload) return

      const updateFileStatus = (updates: Partial<FileItem>) => {
        if (files.length === 0) {
          setInternalFiles(prev =>
            prev.map(f => f.id === fileItem.id ? { ...f, ...updates } : f)
          )
        }
      }

      updateFileStatus({ status: 'uploading', progress: 0 })

      try {
        const result = await onUpload(fileItem.file)
        
        if (result.error) {
          updateFileStatus({ status: 'error', error: result.error })
        } else {
          updateFileStatus({ 
            status: 'success', 
            progress: 100,
            url: result.url 
          })
        }
      } catch (error) {
        updateFileStatus({ 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        })
      }
    }

    const removeFile = (fileId: string) => {
      if (!allowRemove) return

      if (files.length === 0) {
        setInternalFiles(prev => prev.filter(f => f.id !== fileId))
      }
      onFileRemove?.(fileId)
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    }, [disabled, processFiles])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      if (selectedFiles.length > 0) {
        processFiles(selectedFiles)
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ''
    }

    const openFileDialog = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    const renderDropzone = () => (
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-border',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5',
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {placeholder?.title || 'Upload files'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {placeholder?.description || 'Drag and drop files here, or click to select files'}
        </p>
        {accept && (
          <p className="text-xs text-muted-foreground">
            Accepted formats: {accept}
          </p>
        )}
        {maxSize && (
          <p className="text-xs text-muted-foreground">
            Maximum file size: {formatFileSize(maxSize)}
          </p>
        )}
      </div>
    )

    const renderButton = () => (
      <button
        type="button"
        onClick={openFileDialog}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          className
        )}
      >
        <Upload className="h-4 w-4" />
        {placeholder?.title || 'Choose files'}
      </button>
    )

    const renderMinimal = () => (
      <div className={cn('space-y-2', className)}>
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled}
          className="text-sm text-primary hover:text-primary/80 underline disabled:opacity-50"
        >
          {placeholder?.title || 'Upload files'}
        </button>
        {placeholder?.description && (
          <p className="text-xs text-muted-foreground">
            {placeholder.description}
          </p>
        )}
      </div>
    )

    const renderFileList = () => (
      <div className="space-y-2">
        {currentFiles.map((fileItem) => {
          const FileIcon = getFileIcon(fileItem.file)
          
          return (
            <div
              key={fileItem.id}
              className="flex items-center gap-3 p-3 border border-border rounded-lg"
            >
              {fileItem.preview ? (
                <img
                  src={fileItem.preview}
                  alt={fileItem.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <FileIcon className="h-10 w-10 text-muted-foreground" />
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileItem.file.size)}
                </p>
                
                {fileItem.status === 'uploading' && fileItem.progress !== undefined && (
                  <div className="mt-1 w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                )}
                
                {fileItem.error && (
                  <p className="text-xs text-destructive mt-1">
                    {fileItem.error}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {fileItem.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {fileItem.status === 'success' && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                {fileItem.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                
                {allowRemove && (
                  <button
                    type="button"
                    onClick={() => removeFile(fileItem.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )

    return (
      <div ref={ref} {...props}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {variant === 'dropzone' && renderDropzone()}
        {variant === 'button' && renderButton()}
        {variant === 'minimal' && renderMinimal()}
        
        {currentFiles.length > 0 && (
          <div className="mt-4">
            {renderFileList()}
          </div>
        )}
      </div>
    )
  }
)

FileUploader.displayName = 'FileUploader'