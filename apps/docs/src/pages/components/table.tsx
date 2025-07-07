import { Table } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { MoreHorizontal, ArrowUpDown } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: Date
}

const sampleData: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    lastLogin: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: new Date('2024-01-10'),
  },
  {
    id: '4',
    name: 'Alice Wilson',
    email: 'alice@example.com',
    role: 'Manager',
    status: 'active',
    lastLogin: new Date('2024-01-16'),
  },
]

const BasicExample = () => {
  const columns = [
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Role', accessor: 'role' as keyof User },
    { header: 'Status', accessor: 'status' as keyof User },
  ]

  return (
    <Table columns={columns} data={sampleData} />
  )
}

const CustomRenderExample = () => {
  const columns = [
    { 
      header: 'Name', 
      accessor: 'name' as keyof User,
    },
    { 
      header: 'Email', 
      accessor: 'email' as keyof User,
    },
    {
      header: 'Role',
      accessor: 'role' as keyof User,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Admin' 
            ? 'bg-blue-100 text-blue-800' 
            : value === 'Manager'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof User,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin' as keyof User,
      render: (value: Date) => value.toLocaleDateString(),
    },
  ]

  return (
    <Table columns={columns} data={sampleData} />
  )
}

const SortableExample = () => {
  const columns = [
    { 
      header: 'Name', 
      accessor: 'name' as keyof User,
      sortable: true,
    },
    { 
      header: 'Email', 
      accessor: 'email' as keyof User,
      sortable: true,
    },
    {
      header: 'Role',
      accessor: 'role' as keyof User,
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Admin' 
            ? 'bg-blue-100 text-blue-800' 
            : value === 'Manager'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin' as keyof User,
      sortable: true,
      render: (value: Date) => value.toLocaleDateString(),
    },
  ]

  return (
    <Table columns={columns} data={sampleData} />
  )
}

const WithActionsExample = () => {
  const columns = [
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    {
      header: 'Role',
      accessor: 'role' as keyof User,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Admin' 
            ? 'bg-blue-100 text-blue-800' 
            : value === 'Manager'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof User,
      render: (value: string, row: User) => (
        <div className="flex items-center gap-1">
          <button 
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            onClick={() => console.log('Edit', row.name)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
            onClick={() => console.log('Delete', row.name)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button 
            className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            onClick={() => console.log('More actions', row.name)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <Table columns={columns} data={sampleData} />
  )
}

const VariantsExample = () => {
  const columns = [
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Role', accessor: 'role' as keyof User },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Default Table</h4>
        <Table columns={columns} data={sampleData.slice(0, 3)} />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Striped Table</h4>
        <Table columns={columns} data={sampleData.slice(0, 3)} variant="striped" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Bordered Table</h4>
        <Table columns={columns} data={sampleData.slice(0, 3)} variant="bordered" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Compact Table</h4>
        <Table columns={columns} data={sampleData.slice(0, 3)} size="compact" />
      </div>
    </div>
  )
}

const EmptyStateExample = () => {
  const columns = [
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Role', accessor: 'role' as keyof User },
    { header: 'Status', accessor: 'status' as keyof User },
  ]

  return (
    <Table 
      columns={columns} 
      data={[]} 
      emptyState={{
        title: 'No users found',
        description: 'Get started by adding your first user.',
        action: (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add User
          </button>
        )
      }}
    />
  )
}

const LoadingExample = () => {
  const columns = [
    { header: 'Name', accessor: 'name' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Role', accessor: 'role' as keyof User },
    { header: 'Status', accessor: 'status' as keyof User },
  ]

  return (
    <Table columns={columns} data={sampleData} loading />
  )
}

const examples = [
  {
    title: 'Basic Table',
    code: `interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
}

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Role', accessor: 'role' },
  { header: 'Status', accessor: 'status' },
]

<Table columns={columns} data={userData} />`,
    component: <BasicExample />,
  },
  {
    title: 'Custom Cell Rendering',
    code: `const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  {
    header: 'Role',
    accessor: 'role',
    render: (value) => (
      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
        value === 'Admin' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-gray-100 text-gray-800'
      }\`}>
        {value}
      </span>
    ),
  },
  {
    header: 'Status',
    accessor: 'status',
    render: (value) => (
      <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
        value === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }\`}>
        {value}
      </span>
    ),
  },
]

<Table columns={columns} data={userData} />`,
    component: <CustomRenderExample />,
  },
  {
    title: 'Sortable Columns',
    code: `const columns = [
  { 
    header: 'Name', 
    accessor: 'name',
    sortable: true,
  },
  { 
    header: 'Email', 
    accessor: 'email',
    sortable: true,
  },
  {
    header: 'Role',
    accessor: 'role',
    sortable: true,
    render: (value) => (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {value}
      </span>
    ),
  },
  {
    header: 'Last Login',
    accessor: 'lastLogin',
    sortable: true,
    render: (value) => value.toLocaleDateString(),
  },
]

<Table columns={columns} data={userData} />`,
    component: <SortableExample />,
  },
  {
    title: 'With Actions Column',
    code: `const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Role', accessor: 'role' },
  {
    header: 'Actions',
    accessor: 'id',
    render: (value, row) => (
      <div className="flex items-center gap-1">
        <button 
          className="p-1 hover:bg-gray-100 rounded"
          onClick={() => console.log('Edit', row.name)}
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-red-600"
          onClick={() => console.log('Delete', row.name)}
        >
          <DeleteIcon className="w-4 h-4" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    ),
  },
]

<Table columns={columns} data={userData} />`,
    component: <WithActionsExample />,
  },
  {
    title: 'Table Variants',
    code: `<Table columns={columns} data={data} />
<Table columns={columns} data={data} variant="striped" />
<Table columns={columns} data={data} variant="bordered" />
<Table columns={columns} data={data} size="compact" />`,
    component: <VariantsExample />,
  },
  {
    title: 'Empty State',
    code: `<Table 
  columns={columns} 
  data={[]} 
  emptyState={{
    title: 'No users found',
    description: 'Get started by adding your first user.',
    action: (
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
        Add User
      </button>
    )
  }}
/>`,
    component: <EmptyStateExample />,
  },
  {
    title: 'Loading State',
    code: `<Table columns={columns} data={userData} loading />`,
    component: <LoadingExample />,
  },
]

export default function TablePage() {
  return (
    <ComponentLayout
      title="Table"
      description="A flexible table component for displaying structured data with support for sorting, custom rendering, actions, and various styling options."
      examples={examples}
    />
  )
}