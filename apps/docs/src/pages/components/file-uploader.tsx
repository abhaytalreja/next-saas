import { FileUploader } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [files, setFiles] = useState([])

  return (
    <FileUploader
      onFileSelect={(newFiles) => {
        console.log('Files selected:', newFiles)
      }}
      accept="image/*"
      multiple
      placeholder={{
        title: 'Upload Images',
        description: 'Drag and drop images here, or click to select files',
      }}
    />
  )
}

const ButtonVariantExample = () => {
  return (
    <FileUploader
      variant="button"
      onFileSelect={(files) => {
        console.log('Files selected:', files)
      }}
      accept=".pdf,.doc,.docx"
      placeholder={{
        title: 'Choose Documents',
      }}
    />
  )
}

const MinimalVariantExample = () => {
  return (
    <FileUploader
      variant="minimal"
      onFileSelect={(files) => {
        console.log('Files selected:', files)
      }}
      placeholder={{
        title: 'Upload file',
        description: 'Maximum file size: 10MB',
      }}
    />
  )
}

const WithUploadExample = () => {
  const [files, setFiles] = useState([])

  const handleUpload = async (file) => {
    // Simulate upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ url: `https://example.com/${file.name}` })
      }, 2000)
    })
  }

  return (
    <FileUploader
      files={files}
      onFileSelect={(newFiles) => {
        const fileItems = newFiles.map(file => ({
          id: Math.random().toString(36),
          file,
          status: 'pending',
        }))
        setFiles(prev => [...prev, ...fileItems])
      }}
      onUpload={handleUpload}
      onFileRemove={(fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId))
      }}
      showPreview
      maxFiles={3}
      maxSize={5 * 1024 * 1024} // 5MB
    />
  )
}

const RestrictedExample = () => {
  return (
    <FileUploader
      onFileSelect={(files) => {
        console.log('Files selected:', files)
      }}
      accept="image/jpeg,image/png"
      maxFiles={1}
      maxSize={2 * 1024 * 1024} // 2MB
      placeholder={{
        title: 'Upload Profile Picture',
        description: 'JPEG or PNG only, max 2MB',
      }}
    />
  )
}

const examples = [
  {
    title: 'Basic File Uploader (Dropzone)',
    code: `<FileUploader
  onFileSelect={(files) => {
    console.log('Files selected:', files)
  }}
  accept="image/*"
  multiple
  placeholder={{
    title: 'Upload Images',
    description: 'Drag and drop images here, or click to select files',
  }}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'Button Variant',
    code: `<FileUploader
  variant="button"
  onFileSelect={(files) => {
    console.log('Files selected:', files)
  }}
  accept=".pdf,.doc,.docx"
  placeholder={{
    title: 'Choose Documents',
  }}
/>`,
    component: <ButtonVariantExample />,
  },
  {
    title: 'Minimal Variant',
    code: `<FileUploader
  variant="minimal"
  onFileSelect={(files) => {
    console.log('Files selected:', files)
  }}
  placeholder={{
    title: 'Upload file',
    description: 'Maximum file size: 10MB',
  }}
/>`,
    component: <MinimalVariantExample />,
  },
  {
    title: 'With Upload Progress',
    code: `const [files, setFiles] = useState([])

const handleUpload = async (file) => {
  // Your upload logic here
  return { url: 'https://example.com/uploaded-file' }
}

<FileUploader
  files={files}
  onFileSelect={(newFiles) => {
    // Add files to state
  }}
  onUpload={handleUpload}
  onFileRemove={(fileId) => {
    // Remove file from state
  }}
  showPreview
  maxFiles={3}
  maxSize={5 * 1024 * 1024} // 5MB
/>`,
    component: <WithUploadExample />,
  },
  {
    title: 'With File Restrictions',
    code: `<FileUploader
  onFileSelect={(files) => {
    console.log('Files selected:', files)
  }}
  accept="image/jpeg,image/png"
  maxFiles={1}
  maxSize={2 * 1024 * 1024} // 2MB
  placeholder={{
    title: 'Upload Profile Picture',
    description: 'JPEG or PNG only, max 2MB',
  }}
/>`,
    component: <RestrictedExample />,
  },
]

export default function FileUploaderPage() {
  return (
    <ComponentLayout
      title="File Uploader"
      description="A comprehensive file upload component with drag-and-drop, progress tracking, file validation, and multiple variants."
      examples={examples}
    />
  )
}