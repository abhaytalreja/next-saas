import React from 'react'

export default function SpinnerPage() {
  return (
    <div className="prose max-w-none">
      <h1>Spinner</h1>
      <p className="text-lg text-gray-600">
        Loading indicator for asynchronous operations and data fetching.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Spinner } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple spinner for loading states.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>

      <pre>
        <code>{`<Spinner />`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different spinner sizes for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-xs mt-2">Small</div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-xs mt-2">Default</div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-xs mt-2">Large</div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-xs mt-2">Extra Large</div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Spinner size="sm" />
<Spinner size="default" />
<Spinner size="lg" />
<Spinner size="xl" />`}</code>
      </pre>

      <h2>Colors</h2>
      <p>Different color variants for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div className="text-xs mt-2">Primary</div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
            <div className="text-xs mt-2">Gray</div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <div className="text-xs mt-2">Success</div>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <div className="text-xs mt-2">Error</div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Spinner color="primary" />
<Spinner color="gray" />
<Spinner color="success" />
<Spinner color="error" />`}</code>
      </pre>

      <h2>With Labels</h2>
      <p>Spinner with descriptive text.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Saving changes...</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Processing request...</span>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Spinner>Loading...</Spinner>
<Spinner>Saving changes...</Spinner>
<Spinner>Processing request...</Spinner>`}</code>
      </pre>

      <h2>Centered</h2>
      <p>Spinner centered in container for full-page loading.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading content...</span>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<div className="flex items-center justify-center h-32">
  <Spinner>Loading content...</Spinner>
</div>`}</code>
      </pre>

      <h2>Button Loading</h2>
      <p>Spinner used within buttons for action feedback.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex gap-4">
          <button 
            disabled 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white opacity-50 cursor-not-allowed"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Loading...
          </button>
          
          <button 
            disabled 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-green-600 text-white opacity-50 cursor-not-allowed"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </button>
          
          <button 
            disabled 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-gray-300 bg-white text-gray-700 opacity-50 cursor-not-allowed"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Processing...
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button disabled>
  <Spinner size="sm" color="white" />
  Loading...
</Button>

<Button variant="success" disabled>
  <Spinner size="sm" color="white" />
  Saving...
</Button>

<Button variant="outline" disabled>
  <Spinner size="sm" />
  Processing...
</Button>`}</code>
      </pre>

      <h2>Dot Spinner</h2>
      <p>Alternative spinner design with dots.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Spinner variant="dots" />`}</code>
      </pre>

      <h2>Pulse Spinner</h2>
      <p>Spinner with pulsing animation.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      <pre>
        <code>{`<Spinner variant="pulse" />`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Prop</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Default</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"sm" | "default" | "lg" | "xl"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Spinner size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">color</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"primary" | "gray" | "success" | "error" | "white"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"primary"</td>
              <td className="px-4 py-3 text-gray-600">Spinner color</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">variant</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"default" | "dots" | "pulse"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Spinner animation style</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">children</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Loading label text</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">className</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Additional CSS classes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}