import { Breadcrumb } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { Home, ChevronRight, Folder, File } from 'lucide-react'

const BasicExample = () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Laptops', href: '/products/laptops' },
    { label: 'MacBook Pro', href: '/products/laptops/macbook-pro' }
  ]

  return <Breadcrumb items={items} />
}

const WithIconsExample = () => {
  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Documents', href: '/documents', icon: Folder },
    { label: 'Projects', href: '/documents/projects', icon: Folder },
    { label: 'project-readme.md', href: '/documents/projects/readme', icon: File }
  ]

  return <Breadcrumb items={items} />
}

const SeparatorExample = () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Category', href: '/category' },
    { label: 'Subcategory', href: '/category/subcategory' },
    { label: 'Current Page' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Chevron Separator (Default)</h4>
        <Breadcrumb items={items} />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Slash Separator</h4>
        <Breadcrumb items={items} separator="/" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Arrow Separator</h4>
        <Breadcrumb items={items} separator="→" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Icon Separator</h4>
        <Breadcrumb items={items} separator={<ChevronRight className="w-4 h-4 text-gray-400" />} />
      </div>
    </div>
  )
}

const SizesExample = () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Category', href: '/category' },
    { label: 'Current Page' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Small</h4>
        <Breadcrumb items={items} size="sm" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Medium (Default)</h4>
        <Breadcrumb items={items} size="md" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Large</h4>
        <Breadcrumb items={items} size="lg" />
      </div>
    </div>
  )
}

const CollapsedExample = () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Level 1', href: '/level1' },
    { label: 'Level 2', href: '/level1/level2' },
    { label: 'Level 3', href: '/level1/level2/level3' },
    { label: 'Level 4', href: '/level1/level2/level3/level4' },
    { label: 'Level 5', href: '/level1/level2/level3/level4/level5' },
    { label: 'Current Page' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">All Items Visible</h4>
        <Breadcrumb items={items} />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Max 4 Items</h4>
        <Breadcrumb items={items} maxItems={4} />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Max 3 Items</h4>
        <Breadcrumb items={items} maxItems={3} />
      </div>
    </div>
  )
}

const InteractiveExample = () => {
  const [currentPath, setCurrentPath] = React.useState('/products/laptops/macbook-pro')
  
  const allPaths = {
    '/': 'Home',
    '/products': 'Products',
    '/products/laptops': 'Laptops',
    '/products/laptops/macbook-pro': 'MacBook Pro',
    '/products/desktops': 'Desktops',
    '/products/desktops/imac': 'iMac',
  }

  const generateBreadcrumbItems = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    const items = [{ label: 'Home', href: '/' }]
    
    let currentPath = ''
    segments.forEach(segment => {
      currentPath += `/${segment}`
      items.push({
        label: allPaths[currentPath as keyof typeof allPaths] || segment,
        href: currentPath
      })
    })
    
    return items
  }

  const items = generateBreadcrumbItems(currentPath)

  const handleItemClick = (href: string) => {
    setCurrentPath(href)
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Interactive Breadcrumb</h4>
        <Breadcrumb 
          items={items.map(item => ({
            ...item,
            onClick: () => handleItemClick(item.href)
          }))} 
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Navigation</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(allPaths).map(([path, label]) => (
            <button
              key={path}
              onClick={() => setCurrentPath(path)}
              className={`px-3 py-1 rounded text-sm ${
                currentPath === path
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        Current path: <code className="bg-gray-100 px-2 py-1 rounded">{currentPath}</code>
      </div>
    </div>
  )
}

const CustomStyleExample = () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page' }
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Default Style</h4>
        <Breadcrumb items={items} />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Colors</h4>
        <Breadcrumb 
          items={items}
          className="text-purple-600"
          linkClassName="hover:text-purple-800"
          separatorClassName="text-purple-400"
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Background Style</h4>
        <div className="bg-gray-100 p-3 rounded">
          <Breadcrumb 
            items={items}
            className="text-gray-700"
            linkClassName="hover:text-gray-900 hover:underline"
          />
        </div>
      </div>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Breadcrumb',
    code: `const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Laptops', href: '/products/laptops' },
  { label: 'MacBook Pro', href: '/products/laptops/macbook-pro' }
]

<Breadcrumb items={items} />`,
    component: <BasicExample />,
  },
  {
    title: 'With Icons',
    code: `import { Home, Folder, File } from 'lucide-react'

const items = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Documents', href: '/documents', icon: Folder },
  { label: 'Projects', href: '/documents/projects', icon: Folder },
  { label: 'project-readme.md', href: '/documents/projects/readme', icon: File }
]

<Breadcrumb items={items} />`,
    component: <WithIconsExample />,
  },
  {
    title: 'Different Separators',
    code: `const items = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Current Page' }
]

<Breadcrumb items={items} />
<Breadcrumb items={items} separator="/" />
<Breadcrumb items={items} separator="→" />
<Breadcrumb items={items} separator={<ChevronRight className="w-4 h-4" />} />`,
    component: <SeparatorExample />,
  },
  {
    title: 'Different Sizes',
    code: `const items = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Current Page' }
]

<Breadcrumb items={items} size="sm" />
<Breadcrumb items={items} size="md" />
<Breadcrumb items={items} size="lg" />`,
    component: <SizesExample />,
  },
  {
    title: 'Collapsed Long Paths',
    code: `const longItems = [
  { label: 'Home', href: '/' },
  { label: 'Level 1', href: '/level1' },
  { label: 'Level 2', href: '/level1/level2' },
  { label: 'Level 3', href: '/level1/level2/level3' },
  { label: 'Level 4', href: '/level1/level2/level3/level4' },
  { label: 'Level 5', href: '/level1/level2/level3/level4/level5' },
  { label: 'Current Page' }
]

<Breadcrumb items={longItems} />
<Breadcrumb items={longItems} maxItems={4} />
<Breadcrumb items={longItems} maxItems={3} />`,
    component: <CollapsedExample />,
  },
  {
    title: 'Interactive Breadcrumb',
    code: `const [currentPath, setCurrentPath] = useState('/products/laptops/macbook-pro')

const generateBreadcrumbItems = (path) => {
  const segments = path.split('/').filter(Boolean)
  const items = [{ label: 'Home', href: '/' }]
  
  let currentPath = ''
  segments.forEach(segment => {
    currentPath += \`/\${segment}\`
    items.push({
      label: pathLabels[currentPath] || segment,
      href: currentPath
    })
  })
  
  return items
}

const items = generateBreadcrumbItems(currentPath)

<Breadcrumb 
  items={items.map(item => ({
    ...item,
    onClick: () => setCurrentPath(item.href)
  }))} 
/>`,
    component: <InteractiveExample />,
  },
  {
    title: 'Custom Styling',
    code: `const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Current Page' }
]

<Breadcrumb items={items} />

<Breadcrumb 
  items={items}
  className="text-purple-600"
  linkClassName="hover:text-purple-800"
  separatorClassName="text-purple-400"
/>

<div className="bg-gray-100 p-3 rounded">
  <Breadcrumb 
    items={items}
    className="text-gray-700"
    linkClassName="hover:text-gray-900 hover:underline"
  />
</div>`,
    component: <CustomStyleExample />,
  },
]

export default function BreadcrumbPage() {
  return (
    <ComponentLayout
      title="Breadcrumb"
      description="A navigation component that shows the current page's location within a navigational hierarchy, helping users understand and navigate the site structure."
      examples={examples}
    />
  )
}