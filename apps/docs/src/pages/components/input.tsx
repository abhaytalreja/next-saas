import React, { useState } from 'react'
import { Search, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function InputPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="prose max-w-none">
      <h1>Input</h1>
      <p className="text-lg text-gray-600">
        Text input component for forms and user input.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Input } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Basic text input for user data collection.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="email"
            placeholder="Enter your email"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <pre>
        <code>{`<Input placeholder="Enter your name" />
<Input type="email" placeholder="Enter your email" />
<Input type="password" placeholder="Enter your password" />`}</code>
      </pre>

      <h2>Input Types</h2>
      <p>Support for various HTML input types.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm space-y-4">
          <input
            type="text"
            placeholder="Text input"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="number"
            placeholder="Number input"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="tel"
            placeholder="Phone number"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="url"
            placeholder="Website URL"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <pre>
        <code>{`<Input type="text" placeholder="Text input" />
<Input type="number" placeholder="Number input" />
<Input type="tel" placeholder="Phone number" />
<Input type="url" placeholder="Website URL" />`}</code>
      </pre>

      <h2>Input States</h2>
      <p>Different states to provide user feedback.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm space-y-4">
          <input
            type="text"
            placeholder="Normal state"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Disabled state"
            disabled
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Error state"
            className="flex h-10 w-full rounded-md border border-red-500 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Success state"
            className="flex h-10 w-full rounded-md border border-green-500 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <pre>
        <code>{`<Input placeholder="Normal state" />
<Input placeholder="Disabled state" disabled />
<Input placeholder="Error state" error />
<Input placeholder="Success state" success />`}</code>
      </pre>

      <h2>With Labels</h2>
      <p>Proper labeling for accessibility and usability.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-1 text-sm text-gray-500">
              We'll never share your email.
            </p>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<div>
  <label htmlFor="name">Full Name</label>
  <Input id="name" placeholder="Enter your full name" />
</div>

<div>
  <label htmlFor="email">Email Address</label>
  <Input id="email" type="email" placeholder="you@example.com" />
  <p className="help-text">We'll never share your email.</p>
</div>`}</code>
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
              <td className="px-4 py-3 font-medium">type</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">string</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"text"</td>
              <td className="px-4 py-3 text-gray-600">HTML input type</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">placeholder</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Placeholder text</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">disabled</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Disable the input</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">value</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Input value (controlled)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">defaultValue</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Default value (uncontrolled)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">onChange</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">function</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Change event handler</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}