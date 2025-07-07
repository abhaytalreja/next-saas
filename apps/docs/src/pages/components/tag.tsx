import { Tag } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { X, Star, User, Mail } from 'lucide-react'

const BasicExample = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag>React</Tag>
      <Tag>TypeScript</Tag>
      <Tag>Next.js</Tag>
      <Tag>Tailwind CSS</Tag>
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag variant="default">Default</Tag>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="secondary">Secondary</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="error">Error</Tag>
      <Tag variant="outline">Outline</Tag>
    </div>
  )
}

const SizesExample = () => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag size="xs">Extra Small</Tag>
      <Tag size="sm">Small</Tag>
      <Tag size="md">Medium</Tag>
      <Tag size="lg">Large</Tag>
    </div>
  )
}

const DismissibleExample = () => {
  const [tags, setTags] = React.useState([
    { id: 1, label: 'React', variant: 'primary' as const },
    { id: 2, label: 'Vue.js', variant: 'secondary' as const },
    { id: 3, label: 'Angular', variant: 'success' as const },
    { id: 4, label: 'Svelte', variant: 'warning' as const },
  ])

  const removeTag = (id: number) => {
    setTags(tags.filter(tag => tag.id !== id))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          variant={tag.variant}
          onDismiss={() => removeTag(tag.id)}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  )
}

const WithIconsExample = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag icon={Star} variant="warning">
        Starred
      </Tag>
      <Tag icon={User} variant="primary">
        Admin
      </Tag>
      <Tag icon={Mail} variant="secondary">
        Subscribed
      </Tag>
    </div>
  )
}

const InteractiveExample = () => {
  const [selected, setSelected] = React.useState<string[]>(['react'])

  const technologies = [
    { id: 'react', label: 'React' },
    { id: 'vue', label: 'Vue.js' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
    { id: 'solid', label: 'SolidJS' },
  ]

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Select your favorite technologies:</p>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <Tag
            key={tech.id}
            variant={selected.includes(tech.id) ? 'primary' : 'outline'}
            clickable
            onClick={() => toggleSelection(tech.id)}
          >
            {tech.label}
          </Tag>
        ))}
      </div>
    </div>
  )
}

const StatusTagsExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Task Status</h4>
        <div className="flex flex-wrap gap-2">
          <Tag variant="outline">Todo</Tag>
          <Tag variant="warning">In Progress</Tag>
          <Tag variant="success">Completed</Tag>
          <Tag variant="error">Blocked</Tag>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Priority Levels</h4>
        <div className="flex flex-wrap gap-2">
          <Tag variant="error">High</Tag>
          <Tag variant="warning">Medium</Tag>
          <Tag variant="secondary">Low</Tag>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
        <div className="flex flex-wrap gap-2">
          <Tag variant="primary">Frontend</Tag>
          <Tag variant="secondary">Backend</Tag>
          <Tag variant="success">DevOps</Tag>
          <Tag variant="warning">Design</Tag>
        </div>
      </div>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Tags',
    code: `<div className="flex flex-wrap gap-2">
  <Tag>React</Tag>
  <Tag>TypeScript</Tag>
  <Tag>Next.js</Tag>
  <Tag>Tailwind CSS</Tag>
</div>`,
    component: <BasicExample />,
  },
  {
    title: 'Tag Variants',
    code: `<div className="flex flex-wrap gap-2">
  <Tag variant="default">Default</Tag>
  <Tag variant="primary">Primary</Tag>
  <Tag variant="secondary">Secondary</Tag>
  <Tag variant="success">Success</Tag>
  <Tag variant="warning">Warning</Tag>
  <Tag variant="error">Error</Tag>
  <Tag variant="outline">Outline</Tag>
</div>`,
    component: <VariantsExample />,
  },
  {
    title: 'Different Sizes',
    code: `<div className="flex flex-wrap items-center gap-2">
  <Tag size="xs">Extra Small</Tag>
  <Tag size="sm">Small</Tag>
  <Tag size="md">Medium</Tag>
  <Tag size="lg">Large</Tag>
</div>`,
    component: <SizesExample />,
  },
  {
    title: 'Dismissible Tags',
    code: `const [tags, setTags] = useState([
  { id: 1, label: 'React', variant: 'primary' },
  { id: 2, label: 'Vue.js', variant: 'secondary' },
  { id: 3, label: 'Angular', variant: 'success' },
])

const removeTag = (id) => {
  setTags(tags.filter(tag => tag.id !== id))
}

{tags.map((tag) => (
  <Tag
    key={tag.id}
    variant={tag.variant}
    onDismiss={() => removeTag(tag.id)}
  >
    {tag.label}
  </Tag>
))}`,
    component: <DismissibleExample />,
  },
  {
    title: 'Tags with Icons',
    code: `import { Star, User, Mail } from 'lucide-react'

<div className="flex flex-wrap gap-2">
  <Tag icon={Star} variant="warning">
    Starred
  </Tag>
  <Tag icon={User} variant="primary">
    Admin
  </Tag>
  <Tag icon={Mail} variant="secondary">
    Subscribed
  </Tag>
</div>`,
    component: <WithIconsExample />,
  },
  {
    title: 'Interactive Tags',
    code: `const [selected, setSelected] = useState(['react'])

const toggleSelection = (id) => {
  setSelected(prev => 
    prev.includes(id) 
      ? prev.filter(item => item !== id)
      : [...prev, id]
  )
}

{technologies.map((tech) => (
  <Tag
    key={tech.id}
    variant={selected.includes(tech.id) ? 'primary' : 'outline'}
    clickable
    onClick={() => toggleSelection(tech.id)}
  >
    {tech.label}
  </Tag>
))}`,
    component: <InteractiveExample />,
  },
  {
    title: 'Status & Category Tags',
    code: `<div className="space-y-4">
  <div>
    <h4 className="text-sm font-medium text-gray-700 mb-2">Task Status</h4>
    <div className="flex flex-wrap gap-2">
      <Tag variant="outline">Todo</Tag>
      <Tag variant="warning">In Progress</Tag>
      <Tag variant="success">Completed</Tag>
      <Tag variant="error">Blocked</Tag>
    </div>
  </div>
</div>`,
    component: <StatusTagsExample />,
  },
]

export default function TagPage() {
  return (
    <ComponentLayout
      title="Tag"
      description="A small labeling component for categorizing, filtering, and organizing content with support for icons, dismissal, and interactive states."
      examples={examples}
    />
  )
}