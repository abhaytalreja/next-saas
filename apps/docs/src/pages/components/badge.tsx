import React from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'

export default function BadgePage() {
  return (
    <div className="prose max-w-none">
      <h1>Badge</h1>
      <p className="text-lg text-gray-600">
        Small status indicators and labels for categorizing content.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Badge } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple badge for status indication.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
            Default
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
            Primary
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
            Success
          </span>
        </div>
      </div>

      <pre>
        <code>{`<Badge>Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>`}</code>
      </pre>

      <h2>Variants</h2>
      <p>Different badge styles for various use cases.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
            Default
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
            Primary
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
            Success
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
            Warning
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
            Error
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800">
            Info
          </span>
        </div>
      </div>

      <pre>
        <code>{`<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different badge sizes for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
            Small
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
            Default
          </span>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800">
            Large
          </span>
        </div>
      </div>

      <pre>
        <code>{`<Badge size="sm">Small</Badge>
<Badge size="default">Default</Badge>
<Badge size="lg">Large</Badge>`}</code>
      </pre>

      <h2>With Icons</h2>
      <p>Badges with icons for better visual communication.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
            <X className="mr-1 h-3 w-3" />
            Failed
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </span>
        </div>
      </div>

      <pre>
        <code>{`<Badge variant="success">
  <Check className="mr-1 h-3 w-3" />
  Completed
</Badge>

<Badge variant="error">
  <X className="mr-1 h-3 w-3" />
  Failed
</Badge>

<Badge variant="warning">
  <AlertTriangle className="mr-1 h-3 w-3" />
  Warning
</Badge>`}</code>
      </pre>

      <h2>Outline Style</h2>
      <p>Badge with outline styling for subtle indication.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-gray-300 text-gray-700">
            Default
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-blue-300 text-blue-700">
            Primary
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-green-300 text-green-700">
            Success
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-yellow-300 text-yellow-700">
            Warning
          </span>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-red-300 text-red-700">
            Error
          </span>
        </div>
      </div>

      <pre>
        <code>{`<Badge variant="default" outline>Default</Badge>
<Badge variant="primary" outline>Primary</Badge>
<Badge variant="success" outline>Success</Badge>
<Badge variant="warning" outline>Warning</Badge>
<Badge variant="error" outline>Error</Badge>`}</code>
      </pre>

      <h2>Dot Indicators</h2>
      <p>Small dot badges for minimal status indication.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-sm">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>
            <span className="text-sm">Away</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
            <span className="text-sm">Offline</span>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Badge variant="dot" color="green">Online</Badge>
<Badge variant="dot" color="yellow">Away</Badge>
<Badge variant="dot" color="red">Offline</Badge>`}</code>
      </pre>

      <h2>Usage in Context</h2>
      <p>Badges used with other components.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              <div>
                <h4 className="font-medium">John Doe</h4>
                <p className="text-sm text-gray-600">john@example.com</p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              Admin
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Project Alpha</h4>
              <p className="text-sm text-gray-600">Last updated 2 hours ago</p>
            </div>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
              In Progress
            </span>
          </div>
        </div>
      </div>

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
                <code className="text-xs">"default" | "primary" | "success" | "warning" | "error" | "info"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Badge color variant</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"sm" | "default" | "lg"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Badge size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">outline</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Use outline style</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">children</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Badge content</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}