import { Pagination } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600">
        Current page: {currentPage} of {totalPages}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

const SizesExample = () => {
  const [pages, setPages] = useState({ sm: 1, md: 1, lg: 1 })
  const totalPages = 10

  const updatePage = (size: keyof typeof pages, page: number) => {
    setPages(prev => ({ ...prev, [size]: page }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Small</h4>
        <Pagination
          size="sm"
          currentPage={pages.sm}
          totalPages={totalPages}
          onPageChange={(page) => updatePage('sm', page)}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Medium (Default)</h4>
        <Pagination
          size="md"
          currentPage={pages.md}
          totalPages={totalPages}
          onPageChange={(page) => updatePage('md', page)}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Large</h4>
        <Pagination
          size="lg"
          currentPage={pages.lg}
          totalPages={totalPages}
          onPageChange={(page) => updatePage('lg', page)}
        />
      </div>
    </div>
  )
}

const VariantsExample = () => {
  const [pages, setPages] = useState({ simple: 1, full: 1, minimal: 1 })
  const totalPages = 15

  const updatePage = (variant: keyof typeof pages, page: number) => {
    setPages(prev => ({ ...prev, [variant]: page }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Simple (Previous/Next only)</h4>
        <Pagination
          variant="simple"
          currentPage={pages.simple}
          totalPages={totalPages}
          onPageChange={(page) => updatePage('simple', page)}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Full (All page numbers)</h4>
        <Pagination
          variant="full"
          currentPage={pages.full}
          totalPages={totalPages}
          onPageChange={(page) => updatePage('full', page)}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Minimal (Compact with ellipsis)</h4>
        <Pagination
          variant="minimal"
          currentPage={pages.minimal}
          totalPages={totalPages}
          onPageChange={(page) => updatePage('minimal', page)}
        />
      </div>
    </div>
  )
}

const CustomizationExample = () => {
  const [currentPage, setCurrentPage] = useState(5)
  const totalPages = 20

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Sibling Count (2)</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          siblingCount={2}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Boundary Count (2)</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          boundaryCount={2}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Hide Previous/Next</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showPrevNext={false}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Hide First/Last</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showFirstLast={false}
        />
      </div>
    </div>
  )
}

const WithInfoExample = () => {
  const [currentPage, setCurrentPage] = useState(3)
  const totalPages = 12
  const itemsPerPage = 20
  const totalItems = 240

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showInfo
        infoText={`Page ${currentPage} of ${totalPages}`}
      />
      
      <div className="text-center text-xs text-gray-500">
        Items per page: {itemsPerPage}
      </div>
    </div>
  )
}

const DataTableExample = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Sample data
  const allItems = Array.from({ length: 157 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Inactive' : 'Pending',
    date: new Date(2024, 0, (i % 30) + 1).toLocaleDateString()
  }))

  const totalPages = Math.ceil(allItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = allItems.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Sample Data Table</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{item.id}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Active' ? 'bg-green-100 text-green-800' :
                    item.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allItems.length)} of {allItems.length} results
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

const DisabledExample = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Normal Pagination</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Disabled Pagination</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Loading State</h4>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          loading
        />
      </div>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Pagination',
    code: `const [currentPage, setCurrentPage] = useState(1)
const totalPages = 10

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'Different Sizes',
    code: `const [currentPage, setCurrentPage] = useState(1)
const totalPages = 10

<Pagination
  size="sm"
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

<Pagination
  size="md"
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

<Pagination
  size="lg"
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>`,
    component: <SizesExample />,
  },
  {
    title: 'Pagination Variants',
    code: `const [currentPage, setCurrentPage] = useState(1)
const totalPages = 15

// Simple variant (Previous/Next only)
<Pagination
  variant="simple"
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

// Full variant (All page numbers)
<Pagination
  variant="full"
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

// Minimal variant (Compact with ellipsis)
<Pagination
  variant="minimal"
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>`,
    component: <VariantsExample />,
  },
  {
    title: 'Customization Options',
    code: `const [currentPage, setCurrentPage] = useState(5)
const totalPages = 20

// Custom sibling count (pages around current page)
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  siblingCount={2}
/>

// Custom boundary count (pages at start/end)
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  boundaryCount={2}
/>

// Hide previous/next buttons
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showPrevNext={false}
/>

// Hide first/last buttons
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  showFirstLast={false}
/>`,
    component: <CustomizationExample />,
  },
  {
    title: 'With Additional Info',
    code: `const [currentPage, setCurrentPage] = useState(3)
const totalPages = 12
const itemsPerPage = 20
const totalItems = 240

const startItem = (currentPage - 1) * itemsPerPage + 1
const endItem = Math.min(currentPage * itemsPerPage, totalItems)

<div className="space-y-4">
  <div className="text-center text-sm text-gray-600">
    Showing {startItem} to {endItem} of {totalItems} results
  </div>
  
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
    showInfo
    infoText={\`Page \${currentPage} of \${totalPages}\`}
  />
</div>`,
    component: <WithInfoExample />,
  },
  {
    title: 'Data Table Pagination',
    code: `const [currentPage, setCurrentPage] = useState(1)
const [itemsPerPage, setItemsPerPage] = useState(10)

// Sample data
const allItems = Array.from({ length: 157 }, (_, i) => ({
  id: i + 1,
  name: \`Item \${i + 1}\`,
  status: i % 3 === 0 ? 'Active' : 'Inactive'
}))

const totalPages = Math.ceil(allItems.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const currentItems = allItems.slice(startIndex, startIndex + itemsPerPage)

<div className="space-y-4">
  {/* Items per page selector */}
  <div className="flex items-center gap-2">
    <span>Items per page:</span>
    <select
      value={itemsPerPage}
      onChange={(e) => {
        setItemsPerPage(Number(e.target.value))
        setCurrentPage(1)
      }}
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
    </select>
  </div>
  
  {/* Data table */}
  <table>
    {/* ... table content ... */}
  </table>
  
  {/* Pagination */}
  <div className="flex justify-between items-center">
    <div>
      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allItems.length)} of {allItems.length} results
    </div>
    
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  </div>
</div>`,
    component: <DataTableExample />,
  },
  {
    title: 'Disabled and Loading States',
    code: `const [currentPage, setCurrentPage] = useState(1)
const totalPages = 10

// Normal state
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

// Disabled state
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  disabled
/>

// Loading state
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  loading
/>`,
    component: <DisabledExample />,
  },
]

export default function PaginationPage() {
  return (
    <ComponentLayout
      title="Pagination"
      description="A navigation component for splitting large datasets across multiple pages, providing users with easy access to different sections of content."
      examples={examples}
    />
  )
}