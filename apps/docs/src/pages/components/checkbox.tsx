import React from 'react'
import { Check, Minus } from 'lucide-react'

export default function CheckboxPage() {
  return (
    <div className="prose max-w-none">
      <h1>Checkbox</h1>
      <p className="text-lg text-gray-600">
        Allow users to select one or more items from a set of options.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Checkbox } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple checkbox for binary choices.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-sm text-gray-700">Accept terms and conditions</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-sm text-gray-700">Send me promotional emails</span>
          </label>
        </div>
      </div>

      <pre>
        <code>{`<Checkbox>Accept terms and conditions</Checkbox>
<Checkbox defaultChecked>Send me promotional emails</Checkbox>`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different checkbox sizes for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="h-3 w-3 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-xs text-gray-700">Small checkbox</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-sm text-gray-700">Default checkbox</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-base text-gray-700">Large checkbox</span>
          </label>
        </div>
      </div>

      <pre>
        <code>{`<Checkbox size="sm">Small checkbox</Checkbox>
<Checkbox>Default checkbox</Checkbox>
<Checkbox size="lg">Large checkbox</Checkbox>`}</code>
      </pre>

      <h2>States</h2>
      <p>Different checkbox states for user feedback.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-sm text-gray-700">Unchecked</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <span className="ml-2 text-sm text-gray-700">Checked</span>
          </label>
          
          <label className="flex items-center">
            <div className="relative">
              <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" defaultChecked />
              <Minus className="absolute inset-0 h-4 w-4 text-orange-600 pointer-events-none" />
            </div>
            <span className="ml-2 text-sm text-gray-700">Indeterminate</span>
          </label>
          
          <label className="flex items-center opacity-50 cursor-not-allowed">
            <input type="checkbox" disabled className="h-4 w-4 text-gray-400 border-gray-300 rounded cursor-not-allowed" />
            <span className="ml-2 text-sm text-gray-500">Disabled</span>
          </label>
          
          <label className="flex items-center opacity-50 cursor-not-allowed">
            <input type="checkbox" disabled defaultChecked className="h-4 w-4 text-gray-400 border-gray-300 rounded cursor-not-allowed" />
            <span className="ml-2 text-sm text-gray-500">Disabled checked</span>
          </label>
        </div>
      </div>

      <pre>
        <code>{`<Checkbox>Unchecked</Checkbox>
<Checkbox defaultChecked>Checked</Checkbox>
<Checkbox indeterminate>Indeterminate</Checkbox>
<Checkbox disabled>Disabled</Checkbox>
<Checkbox disabled defaultChecked>Disabled checked</Checkbox>`}</code>
      </pre>

      <h2>With Description</h2>
      <p>Checkbox with additional helper text.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <label className="flex items-start">
            <input type="checkbox" className="h-4 w-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <div className="ml-2">
              <span className="text-sm font-medium text-gray-700">Enable notifications</span>
              <p className="text-xs text-gray-500">Get notified when someone comments on your posts.</p>
            </div>
          </label>
          
          <label className="flex items-start">
            <input type="checkbox" className="h-4 w-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
            <div className="ml-2">
              <span className="text-sm font-medium text-gray-700">Marketing emails</span>
              <p className="text-xs text-gray-500">Receive emails about new products, features, and more.</p>
            </div>
          </label>
        </div>
      </div>

      <pre>
        <code>{`<Checkbox
  label="Enable notifications"
  description="Get notified when someone comments on your posts."
/>

<Checkbox
  label="Marketing emails"
  description="Receive emails about new products, features, and more."
/>`}</code>
      </pre>

      <h2>Checkbox Group</h2>
      <p>Multiple checkboxes for selecting multiple options.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select your interests</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
              <span className="ml-2 text-sm text-gray-700">Technology</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
              <span className="ml-2 text-sm text-gray-700">Design</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
              <span className="ml-2 text-sm text-gray-700">Business</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
              <span className="ml-2 text-sm text-gray-700">Marketing</span>
            </label>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<CheckboxGroup label="Select your interests">
  <Checkbox value="tech">Technology</Checkbox>
  <Checkbox value="design" defaultChecked>Design</Checkbox>
  <Checkbox value="business">Business</Checkbox>
  <Checkbox value="marketing" defaultChecked>Marketing</Checkbox>
</CheckboxGroup>`}</code>
      </pre>

      <h2>Custom Styling</h2>
      <p>Checkboxes with custom colors and styles.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600" />
            <span className="ml-2 text-sm text-gray-700">Blue checkbox</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-600" />
            <span className="ml-2 text-sm text-gray-700">Green checkbox</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600" />
            <span className="ml-2 text-sm text-gray-700">Purple checkbox</span>
          </label>
          
          <label className="flex items-center">
            <input type="checkbox" className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-600" />
            <span className="ml-2 text-sm text-gray-700">Red checkbox</span>
          </label>
        </div>
      </div>

      <pre>
        <code>{`<Checkbox color="blue">Blue checkbox</Checkbox>
<Checkbox color="green">Green checkbox</Checkbox>
<Checkbox color="purple">Purple checkbox</Checkbox>
<Checkbox color="red">Red checkbox</Checkbox>`}</code>
      </pre>

      <h2>Form Example</h2>
      <p>Checkboxes in a real form context.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <form className="max-w-md space-y-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Email Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-start">
                <input type="checkbox" defaultChecked className="h-4 w-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-700">Comments</span>
                  <p className="text-xs text-gray-500">Get notified when someone comments on your posts.</p>
                </div>
              </label>
              
              <label className="flex items-start">
                <input type="checkbox" defaultChecked className="h-4 w-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-700">Mentions</span>
                  <p className="text-xs text-gray-500">Get notified when someone mentions you.</p>
                </div>
              </label>
              
              <label className="flex items-start">
                <input type="checkbox" className="h-4 w-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-700">Newsletter</span>
                  <p className="text-xs text-gray-500">Get our weekly newsletter with updates.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600" />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the <a href="#" className="text-orange-600 hover:underline">Terms and Conditions</a>
              </span>
            </label>
          </div>

          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
            Save Preferences
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
              <td className="px-4 py-3 font-medium">checked</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Controlled checked state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">defaultChecked</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Default checked state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">indeterminate</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Indeterminate state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"sm" | "default" | "lg"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Checkbox size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">color</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"orange" | "blue" | "green" | "purple" | "red"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"orange"</td>
              <td className="px-4 py-3 text-gray-600">Checkbox color</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">disabled</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Disabled state</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">onChange</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">function</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Change event handler</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">label</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Checkbox label</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">description</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">string</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Helper text</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">children</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Label content</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}