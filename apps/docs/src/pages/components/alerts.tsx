import React from 'react'
import { AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react'

export default function AlertsPage() {
  return (
    <div className="prose max-w-none">
      <h1>Alerts</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Alert components for displaying important messages and notifications
      </p>

      <h2>Basic Alerts</h2>
      <p>
        Alerts provide contextual feedback messages for typical user actions with a handful of available and flexible alert messages.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 mb-6">
            <div className="flex p-4 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Information</h4>
                <p className="text-sm">This is an informational alert message.</p>
              </div>
            </div>

            <div className="flex p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Error</h4>
                <p className="text-sm">Something went wrong. Please try again.</p>
              </div>
            </div>

            <div className="flex p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Success</h4>
                <p className="text-sm">Your changes have been saved successfully.</p>
              </div>
            </div>

            <div className="flex p-4 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Warning</h4>
                <p className="text-sm">Please review your information before continuing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Alert, AlertTitle, AlertDescription } from '@nextsaas/ui'
import { Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

// Information alert
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational alert message.
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>

// Success alert
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>

// Warning alert
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    Please review your information before continuing.
  </AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>Alerts with Actions</h2>
      <p>
        Add action buttons to alerts to allow users to respond to the message.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 mb-6">
            <div className="flex p-4 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="flex-shrink-0 w-5 h-5 mr-3" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Update Available</h4>
                <p className="text-sm mb-3">A new version of the application is available.</p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Update
                  </button>
                  <button className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    Later
                  </button>
                </div>
              </div>
            </div>

            <div className="flex p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Action Required</h4>
                <p className="text-sm mb-3">Your subscription expires in 3 days. Please renew to avoid service interruption.</p>
                <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Renew Now
                </button>
              </div>
            </div>

            <div className="flex p-4 text-green-700 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Backup Completed</h4>
                <p className="text-sm mb-3">Your data has been successfully backed up to the cloud.</p>
                <button className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Alert with action buttons
<Alert>
  <Info className="h-4 w-4" />
  <div className="flex-1">
    <AlertTitle>Update Available</AlertTitle>
    <AlertDescription>
      A new version of the application is available.
    </AlertDescription>
    <div className="mt-3 flex space-x-2">
      <Button size="sm">Update</Button>
      <Button variant="ghost" size="sm">Later</Button>
    </div>
  </div>
</Alert>`}</code>
      </pre>

      <h2>Dismissible Alerts</h2>
      <p>
        Allow users to dismiss alerts when they're no longer needed.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-start p-4 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="flex-shrink-0 w-5 h-5 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Cookie Notice</h4>
                <p className="text-sm">We use cookies to improve your experience on our website.</p>
              </div>
              <button className="p-1 ml-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-start p-4 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-3 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Maintenance Scheduled</h4>
                <p className="text-sm">System maintenance is scheduled for tonight from 11 PM to 1 AM.</p>
              </div>
              <button className="p-1 ml-3 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Dismissible alert
<Alert className="flex items-start">
  <Info className="h-4 w-4 mt-0.5" />
  <div className="flex-1 ml-3">
    <AlertTitle>Cookie Notice</AlertTitle>
    <AlertDescription>
      We use cookies to improve your experience on our website.
    </AlertDescription>
  </div>
  <button 
    className="p-1 ml-3 hover:bg-gray-100 rounded"
    onClick={() => setShowAlert(false)}
  >
    <X className="h-4 w-4" />
  </button>
</Alert>`}</code>
      </pre>

      <h2>Compact Alerts</h2>
      <p>
        Smaller alerts for less prominent notifications or inline validation messages.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center p-3 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 mr-2" />
              <p className="text-sm">Form saved as draft</p>
            </div>

            <div className="flex items-center p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">Invalid email format</p>
            </div>

            <div className="flex items-center p-3 text-green-700 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">Profile updated successfully</p>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Compact alerts
<Alert className="py-3">
  <Info className="h-4 w-4" />
  <AlertDescription className="ml-2">
    Form saved as draft
  </AlertDescription>
</Alert>

<Alert variant="destructive" className="py-3">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription className="ml-2">
    Invalid email format
  </AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>Filled Alert Variations</h2>
      <p>
        High-contrast filled alerts for maximum visibility and impact.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 mb-6">
            <div className="flex p-4 text-white bg-blue-600 rounded-lg">
              <Info className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Information</h4>
                <p className="text-sm">This is a filled information alert.</p>
              </div>
            </div>

            <div className="flex p-4 text-white bg-red-600 rounded-lg">
              <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Error</h4>
                <p className="text-sm">This is a filled error alert.</p>
              </div>
            </div>

            <div className="flex p-4 text-white bg-green-600 rounded-lg">
              <CheckCircle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Success</h4>
                <p className="text-sm">This is a filled success alert.</p>
              </div>
            </div>

            <div className="flex p-4 text-white bg-yellow-600 rounded-lg">
              <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-3" />
              <div>
                <h4 className="font-semibold mb-1">Warning</h4>
                <p className="text-sm">This is a filled warning alert.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Filled alerts
<Alert className="bg-blue-600 text-white border-blue-600">
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is a filled information alert.
  </AlertDescription>
</Alert>

<Alert className="bg-red-600 text-white border-red-600">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    This is a filled error alert.
  </AlertDescription>
</Alert>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Alert</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Prop</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Default</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">variant</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <code>"default" | "destructive" | "success" | "warning"</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">"default"</td>
                    <td className="px-4 py-3 text-sm text-gray-600">The visual style variant</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">children</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>ReactNode</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">The alert content</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">className</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Additional CSS classes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">AlertTitle</h3>
            <p className="text-sm text-gray-600 mb-3">Title component for alerts.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">AlertDescription</h3>
            <p className="text-sm text-gray-600 mb-3">Description component for alert content.</p>
          </div>
        </div>
      </div>
    </div>
  )
}