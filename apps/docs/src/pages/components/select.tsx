import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function SelectPage() {
  return (
    <div className="prose max-w-none">
      <h1>Select</h1>
      <p className="text-lg text-gray-600">
        Dropdown select component for choosing from a list of options.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Select } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple select dropdown for single value selection.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm space-y-4">
          <div className="relative">
            <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
              <option value="">Select an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Select>
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
  <option value="option3">Option 3</option>
</Select>`}</code>
      </pre>

      <h2>With Label</h2>
      <p>Select with proper labeling for accessibility.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
                <option value="">Choose a country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<div>
  <label htmlFor="country">Country</label>
  <Select id="country" name="country">
    <option value="">Choose a country</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
    <option value="au">Australia</option>
  </Select>
</div>`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different select sizes for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4 max-w-sm">
          <div className="relative">
            <select className="w-full px-2 py-1 pr-8 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
              <option>Small select</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
              <option>Default select</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select className="w-full px-4 py-3 pr-12 text-base bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
              <option>Large select</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Select size="sm">
  <option>Small select</option>
</Select>

<Select size="default">
  <option>Default select</option>
</Select>

<Select size="lg">
  <option>Large select</option>
</Select>`}</code>
      </pre>

      <h2>States</h2>
      <p>Different select states for user feedback.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Normal</label>
            <div className="relative">
              <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
                <option>Select option</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Disabled</label>
            <div className="relative">
              <select disabled className="w-full px-3 py-2 pr-10 text-sm bg-gray-50 border border-gray-300 rounded-md appearance-none cursor-not-allowed opacity-60">
                <option>Disabled select</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Error</label>
            <div className="relative">
              <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none">
                <option>Select with error</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="mt-1 text-xs text-red-600">Please select a valid option</p>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Select>
  <option>Normal select</option>
</Select>

<Select disabled>
  <option>Disabled select</option>
</Select>

<Select error>
  <option>Select with error</option>
</Select>`}</code>
      </pre>

      <h2>Option Groups</h2>
      <p>Organize options into logical groups.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-sm">
          <div className="relative">
            <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
              <option value="">Select a fruit</option>
              <optgroup label="Citrus">
                <option value="orange">Orange</option>
                <option value="lemon">Lemon</option>
                <option value="lime">Lime</option>
              </optgroup>
              <optgroup label="Berries">
                <option value="strawberry">Strawberry</option>
                <option value="blueberry">Blueberry</option>
                <option value="raspberry">Raspberry</option>
              </optgroup>
              <optgroup label="Tropical">
                <option value="mango">Mango</option>
                <option value="pineapple">Pineapple</option>
                <option value="papaya">Papaya</option>
              </optgroup>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Select>
  <option value="">Select a fruit</option>
  <optgroup label="Citrus">
    <option value="orange">Orange</option>
    <option value="lemon">Lemon</option>
    <option value="lime">Lime</option>
  </optgroup>
  <optgroup label="Berries">
    <option value="strawberry">Strawberry</option>
    <option value="blueberry">Blueberry</option>
    <option value="raspberry">Raspberry</option>
  </optgroup>
  <optgroup label="Tropical">
    <option value="mango">Mango</option>
    <option value="pineapple">Pineapple</option>
    <option value="papaya">Papaya</option>
  </optgroup>
</Select>`}</code>
      </pre>

      <h2>Form Example</h2>
      <p>Select used in a complete form context.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <form className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <div className="relative">
              <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
                <option value="">Select your country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <div className="relative">
              <select className="w-full px-3 py-2 pr-10 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none">
                <option value="">Select language</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
            Submit
          </button>
        </form>
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
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"sm" | "default" | "lg"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Select size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">error</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Error state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">disabled</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Disabled state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">value</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Selected value</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">defaultValue</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Default selected value</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">onChange</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">function</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Change event handler</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">placeholder</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Placeholder text</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">children</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Option elements</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}