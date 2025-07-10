import React from 'react'
import { Download, Upload, Search, Settings } from 'lucide-react'

// Since this is a docs app, we'll need to import the components directly
// For now, I'll create basic examples showing the structure

export default function ButtonsPage() {
  return (
    <div className="prose max-w-none">
      <h1>Buttons</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Button components for actions and navigation
      </p>

      <h2>Button Variants</h2>
      <p>
        The Button component supports multiple variants to convey different
        actions and importance levels.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Default
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              Destructive
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Outline
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Secondary
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors">
              Ghost
            </button>
            <button className="px-4 py-2 text-blue-600 hover:text-blue-700 underline">
              Link
            </button>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Button } from '@nextsaas/ui'

// Different variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}</code>
      </pre>

      <h2>Button Sizes</h2>
      <p>Buttons come in three sizes to fit different UI contexts.</p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Small
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Default
            </button>
            <button className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Large
            </button>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}</code>
      </pre>

      <h2>Buttons with Icons</h2>
      <p>
        Enhance buttons with icons to provide visual context and improve
        usability.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4" />
              Upload
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              <Search className="h-4 w-4" />
              Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Download, Upload, Search, Settings } from 'lucide-react'

<Button>
  <Download className="mr-2 h-4 w-4" />
  Download
</Button>

<Button variant="outline">
  <Upload className="mr-2 h-4 w-4" />
  Upload
</Button>`}</code>
      </pre>

      <h2>Disabled State</h2>
      <p>
        Buttons can be disabled to prevent user interaction when an action is
        not available.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Default Disabled
            </button>
            <button
              disabled
              className="px-4 py-2 border border-gray-200 text-gray-400 rounded-md cursor-not-allowed"
            >
              Outline Disabled
            </button>
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
            >
              Secondary Disabled
            </button>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`<Button disabled>Default Disabled</Button>
<Button variant="outline" disabled>Outline Disabled</Button>
<Button variant="secondary" disabled>Secondary Disabled</Button>`}</code>
      </pre>

      <h2>Loading State</h2>
      <p>
        Display loading states to provide feedback during asynchronous
        operations.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-not-allowed"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              Loading...
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md cursor-not-allowed"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              Processing
            </button>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`<Button disabled>
  <Spinner className="mr-2 h-4 w-4" />
  Loading...
</Button>

<Button variant="outline" disabled>
  <Spinner className="mr-2 h-4 w-4" />
  Processing
</Button>`}</code>
      </pre>

      <h2>Button Groups</h2>
      <p>Group related buttons together for a cohesive interface.</p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 mb-6">
            <div className="flex">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-l-md border-r-0 hover:bg-gray-50 transition-colors">
                Left
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 border-r-0 hover:bg-gray-50 transition-colors">
                Center
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-r-md hover:bg-gray-50 transition-colors">
                Right
              </button>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Option 1
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Option 2
              </button>
              <button className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                Option 3
              </button>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Connected button group
<div className="flex">
  <Button variant="outline" className="rounded-r-none border-r-0">
    Left
  </Button>
  <Button variant="outline" className="rounded-none border-r-0">
    Center
  </Button>
  <Button variant="outline" className="rounded-l-none">
    Right
  </Button>
</div>

// Spaced button group
<div className="flex gap-2">
  <Button size="sm">Option 1</Button>
  <Button size="sm" variant="outline">Option 2</Button>
  <Button size="sm" variant="secondary">Option 3</Button>
</div>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Prop
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  variant
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>
                    "default" | "destructive" | "outline" | "secondary" |
                    "ghost" | "link"
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">"default"</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  The visual style variant
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  size
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>"sm" | "default" | "lg"</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">"default"</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  The size of the button
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  disabled
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>boolean</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">false</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Whether the button is disabled
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  children
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>ReactNode</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  The button content
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  onClick
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>(event: MouseEvent) =&gt; void</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Click event handler
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
