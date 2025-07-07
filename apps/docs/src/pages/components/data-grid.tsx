import { DataGrid } from '@nextsaas/ui'
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
  salary: number
}

const sampleData: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: new Date('2024-01-15'),
    salary: 85000,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Manager',
    status: 'active',
    lastLogin: new Date('2024-01-14'),
    salary: 75000,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    status: 'inactive',
    lastLogin: new Date('2024-01-10'),
    salary: 55000,
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'User',
    status: 'active',
    lastLogin: new Date('2024-01-16'),
    salary: 60000,
  },
]

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name' as keyof User,
    sortable: true,
    filterable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email' as keyof User,
    sortable: true,
    filterable: true,
  },
  {
    id: 'role',
    header: 'Role',
    accessorKey: 'role' as keyof User,
    sortable: true,
    cell: ({ getValue }: any) => {
      const value = getValue()
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Admin' 
            ? 'bg-blue-100 text-blue-800' 
            : value === 'Manager'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status' as keyof User,
    sortable: true,
    cell: ({ getValue }: any) => {
      const value = getValue()
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
  },
  {
    id: 'salary',
    header: 'Salary',
    accessorKey: 'salary' as keyof User,
    sortable: true,
    align: 'right' as const,
    cell: ({ getValue }: any) => {
      const value = getValue()
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value)
    },
  },
  {
    id: 'lastLogin',
    header: 'Last Login',
    accessorKey: 'lastLogin' as keyof User,
    sortable: true,
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value.toLocaleDateString()
    },
  },
]

const BasicExample = () => {
  return (
    <DataGrid
      data={sampleData}
      columns={columns}
      enableSorting
      enableFiltering
    />
  )
}

const WithSelectionExample = () => {
  const [rowSelection, setRowSelection] = useState({})

  return (
    <DataGrid
      data={sampleData}
      columns={columns}
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      getRowId={(row) => row.id}
    />
  )
}

const WithPaginationExample = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 3,
  })

  return (
    <DataGrid
      data={sampleData}
      columns={columns}
      enablePagination
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  )
}

const FullFeaturedExample = () => {
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 2,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  return (
    <DataGrid
      data={sampleData}
      columns={columns}
      
      // Sorting
      enableSorting
      enableMultiSort
      sorting={sorting}
      onSortingChange={setSorting}
      
      // Filtering
      enableFiltering
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      
      // Selection
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      getRowId={(row) => row.id}
      
      // Pagination
      enablePagination
      pagination={pagination}
      onPaginationChange={setPagination}
      
      // Styling
      striped
      hoverable
      
      // Toolbar
      enableToolbar
      toolbarActions={
        <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">
          Add User
        </button>
      }
      onRefresh={() => console.log('Refreshing...')}
      onExport={() => console.log('Exporting...')}
    />
  )
}

const examples = [
  {
    title: 'Basic Data Grid',
    code: `const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <span className="px-2 py-1 rounded-full text-xs">
          {value}
        </span>
      )
    },
  },
]

<DataGrid
  data={data}
  columns={columns}
  enableSorting
  enableFiltering
/>`,
    component: <BasicExample />,
  },
  {
    title: 'With Row Selection',
    code: `const [rowSelection, setRowSelection] = useState({})

<DataGrid
  data={data}
  columns={columns}
  enableRowSelection
  rowSelection={rowSelection}
  onRowSelectionChange={setRowSelection}
  getRowId={(row) => row.id}
/>`,
    component: <WithSelectionExample />,
  },
  {
    title: 'With Pagination',
    code: `const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 3,
})

<DataGrid
  data={data}
  columns={columns}
  enablePagination
  pagination={pagination}
  onPaginationChange={setPagination}
/>`,
    component: <WithPaginationExample />,
  },
  {
    title: 'Full Featured Data Grid',
    code: `<DataGrid
  data={data}
  columns={columns}
  
  // All features enabled
  enableSorting
  enableMultiSort
  enableFiltering
  enableRowSelection
  enablePagination
  
  // Styling
  striped
  hoverable
  
  // Toolbar with actions
  enableToolbar
  toolbarActions={<button>Add User</button>}
  onRefresh={() => console.log('Refreshing...')}
  onExport={() => console.log('Exporting...')}
/>`,
    component: <FullFeaturedExample />,
  },
]

export default function DataGridPage() {
  return (
    <ComponentLayout
      title="Data Grid"
      description="An advanced data grid component with sorting, filtering, selection, pagination, and toolbar actions for complex data management."
      examples={examples}
    />
  )
}