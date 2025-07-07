import { SearchBox } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const SearchExample = () => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = (searchQuery: string) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      console.log('Searching for:', searchQuery)
    }, 1000)
  }

  return (
    <SearchBox
      value={query}
      onChange={setQuery}
      onSearch={handleSearch}
      loading={loading}
      placeholder="Search products..."
    />
  )
}

const SuggestionsExample = () => {
  const [query, setQuery] = useState('')
  const suggestions = [
    'React Components',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'Accessibility',
    'Design System',
  ]

  return (
    <SearchBox
      value={query}
      onChange={setQuery}
      suggestions={suggestions}
      placeholder="Search documentation..."
      onSuggestionSelect={(suggestion) => {
        console.log('Selected:', suggestion)
      }}
    />
  )
}

const examples = [
  {
    title: 'Basic Search Box',
    code: `<SearchBox placeholder="Search..." />`,
    component: <SearchBox placeholder="Search..." />,
  },
  {
    title: 'Search with Loading',
    code: `const [query, setQuery] = useState('')
const [loading, setLoading] = useState(false)

const handleSearch = (searchQuery) => {
  setLoading(true)
  // Simulate API call
  setTimeout(() => {
    setLoading(false)
    console.log('Searching for:', searchQuery)
  }, 1000)
}

<SearchBox
  value={query}
  onChange={setQuery}
  onSearch={handleSearch}
  loading={loading}
  placeholder="Search products..."
/>`,
    component: <SearchExample />,
  },
  {
    title: 'Search Box Sizes',
    code: `<div className="space-y-4">
  <SearchBox size="sm" placeholder="Small search..." />
  <SearchBox size="md" placeholder="Medium search..." />
  <SearchBox size="lg" placeholder="Large search..." />
</div>`,
    component: (
      <div className="space-y-4">
        <SearchBox size="sm" placeholder="Small search..." />
        <SearchBox size="md" placeholder="Medium search..." />
        <SearchBox size="lg" placeholder="Large search..." />
      </div>
    ),
  },
  {
    title: 'Search with Suggestions',
    code: `const [query, setQuery] = useState('')
const suggestions = [
  'React Components',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'Accessibility',
  'Design System',
]

<SearchBox
  value={query}
  onChange={setQuery}
  suggestions={suggestions}
  placeholder="Search documentation..."
  onSuggestionSelect={(suggestion) => {
    console.log('Selected:', suggestion)
  }}
/>`,
    component: <SuggestionsExample />,
  },
  {
    title: 'Non-clearable Search',
    code: `<SearchBox
  placeholder="Search..."
  clearable={false}
/>`,
    component: (
      <SearchBox
        placeholder="Search..."
        clearable={false}
      />
    ),
  },
]

export default function SearchBoxPage() {
  return (
    <ComponentLayout
      title="Search Box"
      description="An enhanced input field for search functionality with suggestions and loading states."
      examples={examples}
    />
  )
}