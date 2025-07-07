import React from 'react'

export default function HeadingPage() {
  return (
    <div className="prose max-w-none">
      <h1>Heading</h1>
      <p className="text-lg text-gray-600">
        Semantic heading components for page structure and content hierarchy.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Heading } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Default heading with automatic styling based on level.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Heading Level 1</h1>
          <h2 className="text-3xl font-semibold text-gray-900">Heading Level 2</h2>
          <h3 className="text-2xl font-semibold text-gray-900">Heading Level 3</h3>
          <h4 className="text-xl font-medium text-gray-900">Heading Level 4</h4>
          <h5 className="text-lg font-medium text-gray-900">Heading Level 5</h5>
          <h6 className="text-base font-medium text-gray-900">Heading Level 6</h6>
        </div>
      </div>

      <pre>
        <code>{`<Heading level="h1">Heading Level 1</Heading>
<Heading level="h2">Heading Level 2</Heading>
<Heading level="h3">Heading Level 3</Heading>
<Heading level="h4">Heading Level 4</Heading>
<Heading level="h5">Heading Level 5</Heading>
<Heading level="h6">Heading Level 6</Heading>`}</code>
      </pre>

      <h2>Visual Sizes</h2>
      <p>Override visual appearance while maintaining semantic meaning.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="text-5xl font-bold text-gray-900">Display Large</div>
          <div className="text-4xl font-bold text-gray-900">Display Medium</div>
          <div className="text-3xl font-bold text-gray-900">Display Small</div>
          <div className="text-2xl font-semibold text-gray-900">Title Large</div>
          <div className="text-xl font-semibold text-gray-900">Title Medium</div>
          <div className="text-lg font-semibold text-gray-900">Title Small</div>
          <div className="text-base font-medium text-gray-900">Body Large</div>
          <div className="text-sm font-medium text-gray-900">Body Small</div>
        </div>
      </div>

      <pre>
        <code>{`<Heading level="h1" size="display-lg">Display Large</Heading>
<Heading level="h1" size="display-md">Display Medium</Heading>
<Heading level="h1" size="display-sm">Display Small</Heading>
<Heading level="h2" size="title-lg">Title Large</Heading>
<Heading level="h2" size="title-md">Title Medium</Heading>
<Heading level="h3" size="title-sm">Title Small</Heading>
<Heading level="h4" size="body-lg">Body Large</Heading>
<Heading level="h5" size="body-sm">Body Small</Heading>`}</code>
      </pre>

      <h2>Colors</h2>
      <p>Different text colors for various contexts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Default Color</h2>
          <h2 className="text-2xl font-semibold text-gray-600">Muted Color</h2>
          <h2 className="text-2xl font-semibold text-blue-600">Primary Color</h2>
          <h2 className="text-2xl font-semibold text-green-600">Success Color</h2>
          <h2 className="text-2xl font-semibold text-yellow-600">Warning Color</h2>
          <h2 className="text-2xl font-semibold text-red-600">Error Color</h2>
        </div>
      </div>

      <pre>
        <code>{`<Heading level="h2" color="default">Default Color</Heading>
<Heading level="h2" color="muted">Muted Color</Heading>
<Heading level="h2" color="primary">Primary Color</Heading>
<Heading level="h2" color="success">Success Color</Heading>
<Heading level="h2" color="warning">Warning Color</Heading>
<Heading level="h2" color="error">Error Color</Heading>`}</code>
      </pre>

      <h2>With Gradient</h2>
      <p>Eye-catching gradient text effects.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gradient Heading
          </h1>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Nature Gradient
          </h2>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Warm Gradient
          </h2>
        </div>
      </div>

      <pre>
        <code>{`<Heading level="h1" gradient="blue-purple">
  Gradient Heading
</Heading>

<Heading level="h2" gradient="green-blue">
  Nature Gradient
</Heading>

<Heading level="h2" gradient="orange-red">
  Warm Gradient
</Heading>`}</code>
      </pre>

      <h2>With Underline</h2>
      <p>Decorative underlines for emphasis.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Simple Underline
            </h2>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 border-b-2 border-blue-600 pb-2 inline-block">
              Colored Underline
            </h2>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 relative pb-2">
              Decorative Underline
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
            </h2>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Heading level="h2" underline="simple">
  Simple Underline
</Heading>

<Heading level="h2" underline="colored" underlineColor="blue">
  Colored Underline
</Heading>

<Heading level="h2" underline="decorative">
  Decorative Underline
</Heading>`}</code>
      </pre>

      <h2>Responsive Typography</h2>
      <p>Headings that adapt to screen size.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Responsive Display
          </h1>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900">
            Responsive Title
          </h2>
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-900">
            Responsive Subtitle
          </h3>
        </div>
      </div>

      <pre>
        <code>{`<Heading level="h1" responsive size="display">
  Responsive Display
</Heading>

<Heading level="h2" responsive size="title">
  Responsive Title
</Heading>

<Heading level="h3" responsive size="subtitle">
  Responsive Subtitle
</Heading>`}</code>
      </pre>

      <h2>Usage in Context</h2>
      <p>Headings used in content layouts.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="space-y-6">
          <article className="bg-white p-6 rounded-lg border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Article Title
            </h1>
            <p className="text-gray-600 mb-4">Published on March 15, 2024</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">
              Section Heading
            </h2>
            <p className="text-gray-700 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            
            <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">
              Subsection Heading
            </h3>
            <p className="text-gray-700">
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </article>
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
              <td className="px-4 py-3 font-medium">level</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"h1" | "h2" | "h3" | "h4" | "h5" | "h6"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"h1"</td>
              <td className="px-4 py-3 text-gray-600">Semantic heading level</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">size</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"display-lg" | "display-md" | "display-sm" | "title-lg" | "title-md" | "title-sm" | "body-lg" | "body-sm"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">Auto</td>
              <td className="px-4 py-3 text-gray-600">Visual size override</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">color</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"default" | "muted" | "primary" | "success" | "warning" | "error"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">"default"</td>
              <td className="px-4 py-3 text-gray-600">Text color variant</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">gradient</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"blue-purple" | "green-blue" | "orange-red"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Gradient text effect</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">underline</td>
              <td className="px-4 py-3 text-gray-600">
                <code className="text-xs">"simple" | "colored" | "decorative"</code>
              </td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Underline style</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">responsive</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
              <td className="px-4 py-3 text-gray-600">false</td>
              <td className="px-4 py-3 text-gray-600">Enable responsive sizing</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">children</td>
              <td className="px-4 py-3 text-gray-600"><code className="text-xs">ReactNode</code></td>
              <td className="px-4 py-3 text-gray-600">-</td>
              <td className="px-4 py-3 text-gray-600">Heading content</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}