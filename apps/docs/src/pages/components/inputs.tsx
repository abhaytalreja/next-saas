import React, { useState } from 'react'
import { Search, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function InputsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="prose max-w-none">
      <h1>Inputs</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Input components for forms and user input
      </p>

      <h2>Basic Inputs</h2>
      <p>
        The Input component supports various input types for different data collection needs.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 max-w-md mb-6">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Enter a number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Input } from '@nextsaas/ui'

<Input placeholder="Enter your name" />
<Input type="email" placeholder="Enter your email" />
<Input type="password" placeholder="Enter your password" />
<Input type="number" placeholder="Enter a number" />
<Input type="tel" placeholder="Enter your phone number" />`}</code>
      </pre>

      <h2>Input Sizes</h2>
      <p>
        Inputs come in different sizes to fit various UI contexts.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 max-w-md mb-6">
            <input
              type="text"
              placeholder="Small input"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Default input"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Large input"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`<Input size="sm" placeholder="Small input" />
<Input placeholder="Default input" />
<Input size="lg" placeholder="Large input" />`}</code>
      </pre>

      <h2>Inputs with Icons</h2>
      <p>
        Enhance inputs with icons to provide visual context and improve usability.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 max-w-md mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Search, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

// Search input with icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input className="pl-10" placeholder="Search..." />
</div>

// Password input with toggle
<div className="relative">
  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
  <Input 
    className="pl-10 pr-10" 
    type={showPassword ? "text" : "password"} 
    placeholder="Password" 
  />
  <button
    type="button"
    className="absolute right-3 top-1/2 transform -translate-y-1/2"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>`}</code>
      </pre>

      <h2>Input States</h2>
      <p>
        Inputs support various states to provide feedback and guide user interaction.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-4 max-w-md mb-6">
            <input
              type="text"
              placeholder="Normal state"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Focused state (click to see)"
              className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ring-2 ring-blue-500"
            />
            <input
              disabled
              type="text"
              placeholder="Disabled state"
              className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-400 rounded-md cursor-not-allowed"
            />
            <input
              type="text"
              placeholder="Error state"
              className="w-full px-3 py-2 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Success state"
              className="w-full px-3 py-2 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`<Input placeholder="Normal state" />
<Input placeholder="Focused state" />
<Input disabled placeholder="Disabled state" />
<Input error placeholder="Error state" />
<Input success placeholder="Success state" />`}</code>
      </pre>

      <h2>Inputs with Labels</h2>
      <p>
        Provide clear labeling and help text to guide users through form completion.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="space-y-6 max-w-md mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                We'll never share your email with anyone else.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 8 characters long.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                Username (Required)
              </label>
              <input
                type="text"
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-red-600">
                This field is required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`<div>
  <label htmlFor="email">Email Address</label>
  <Input 
    id="email"
    type="email" 
    placeholder="you@example.com" 
  />
  <p className="help-text">
    We'll never share your email with anyone else.
  </p>
</div>

<div>
  <label htmlFor="username" className="required">
    Username (Required)
  </label>
  <Input 
    id="username"
    error
    placeholder="Enter username"
  />
  <p className="error-text">
    This field is required.
  </p>
</div>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose">
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
                <td className="px-4 py-3 text-sm font-medium text-gray-900">type</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>"text" | "email" | "password" | "number" | "tel" | ...</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">"text"</td>
                <td className="px-4 py-3 text-sm text-gray-600">The input type</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">size</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <code>"sm" | "default" | "lg"</code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">"default"</td>
                <td className="px-4 py-3 text-sm text-gray-600">The size of the input</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">disabled</td>
                <td className="px-4 py-3 text-sm text-gray-600"><code>boolean</code></td>
                <td className="px-4 py-3 text-sm text-gray-600">false</td>
                <td className="px-4 py-3 text-sm text-gray-600">Whether the input is disabled</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">error</td>
                <td className="px-4 py-3 text-sm text-gray-600"><code>boolean</code></td>
                <td className="px-4 py-3 text-sm text-gray-600">false</td>
                <td className="px-4 py-3 text-sm text-gray-600">Whether the input has an error state</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">placeholder</td>
                <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">Placeholder text</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">value</td>
                <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">The input value</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">onChange</td>
                <td className="px-4 py-3 text-sm text-gray-600"><code>(event: ChangeEvent) => void</code></td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">Change event handler</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}