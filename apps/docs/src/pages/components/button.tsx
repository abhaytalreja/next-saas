import React from 'react'
import { Download, Upload, Search, Settings, ChevronRight, Plus } from 'lucide-react'

export default function ButtonPage() {
  return (
    <div className="prose max-w-none">
      <h1>Button</h1>
      <p className="text-lg text-gray-600">
        Trigger actions and navigate with our versatile button component.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Button } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Variants</h2>
      <p>Available button variants for different contexts and importance levels.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            Default
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700 shadow-sm">
            Destructive
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 border-2 border-orange-600 bg-transparent text-orange-600 hover:bg-orange-50">
            Outline
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 shadow-sm">
            Secondary
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            Ghost
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 text-orange-600 underline-offset-4 hover:underline">
            Link
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-green-600 text-white hover:bg-green-700 shadow-sm">
            Success
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different button sizes for various UI contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 h-8 px-3 text-xs bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            Small
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            Default
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 h-12 px-6 text-base bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            Large
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 h-14 px-8 text-lg bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            XLarge
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">XLarge</Button>`}</code>
      </pre>

      <h2>With Icons</h2>
      <p>Add icons to buttons using the leftIcon and rightIcon props.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 border-2 border-orange-600 bg-transparent text-orange-600 hover:bg-orange-50">
            Upload
            <Upload className="ml-2 h-4 w-4" />
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 shadow-sm">
            <Search className="mr-2 h-4 w-4" />
            Search
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button leftIcon={<Download />}>Download</Button>
<Button rightIcon={<Upload />}>Upload</Button>
<Button leftIcon={<Search />} rightIcon={<ChevronRight />}>
  Search
</Button>`}</code>
      </pre>

      <h2>Icon Only</h2>
      <p>Use the icon size for buttons that contain only an icon.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 w-10 bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            <Plus className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 w-10 border-2 border-orange-600 bg-transparent text-orange-600 hover:bg-orange-50">
            <Settings className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 w-10 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
<Button variant="outline" size="icon">
  <Settings className="h-4 w-4" />
</Button>
<Button variant="ghost" size="icon">
  <Search className="h-4 w-4" />
</Button>`}</code>
      </pre>

      <h2>Loading State</h2>
      <p>Show loading state with the loading prop.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-orange-600 text-white opacity-50 pointer-events-none">
            <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </button>
          <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 border-2 border-orange-600 bg-transparent text-orange-600 opacity-50 pointer-events-none">
            <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button loading>Loading...</Button>
<Button variant="outline" loading>Processing...</Button>`}</code>
      </pre>

      <h2>Full Width</h2>
      <p>Make button take full width of its container.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-md">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 w-full bg-orange-600 text-white hover:bg-orange-700 shadow-sm">
            Full Width Button
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button fullWidth>Full Width Button</Button>`}</code>
      </pre>

      <h2>Disabled State</h2>
      <p>Disabled buttons prevent user interaction.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-orange-600 text-white opacity-50 pointer-events-none">
            Disabled
          </button>
          <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 border-2 border-orange-600 bg-transparent text-orange-600 opacity-50 pointer-events-none">
            Disabled Outline
          </button>
        </div>
      </div>

      <pre>
        <code>{`<Button disabled>Disabled</Button>
<Button variant="outline" disabled>Disabled Outline</Button>`}</code>
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
              <td className="px-4 py-3 font-medium">variant</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Visual style variant</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"default" | "sm" | "lg" | "xl" | "icon"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Button size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">fullWidth</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Make button full width</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">loading</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Show loading state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">leftIcon</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Icon displayed on the left</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">rightIcon</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Icon displayed on the right</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">disabled</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Disable the button</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">asChild</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Render as child component</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}