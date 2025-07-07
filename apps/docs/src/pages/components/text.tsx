import React from 'react'

export default function TextPage() {
  return (
    <div className="prose max-w-none">
      <h1>Text</h1>
      <p className="text-lg text-gray-600">
        Flexible text component for body content, paragraphs, and inline text styling.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Text } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Default text component for body content.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <p className="text-base text-gray-700">
            This is a basic text component with default styling. It provides consistent typography across your application.
          </p>
          <p className="text-sm text-gray-600">
            You can also use it for smaller text with different sizes and colors.
          </p>
        </div>
      </div>

      <pre>
        <code>{`<Text>This is a basic text component with default styling.</Text>
<Text size="sm" color="muted">Smaller text with muted color.</Text>`}</code>
      </pre>

      <h2>Sizes</h2>
      <p>Different text sizes for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <p className="text-xs text-gray-700">Extra Small (xs) - 12px</p>
          <p className="text-sm text-gray-700">Small (sm) - 14px</p>
          <p className="text-base text-gray-700">Base (default) - 16px</p>
          <p className="text-lg text-gray-700">Large (lg) - 18px</p>
          <p className="text-xl text-gray-700">Extra Large (xl) - 20px</p>
          <p className="text-2xl text-gray-700">2X Large (2xl) - 24px</p>
        </div>
      </div>

      <pre>
        <code>{`<Text size="xs">Extra Small Text</Text>
<Text size="sm">Small Text</Text>
<Text>Base Text (default)</Text>
<Text size="lg">Large Text</Text>
<Text size="xl">Extra Large Text</Text>
<Text size="2xl">2X Large Text</Text>`}</code>
      </pre>

      <h2>Colors</h2>
      <p>Semantic color options for different text purposes.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <p className="text-gray-900">Default - Primary text color</p>
          <p className="text-gray-600">Muted - Secondary text color</p>
          <p className="text-blue-600">Primary - Brand color</p>
          <p className="text-green-600">Success - Positive feedback</p>
          <p className="text-yellow-600">Warning - Caution messages</p>
          <p className="text-red-600">Error - Error messages</p>
          <p className="text-white bg-gray-800 px-2 py-1 inline-block rounded">White - For dark backgrounds</p>
        </div>
      </div>

      <pre>
        <code>{`<Text>Default text color</Text>
<Text color="muted">Muted text color</Text>
<Text color="primary">Primary brand color</Text>
<Text color="success">Success message</Text>
<Text color="warning">Warning message</Text>
<Text color="error">Error message</Text>
<Text color="white">White text</Text>`}</code>
      </pre>

      <h2>Font Weights</h2>
      <p>Control text emphasis with different font weights.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <p className="font-light text-gray-700">Light (300)</p>
          <p className="font-normal text-gray-700">Normal (400)</p>
          <p className="font-medium text-gray-700">Medium (500)</p>
          <p className="font-semibold text-gray-700">Semibold (600)</p>
          <p className="font-bold text-gray-700">Bold (700)</p>
        </div>
      </div>

      <pre>
        <code>{`<Text weight="light">Light weight text</Text>
<Text weight="normal">Normal weight text</Text>
<Text weight="medium">Medium weight text</Text>
<Text weight="semibold">Semibold weight text</Text>
<Text weight="bold">Bold weight text</Text>`}</code>
      </pre>

      <h2>Text Alignment</h2>
      <p>Align text content within its container.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <p className="text-left text-gray-700 bg-gray-50 p-3 rounded">Left aligned text (default)</p>
          <p className="text-center text-gray-700 bg-gray-50 p-3 rounded">Center aligned text</p>
          <p className="text-right text-gray-700 bg-gray-50 p-3 rounded">Right aligned text</p>
          <p className="text-justify text-gray-700 bg-gray-50 p-3 rounded">Justified text that stretches to fill the width of the container</p>
        </div>
      </div>

      <pre>
        <code>{`<Text align="left">Left aligned text</Text>
<Text align="center">Center aligned text</Text>
<Text align="right">Right aligned text</Text>
<Text align="justify">Justified text</Text>`}</code>
      </pre>

      <h2>Text Transform</h2>
      <p>Transform text casing for consistent styling.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <p className="text-gray-700">Normal case text</p>
          <p className="uppercase text-gray-700">UPPERCASE TEXT</p>
          <p className="lowercase text-gray-700">lowercase text</p>
          <p className="capitalize text-gray-700">Capitalize Each Word</p>
        </div>
      </div>

      <pre>
        <code>{`<Text>Normal case text</Text>
<Text transform="uppercase">uppercase text</Text>
<Text transform="lowercase">LOWERCASE TEXT</Text>
<Text transform="capitalize">capitalize each word</Text>`}</code>
      </pre>

      <h2>As Different Elements</h2>
      <p>Render as different HTML elements while maintaining styling.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-3">
          <p className="text-gray-700">Default paragraph element</p>
          <span className="text-gray-700 block">Rendered as span</span>
          <div className="text-gray-700">Rendered as div</div>
          <label className="text-gray-700 block">Rendered as label</label>
        </div>
      </div>

      <pre>
        <code>{`<Text>Default paragraph</Text>
<Text as="span">Inline span text</Text>
<Text as="div">Block div text</Text>
<Text as="label">Form label text</Text>`}</code>
      </pre>

      <h2>Truncation</h2>
      <p>Handle long text with truncation options.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4 max-w-md">
          <p className="text-gray-700 truncate">
            This is a very long text that will be truncated with an ellipsis when it exceeds the container width
          </p>
          <p className="text-gray-700 line-clamp-2">
            This is a multi-line text that will be clamped to two lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>

      <pre>
        <code>{`<Text truncate>Very long text that will be truncated...</Text>
<Text clamp={2}>Multi-line text that will be clamped to two lines...</Text>`}</code>
      </pre>

      <h2>Usage Examples</h2>
      <p>Common text patterns in real applications.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          {/* Article Preview */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Article Preview</h3>
            <p className="text-sm text-gray-600 mb-2">By John Doe • 5 min read</p>
            <p className="text-gray-700 line-clamp-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Vivamus suscipit tortor eget felis porttitor volutpat.
            </p>
          </div>

          {/* Form Helper Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-1" placeholder="you@example.com" />
            <p className="text-xs text-gray-500">We'll never share your email with anyone else.</p>
          </div>

          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800 font-medium">Error: Invalid credentials</p>
            <p className="text-sm text-red-600 mt-1">Please check your username and password and try again.</p>
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
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"xs" | "sm" | "base" | "lg" | "xl" | "2xl"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"base"</td>
              <td className="px-4 py-3 text-gray-600">Text size</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">color</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"default" | "muted" | "primary" | "success" | "warning" | "error" | "white"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Text color</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">weight</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"light" | "normal" | "medium" | "semibold" | "bold"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"normal"</td>
              <td className="px-4 py-3 text-gray-600">Font weight</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">align</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"left" | "center" | "right" | "justify"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"left"</td>
              <td className="px-4 py-3 text-gray-600">Text alignment</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">transform</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"none" | "uppercase" | "lowercase" | "capitalize"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"none"</td>
              <td className="px-4 py-3 text-gray-600">Text transformation</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">as</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"p" | "span" | "div" | "label"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"p"</td>
              <td className="px-4 py-3 text-gray-600">HTML element to render</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">truncate</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Truncate with ellipsis</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">clamp</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">number</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Number of lines to clamp</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">children</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Text content</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}