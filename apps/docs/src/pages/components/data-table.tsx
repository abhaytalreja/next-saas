import { DataTable } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { MoreHorizontal, Edit, Trash, Eye } from 'lucide-react'

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
]

const columns = [
  {
    key: 'name',
    header: 'Name',
    accessor: 'name' as keyof User,
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    accessor: 'email' as keyof User,
    sortable: true,
    filterable: true,
  },
  {
    key: 'role',
    header: 'Role',
    accessor: 'role' as keyof User,
    sortable: true,
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Admin' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status' as keyof User,
    sortable: true,
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
    key: 'lastLogin',
    header: 'Last Login',
    accessor: 'lastLogin' as keyof User,
    sortable: true,
    render: (value: Date) => value.toLocaleDateString(),
  },
]

const BasicExample = () => {
  return (
    <DataTable
      data={sampleData}
      columns={columns}
    />
  )
}

const WithSelectionExample = () => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  return (
    <DataTable
      data={sampleData}
      columns={columns}
      selection={{
        selectedRows,
        onSelectionChange: setSelectedRows,
        getRowId: (row) => row.id,
      }}
    />
  )
}

const WithPaginationExample = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 2,
    total: sampleData.length,
    onPageChange: (page: number) => setPagination(prev => ({ ...prev, page })),
    onPageSizeChange: (pageSize: number) => setPagination(prev => ({ ...prev, pageSize, page: 1 })),
  })

  return (
    <DataTable
      data={sampleData}
      columns={columns}
      pagination={pagination}
    />
  )
}

const WithActionsExample = () => {
  return (
    <DataTable
      data={sampleData}
      columns={columns}
      searchable
      rowActions={{
        render: (row) => (
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-red-600">
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ),
      }}
    />
  )
}

const examples = [
  {
    title: 'Basic Data Table',
    code: `const columns = [
  {
    key: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status',
    render: (value) => (
      <span className="px-2 py-1 rounded-full text-xs font-medium">
        {value}
      </span>
    ),
  },
]

<DataTable
  data={data}
  columns={columns}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'With Row Selection',
    code: `const [selectedRows, setSelectedRows] = useState([])

<DataTable
  data={data}
  columns={columns}
  selection={{
    selectedRows,
    onSelectionChange: setSelectedRows,
    getRowId: (row) => row.id,
  }}
/>`,
    component: <WithSelectionExample />,
  },
  {
    title: 'With Pagination',
    code: `const [pagination, setPagination] = useState({
  page: 1,
  pageSize: 2,
  total: data.length,
  onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
  onPageSizeChange: (pageSize) => setPagination(prev => ({ ...prev, pageSize })),
})

<DataTable
  data={data}
  columns={columns}
  pagination={pagination}
/>`,
    component: <WithPaginationExample />,
  },
  {
    title: 'With Search and Actions',
    code: `<DataTable
  data={data}
  columns={columns}
  searchable
  rowActions={{
    render: (row) => (
      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-100 rounded">
          <Eye className="h-4 w-4" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Edit className="h-4 w-4" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded text-red-600">
          <Trash className="h-4 w-4" />
        </button>
      </div>
    ),
  }}
/>`,
    component: <WithActionsExample />,
  },
]

export default function DataTablePage() {
  return (
    <ComponentLayout
      title="Data Table"
      description="A powerful table component for displaying and managing data with sorting, filtering, pagination, and selection."
      examples={examples}
    />
  )
}