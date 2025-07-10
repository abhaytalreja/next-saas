import { ContextMenu } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import {
  Copy,
  Scissors,
  Clipboard,
  Trash,
  Edit,
  Share,
  Download,
  Star,
  Heart,
  Bookmark,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'

const BasicExample = () => {
  const menuItems = [
    { label: 'Scissors', onClick: () => console.log('Scissors') },
    { label: 'Copy', onClick: () => console.log('Copy') },
    { label: 'Clipboard', onClick: () => console.log('Clipboard') },
    { type: 'separator' as const },
    { label: 'Delete', onClick: () => console.log('Delete') },
  ]

  return (
    <ContextMenu items={menuItems}>
      <div className="p-8 bg-gray-100 rounded-lg text-center cursor-context-menu">
        <p className="text-gray-600">Right-click anywhere in this area</p>
      </div>
    </ContextMenu>
  )
}

const WithIconsExample = () => {
  const menuItems = [
    {
      label: 'Scissors',
      icon: Scissors,
      onClick: () => console.log('Scissors'),
    },
    { label: 'Copy', icon: Copy, onClick: () => console.log('Copy') },
    {
      label: 'Clipboard',
      icon: Clipboard,
      onClick: () => console.log('Clipboard'),
    },
    { type: 'separator' as const },
    { label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
    { label: 'Share', icon: Share, onClick: () => console.log('Share') },
    { type: 'separator' as const },
    {
      label: 'Delete',
      icon: Trash,
      onClick: () => console.log('Delete'),
      destructive: true,
    },
  ]

  return (
    <ContextMenu items={menuItems}>
      <div className="p-8 bg-blue-50 rounded-lg text-center cursor-context-menu">
        <p className="text-blue-700">Right-click for options with icons</p>
      </div>
    </ContextMenu>
  )
}

const FileManagerExample = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [files, setFiles] = useState([
    { id: '1', name: 'document.pdf', type: 'pdf', size: '2.5 MB' },
    { id: '2', name: 'image.jpg', type: 'image', size: '1.2 MB' },
    { id: '3', name: 'video.mp4', type: 'video', size: '15.8 MB' },
    { id: '4', name: 'spreadsheet.xlsx', type: 'excel', size: '3.1 MB' },
  ])

  const handleFileAction = (action: string, fileId: string) => {
    const file = files.find(f => f.id === fileId)
    console.log(`${action}: ${file?.name}`)

    if (action === 'Delete') {
      setFiles(files.filter(f => f.id !== fileId))
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-3 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">File Manager</h4>
      </div>
      <div className="divide-y divide-gray-200">
        {files.map(file => (
          <ContextMenu
            key={file.id}
            items={[
              {
                label: 'Open',
                icon: Eye,
                onClick: () => handleFileAction('Open', file.id),
              },
              {
                label: 'Download',
                icon: Download,
                onClick: () => handleFileAction('Download', file.id),
              },
              { type: 'separator' as const },
              {
                label: 'Copy',
                icon: Copy,
                onClick: () => handleFileAction('Copy', file.id),
              },
              {
                label: 'Share',
                icon: Share,
                onClick: () => handleFileAction('Share', file.id),
              },
              { type: 'separator' as const },
              {
                label: 'Delete',
                icon: Trash,
                onClick: () => handleFileAction('Delete', file.id),
                destructive: true,
              },
            ]}
          >
            <div
              className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedFile === file.id ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedFile(file.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size}</p>
                </div>
                <span className="text-xs text-gray-400 uppercase">
                  {file.type}
                </span>
              </div>
            </div>
          </ContextMenu>
        ))}
      </div>
    </div>
  )
}

const NestedMenuExample = () => {
  const menuItems = [
    { label: 'View', icon: Eye, onClick: () => console.log('View') },
    { label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
    { type: 'separator' as const },
    {
      label: 'Share',
      icon: Share,
      children: [
        { label: 'Email', onClick: () => console.log('Share via Email') },
        { label: 'Link', onClick: () => console.log('Share via Link') },
        {
          label: 'Social Media',
          onClick: () => console.log('Share via Social'),
        },
      ],
    },
    {
      label: 'Export',
      icon: Download,
      children: [
        { label: 'PDF', onClick: () => console.log('Export as PDF') },
        { label: 'PNG', onClick: () => console.log('Export as PNG') },
        { label: 'CSV', onClick: () => console.log('Export as CSV') },
      ],
    },
    { type: 'separator' as const },
    {
      label: 'Delete',
      icon: Trash,
      onClick: () => console.log('Delete'),
      destructive: true,
    },
  ]

  return (
    <ContextMenu items={menuItems}>
      <div className="p-8 bg-purple-50 rounded-lg text-center cursor-context-menu">
        <p className="text-purple-700">Right-click for nested menu options</p>
      </div>
    </ContextMenu>
  )
}

const TextEditorExample = () => {
  const [text, setText] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Select some text and right-click to see context menu options.'
  )
  const [selectedText, setSelectedText] = useState('')

  const handleMouseUp = () => {
    const selection = window.getSelection()
    setSelectedText(selection?.toString() || '')
  }

  const menuItems = [
    {
      label: 'Scissors',
      icon: Scissors,
      onClick: () => console.log('Scissors:', selectedText),
      disabled: !selectedText,
    },
    {
      label: 'Copy',
      icon: Copy,
      onClick: () => console.log('Copy:', selectedText),
      disabled: !selectedText,
    },
    {
      label: 'Clipboard',
      icon: Clipboard,
      onClick: () => console.log('Clipboard'),
    },
    { type: 'separator' as const },
    { label: 'Select All', onClick: () => console.log('Select All') },
    {
      label: 'Find',
      onClick: () => console.log('Find:', selectedText),
      disabled: !selectedText,
    },
  ]

  return (
    <ContextMenu items={menuItems}>
      <div
        className="p-6 bg-white border border-gray-200 rounded-lg"
        onMouseUp={handleMouseUp}
      >
        <p className="text-gray-700 leading-relaxed select-text">{text}</p>
      </div>
    </ContextMenu>
  )
}

const DynamicMenuExample = () => {
  const [favorites, setFavorites] = useState<string[]>([])
  const [hidden, setHidden] = useState<string[]>([])

  const items = [
    { id: 'item1', name: 'Project Alpha', type: 'project' },
    { id: 'item2', name: 'Design System', type: 'folder' },
    { id: 'item3', name: 'API Documentation', type: 'document' },
  ]

  const getMenuItems = (itemId: string) => {
    const isFavorite = favorites.includes(itemId)
    const isHidden = hidden.includes(itemId)

    return [
      { label: 'Open', icon: Eye, onClick: () => console.log('Open:', itemId) },
      { type: 'separator' as const },
      {
        label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
        icon: isFavorite ? Heart : Star,
        onClick: () => {
          setFavorites(prev =>
            isFavorite ? prev.filter(id => id !== itemId) : [...prev, itemId]
          )
        },
      },
      {
        label: isHidden ? 'Show' : 'Hide',
        icon: isHidden ? Eye : EyeOff,
        onClick: () => {
          setHidden(prev =>
            isHidden ? prev.filter(id => id !== itemId) : [...prev, itemId]
          )
        },
      },
      { type: 'separator' as const },
      {
        label: 'Refresh',
        icon: RefreshCw,
        onClick: () => console.log('Refresh:', itemId),
      },
    ]
  }

  return (
    <div className="space-y-2">
      {items.map(item => {
        const isFavorite = favorites.includes(item.id)
        const isHidden = hidden.includes(item.id)

        return (
          <ContextMenu key={item.id} items={getMenuItems(item.id)}>
            <div
              className={`p-4 rounded-lg border ${isHidden ? 'opacity-50' : ''} ${
                isFavorite
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-white'
              } cursor-context-menu`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isFavorite && (
                    <Heart className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {isHidden && <EyeOff className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </div>
          </ContextMenu>
        )
      })}
    </div>
  )
}

const DisabledExample = () => {
  const menuItems = [
    { label: 'Undo', onClick: () => console.log('Undo'), disabled: true },
    { label: 'Redo', onClick: () => console.log('Redo'), disabled: true },
    { type: 'separator' as const },
    {
      label: 'Scissors',
      icon: Scissors,
      onClick: () => console.log('Scissors'),
    },
    { label: 'Copy', icon: Copy, onClick: () => console.log('Copy') },
    {
      label: 'Clipboard',
      icon: Clipboard,
      onClick: () => console.log('Clipboard'),
      disabled: true,
    },
  ]

  return (
    <ContextMenu items={menuItems}>
      <div className="p-8 bg-gray-100 rounded-lg text-center cursor-context-menu">
        <p className="text-gray-600">Right-click to see disabled menu items</p>
      </div>
    </ContextMenu>
  )
}

const examples = [
  {
    title: 'Basic Context Menu',
    code: `const menuItems = [
  { label: 'Scissors', onClick: () => console.log('Scissors') },
  { label: 'Copy', onClick: () => console.log('Copy') },
  { label: 'Clipboard', onClick: () => console.log('Clipboard') },
  { type: 'separator' },
  { label: 'Delete', onClick: () => console.log('Delete') },
]

<ContextMenu items={menuItems}>
  <div className="p-8 bg-gray-100 rounded-lg text-center">
    <p>Right-click anywhere in this area</p>
  </div>
</ContextMenu>`,
    component: <BasicExample />,
  },
  {
    title: 'With Icons',
    code: `const menuItems = [
  { label: 'Scissors', icon: Scissors, onClick: () => console.log('Scissors') },
  { label: 'Copy', icon: Copy, onClick: () => console.log('Copy') },
  { label: 'Clipboard', icon: Clipboard, onClick: () => console.log('Clipboard') },
  { type: 'separator' },
  { label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
  { label: 'Share', icon: Share, onClick: () => console.log('Share') },
  { type: 'separator' },
  { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
]

<ContextMenu items={menuItems}>
  <div className="p-8 bg-blue-50 rounded-lg">
    <p>Right-click for options with icons</p>
  </div>
</ContextMenu>`,
    component: <WithIconsExample />,
  },
  {
    title: 'File Manager Example',
    code: `const files = [
  { id: '1', name: 'document.pdf', type: 'pdf', size: '2.5 MB' },
  { id: '2', name: 'image.jpg', type: 'image', size: '1.2 MB' },
]

{files.map((file) => (
  <ContextMenu
    key={file.id}
    items={[
      { label: 'Open', icon: Eye, onClick: () => handleOpen(file.id) },
      { label: 'Download', icon: Download, onClick: () => handleDownload(file.id) },
      { type: 'separator' },
      { label: 'Copy', icon: Copy, onClick: () => handleCopy(file.id) },
      { label: 'Share', icon: Share, onClick: () => handleShare(file.id) },
      { type: 'separator' },
      { label: 'Delete', icon: Trash, onClick: () => handleDelete(file.id), destructive: true },
    ]}
  >
    <div className="p-4 hover:bg-gray-50">
      <p className="font-medium">{file.name}</p>
      <p className="text-sm text-gray-500">{file.size}</p>
    </div>
  </ContextMenu>
))}`,
    component: <FileManagerExample />,
  },
  {
    title: 'Nested Menus',
    code: `const menuItems = [
  { label: 'View', icon: Eye, onClick: () => console.log('View') },
  { label: 'Edit', icon: Edit, onClick: () => console.log('Edit') },
  { type: 'separator' },
  {
    label: 'Share',
    icon: Share,
    children: [
      { label: 'Email', onClick: () => console.log('Share via Email') },
      { label: 'Link', onClick: () => console.log('Share via Link') },
      { label: 'Social Media', onClick: () => console.log('Share via Social') },
    ]
  },
  {
    label: 'Export',
    icon: Download,
    children: [
      { label: 'PDF', onClick: () => console.log('Export as PDF') },
      { label: 'PNG', onClick: () => console.log('Export as PNG') },
      { label: 'CSV', onClick: () => console.log('Export as CSV') },
    ]
  },
]

<ContextMenu items={menuItems}>
  <div className="p-8 bg-purple-50 rounded-lg">
    <p>Right-click for nested menu options</p>
  </div>
</ContextMenu>`,
    component: <NestedMenuExample />,
  },
  {
    title: 'Text Editor Context Menu',
    code: `const [selectedText, setSelectedText] = useState('')

const handleMouseUp = () => {
  const selection = window.getSelection()
  setSelectedText(selection?.toString() || '')
}

const menuItems = [
  { 
    label: 'Scissors', 
    icon: Scissors, 
    onClick: () => console.log('Scissors:', selectedText),
    disabled: !selectedText
  },
  { 
    label: 'Copy', 
    icon: Copy, 
    onClick: () => console.log('Copy:', selectedText),
    disabled: !selectedText
  },
  { label: 'Clipboard', icon: Clipboard, onClick: () => console.log('Clipboard') },
  { type: 'separator' },
  { label: 'Select All', onClick: () => console.log('Select All') },
]

<ContextMenu items={menuItems}>
  <div onMouseUp={handleMouseUp}>
    <p className="text-gray-700 select-text">
      Lorem ipsum dolor sit amet...
    </p>
  </div>
</ContextMenu>`,
    component: <TextEditorExample />,
  },
  {
    title: 'Dynamic Menu Items',
    code: `const [favorites, setFavorites] = useState([])

const getMenuItems = (itemId) => {
  const isFavorite = favorites.includes(itemId)
  
  return [
    { label: 'Open', icon: Eye, onClick: () => console.log('Open') },
    { type: 'separator' },
    { 
      label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites', 
      icon: isFavorite ? Heart : Star,
      onClick: () => toggleFavorite(itemId)
    },
    { 
      label: 'Hide', 
      icon: EyeOff,
      onClick: () => hideItem(itemId)
    },
  ]
}

{items.map((item) => (
  <ContextMenu key={item.id} items={getMenuItems(item.id)}>
    <div className={\`p-4 border \${favorites.includes(item.id) ? 'border-yellow-300' : 'border-gray-200'}\`}>
      <p>{item.name}</p>
    </div>
  </ContextMenu>
))}`,
    component: <DynamicMenuExample />,
  },
  {
    title: 'Disabled Items',
    code: `const menuItems = [
  { label: 'Undo', onClick: () => console.log('Undo'), disabled: true },
  { label: 'Redo', onClick: () => console.log('Redo'), disabled: true },
  { type: 'separator' },
  { label: 'Scissors', icon: Scissors, onClick: () => console.log('Scissors') },
  { label: 'Copy', icon: Copy, onClick: () => console.log('Copy') },
  { label: 'Clipboard', icon: Clipboard, onClick: () => console.log('Clipboard'), disabled: true },
]

<ContextMenu items={menuItems}>
  <div className="p-8 bg-gray-100 rounded-lg">
    <p>Right-click to see disabled menu items</p>
  </div>
</ContextMenu>`,
    component: <DisabledExample />,
  },
]

export default function ContextMenuPage() {
  return (
    <ComponentLayout
      title="Context Menu"
      description="A right-click menu component that provides contextual actions for specific elements, supporting icons, nested items, and dynamic content."
      examples={examples}
    />
  )
}
