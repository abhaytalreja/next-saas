import Link from 'next/link'

const componentCategories = [
  {
    id: 'actions',
    name: 'Actions',
    description: 'Interactive elements',
    components: [
      { name: 'Button', href: '/components/button', status: '✓' },
      { name: 'IconButton', href: '/components/icon-button', status: '✓' },
      { name: 'Link', href: '/components/link', status: '✓' },
    ]
  },
  {
    id: 'forms',
    name: 'Forms',
    description: 'Form input components',
    components: [
      { name: 'Input', href: '/components/input', status: '✓' },
      { name: 'Select', href: '/components/select', status: '✓' },
      { name: 'Checkbox', href: '/components/checkbox', status: '✓' },
      { name: 'Radio', href: '/components/radio', status: '✓' },
      { name: 'Textarea', href: '/components/textarea', status: '✓' },
      { name: 'Switch', href: '/components/switch', status: '✓' },
      { name: 'Form', href: '/components/form', status: '✓' },
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    description: 'Layout and spacing',
    components: [
      { name: 'Container', href: '/components/container', status: '✓' },
      { name: 'Grid', href: '/components/grid', status: '✓' },
      { name: 'Stack', href: '/components/stack', status: '✓' },
      { name: 'Section', href: '/components/section', status: '✓' },
    ]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Navigation components',
    components: [
      { name: 'Tabs', href: '/components/tabs', status: '✓' },
      { name: 'Breadcrumb', href: '/components/breadcrumb', status: '✓' },
      { name: 'Pagination', href: '/components/pagination', status: '✓' },
      { name: 'Navbar', href: '/components/navbar', status: '✓' },
      { name: 'Sidebar', href: '/components/sidebar', status: '✓' },
      { name: 'Menu', href: '/components/menu', status: '✓' },
      { name: 'ContextMenu', href: '/components/context-menu', status: '✓' },
    ]
  },
  {
    id: 'data-display',
    name: 'Data Display',
    description: 'Display data and content',
    components: [
      { name: 'Card', href: '/components/card', status: '✓' },
      { name: 'Table', href: '/components/table', status: '✓' },
      { name: 'List', href: '/components/list', status: '✓' },
      { name: 'Stat', href: '/components/stat', status: '✓' },
      { name: 'Badge', href: '/components/badge', status: '✓' },
      { name: 'Tag', href: '/components/tag', status: '✓' },
      { name: 'Avatar', href: '/components/avatar', status: '✓' },
    ]
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'User feedback and status',
    components: [
      { name: 'Alert', href: '/components/alert', status: '✓' },
      { name: 'Progress', href: '/components/progress', status: '✓' },
      { name: 'Spinner', href: '/components/spinner', status: '✓' },
      { name: 'Tooltip', href: '/components/tooltip', status: '✓' },
      { name: 'Toast', href: '/components/toast', status: '✓' },
      { name: 'Modal', href: '/components/modal', status: '✓' },
      { name: 'Drawer', href: '/components/drawer', status: '✓' },
    ]
  },
  {
    id: 'typography',
    name: 'Typography',
    description: 'Text and typography',
    components: [
      { name: 'Heading', href: '/components/heading', status: '✓' },
      { name: 'Text', href: '/components/text', status: '✓' },
    ]
  }
]

export default function ComponentsOverviewPage() {
  const totalComponents = componentCategories.reduce((acc, cat) => acc + cat.components.length, 0)

  return (
    <div className="prose max-w-none">
      <div className="mb-8">
        <h1>Component Library</h1>
        <p className="text-lg text-gray-600">
          {totalComponents} production-ready React components built with TypeScript and Tailwind CSS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 not-prose">
        {componentCategories.map((category) => (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-base">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <ul className="space-y-2">
              {category.components.map((component) => (
                <li key={component.name}>
                  <Link
                    href={component.href}
                    className="flex items-center justify-between text-sm hover:text-blue-600 transition-colors"
                  >
                    <span>{component.name}</span>
                    <span className="text-green-600 text-xs">{component.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Start</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          <code>{`import { Button, Card, Input } from '@nextsaas/ui'

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button>Submit</Button>
    </Card>
  )
}`}</code>
        </pre>
      </div>
    </div>
  )
}