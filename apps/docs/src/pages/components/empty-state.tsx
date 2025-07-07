import { 
  EmptyState, 
  SearchEmptyState, 
  CreateEmptyState, 
  ErrorEmptyState, 
  OfflineEmptyState,
  LoadingEmptyState,
  NoDataEmptyState,
  NoUsersEmptyState,
  NoFilesEmptyState 
} from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { Search, Plus, Users, FileText, Database } from 'lucide-react'

const BasicExample = () => {
  return (
    <EmptyState
      title="No Projects Found"
      description="You haven't created any projects yet. Start by creating your first project."
      actions={[
        {
          label: 'Create Project',
          variant: 'primary',
          onClick: () => console.log('Create project clicked'),
          icon: Plus,
        },
        {
          label: 'Learn More',
          variant: 'outline',
          onClick: () => console.log('Learn more clicked'),
        },
      ]}
    />
  )
}

const SizesExample = () => {
  return (
    <div className="space-y-8">
      <EmptyState
        title="Small Empty State"
        description="This is a small empty state"
        size="sm"
        actions={[
          {
            label: 'Action',
            variant: 'primary',
            onClick: () => console.log('Action clicked'),
          },
        ]}
      />
      
      <EmptyState
        title="Medium Empty State"
        description="This is a medium empty state"
        size="md"
        actions={[
          {
            label: 'Action',
            variant: 'primary',
            onClick: () => console.log('Action clicked'),
          },
        ]}
      />
      
      <EmptyState
        title="Large Empty State"
        description="This is a large empty state with more prominent styling"
        size="lg"
        actions={[
          {
            label: 'Primary Action',
            variant: 'primary',
            onClick: () => console.log('Primary action clicked'),
          },
        ]}
      />
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SearchEmptyState />
      
      <CreateEmptyState
        title="No Content Created"
        description="Start building by creating your first piece of content."
        actions={[
          {
            label: 'Create Content',
            variant: 'primary',
            onClick: () => console.log('Create content'),
            icon: Plus,
          },
        ]}
      />
      
      <ErrorEmptyState
        actions={[
          {
            label: 'Try Again',
            variant: 'primary',
            onClick: () => console.log('Retry'),
          },
        ]}
      />
      
      <OfflineEmptyState
        actions={[
          {
            label: 'Retry',
            variant: 'primary',
            onClick: () => console.log('Retry connection'),
          },
        ]}
      />
    </div>
  )
}

const PreBuiltExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NoDataEmptyState
        actions={[
          {
            label: 'Import Data',
            variant: 'primary',
            onClick: () => console.log('Import data'),
          },
        ]}
      />
      
      <NoUsersEmptyState
        actions={[
          {
            label: 'Invite Users',
            variant: 'primary',
            onClick: () => console.log('Invite users'),
            icon: Users,
          },
        ]}
      />
      
      <NoFilesEmptyState
        actions={[
          {
            label: 'Upload Files',
            variant: 'primary',
            onClick: () => console.log('Upload files'),
            icon: FileText,
          },
        ]}
      />
    </div>
  )
}

const CustomExample = () => {
  return (
    <EmptyState
      icon={Database}
      title="Custom Empty State"
      description="This empty state uses a custom icon and styling."
      image="https://illustrations.popsy.co/gray/work-from-home.svg"
      size="lg"
      actions={[
        {
          label: 'Get Started',
          variant: 'primary',
          onClick: () => console.log('Get started'),
        },
        {
          label: 'Documentation',
          variant: 'outline',
          onClick: () => console.log('View docs'),
        },
      ]}
    />
  )
}

const CompactExample = () => {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Compact Default"
        description="This is a compact empty state"
        compact
        actions={[
          {
            label: 'Action',
            variant: 'primary',
            onClick: () => console.log('Action'),
          },
        ]}
      />
      
      <EmptyState
        title="Compact with Custom Content"
        compact
        size="sm"
      >
        <div className="mt-2 p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Custom content can be added between the description and actions.
          </p>
        </div>
      </EmptyState>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Empty State',
    code: `<EmptyState
  title="No Projects Found"
  description="You haven't created any projects yet. Start by creating your first project."
  actions={[
    {
      label: 'Create Project',
      variant: 'primary',
      onClick: () => console.log('Create project clicked'),
      icon: Plus,
    },
    {
      label: 'Learn More',
      variant: 'outline',
      onClick: () => console.log('Learn more clicked'),
    },
  ]}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'Different Sizes',
    code: `<EmptyState
  title="Small Empty State"
  description="This is a small empty state"
  size="sm"
/>

<EmptyState
  title="Medium Empty State"
  description="This is a medium empty state"
  size="md"
/>

<EmptyState
  title="Large Empty State"
  description="This is a large empty state"
  size="lg"
/>`,
    component: <SizesExample />,
  },
  {
    title: 'Pre-built Variants',
    code: `<SearchEmptyState />

<CreateEmptyState
  title="No Content Created"
  description="Start building by creating your first piece of content."
  actions={[...]}
/>

<ErrorEmptyState />

<OfflineEmptyState />`,
    component: <VariantsExample />,
  },
  {
    title: 'Domain-Specific States',
    code: `<NoDataEmptyState
  actions={[
    {
      label: 'Import Data',
      variant: 'primary',
      onClick: () => console.log('Import data'),
    },
  ]}
/>

<NoUsersEmptyState />

<NoFilesEmptyState />`,
    component: <PreBuiltExample />,
  },
  {
    title: 'Custom Empty State',
    code: `<EmptyState
  icon={Database}
  title="Custom Empty State"
  description="This empty state uses a custom icon and styling."
  image="https://illustrations.popsy.co/gray/work-from-home.svg"
  size="lg"
  actions={[
    {
      label: 'Get Started',
      variant: 'primary',
      onClick: () => console.log('Get started'),
    },
  ]}
/>`,
    component: <CustomExample />,
  },
  {
    title: 'Compact Variants',
    code: `<EmptyState
  title="Compact Default"
  description="This is a compact empty state"
  compact
  actions={[...]}
/>

<EmptyState
  title="With Custom Content"
  compact
  size="sm"
>
  <div className="mt-2 p-3 bg-muted rounded-md">
    <p className="text-sm">Custom content goes here</p>
  </div>
</EmptyState>`,
    component: <CompactExample />,
  },
]

export default function EmptyStatePage() {
  return (
    <ComponentLayout
      title="Empty State"
      description="Flexible empty state components for various scenarios including search results, errors, and data loading with pre-built variants and customization options."
      examples={examples}
    />
  )
}