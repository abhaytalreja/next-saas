import React from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

export default function AlertPage() {
  return (
    <div className="prose max-w-none">
      <h1>Alert</h1>
      <p className="text-lg text-gray-600">
        Display important messages and notifications to users.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Alert, AlertDescription, AlertTitle } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple alert with title and description.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  This is an informational alert with some details.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational alert with some details.
  </AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>Variants</h2>
      <p>Different alert types for various use cases.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          {/* Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Info</h3>
                <div className="mt-2 text-sm text-blue-700">
                  General information or updates.
                </div>
              </div>
            </div>
          </div>

          {/* Success */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  Operation completed successfully.
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  Please review this carefully.
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  Something went wrong. Please try again.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Alert variant="info">
  <Info className="h-4 w-4" />
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>General information or updates.</AlertDescription>
</Alert>

<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review this carefully.</AlertDescription>
</Alert>

<Alert variant="error">
  <X className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>Without Title</h2>
      <p>Alert with only description text.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <div className="text-sm text-blue-700">
                  Your account has been updated successfully.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Alert>
  <Info className="h-4 w-4" />
  <AlertDescription>
    Your account has been updated successfully.
  </AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>Dismissible</h2>
      <p>Alert that can be dismissed by the user.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Settings Saved
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  Your preferences have been saved successfully.
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Alert variant="success" dismissible>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Settings Saved</AlertTitle>
  <AlertDescription>
    Your preferences have been saved successfully.
  </AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Alert</h3>
          <div className="overflow-x-auto">
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
                    <code className="text-xs">"info" | "success" | "warning" | "error"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">"info"</td>
                  <td className="px-4 py-3 text-gray-600">Alert style variant</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">dismissible</td>
                  <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
                  <td className="px-4 py-3 text-gray-600">false</td>
                  <td className="px-4 py-3 text-gray-600">Show dismiss button</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">onDismiss</td>
                  <td className="px-4 py-3 text-gray-600"><code className="text-xs">function</code></td>
                  <td className="px-4 py-3 text-gray-600">-</td>
                  <td className="px-4 py-3 text-gray-600">Dismiss callback</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">AlertTitle</h3>
          <p className="text-sm text-gray-600">Alert heading component.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">AlertDescription</h3>
          <p className="text-sm text-gray-600">Alert content area.</p>
        </div>
      </div>
    </div>
  )
}