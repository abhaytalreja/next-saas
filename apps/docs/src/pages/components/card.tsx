import React from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal, Star } from 'lucide-react'

export default function CardPage() {
  return (
    <div className="prose max-w-none">
      <h1>Card</h1>
      <p className="text-lg text-gray-600">
        Flexible container for grouping related content and actions.
      </p>

      <h2>Import</h2>
      <pre>
        <code>{`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@nextsaas/ui'`}</code>
      </pre>

      <h2>Basic Usage</h2>
      <p>Simple card with header and content sections.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Card Title
              </h3>
              <p className="text-sm text-gray-600">
                Card description goes here
              </p>
            </div>
            <div className="pt-6">
              <p className="text-gray-700">
                This is the card content area where you can put any information.
              </p>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>This is the card content area.</p>
  </CardContent>
</Card>`}</code>
      </pre>

      <h2>Variants</h2>
      <p>Different card styles for various use cases.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h3 className="text-xl font-semibold">Default</h3>
              <p className="text-sm text-gray-600">Standard card with shadow</p>
            </div>
            <div className="pt-6">
              <p className="text-sm text-gray-700">Card content goes here.</p>
            </div>
          </div>

          {/* Elevated */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h3 className="text-xl font-semibold">Elevated</h3>
              <p className="text-sm text-gray-600">Enhanced shadow with hover effect</p>
            </div>
            <div className="pt-6">
              <p className="text-sm text-gray-700">Card content goes here.</p>
            </div>
          </div>

          {/* Outlined */}
          <div className="rounded-lg border-2 border-gray-300 bg-white shadow-none p-6">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h3 className="text-xl font-semibold">Outlined</h3>
              <p className="text-sm text-gray-600">Prominent border, no shadow</p>
            </div>
            <div className="pt-6">
              <p className="text-sm text-gray-700">Card content goes here.</p>
            </div>
          </div>

          {/* Ghost */}
          <div className="rounded-lg border-transparent bg-gray-50 shadow-none p-6">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h3 className="text-xl font-semibold">Ghost</h3>
              <p className="text-sm text-gray-600">Subtle background, no border</p>
            </div>
            <div className="pt-6">
              <p className="text-sm text-gray-700">Card content goes here.</p>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Card variant="default">Default card</Card>
<Card variant="elevated">Elevated card</Card>
<Card variant="outlined">Outlined card</Card>
<Card variant="ghost">Ghost card</Card>`}</code>
      </pre>

      <h2>Padding Variants</h2>
      <p>Control the internal spacing of cards.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-2">Small Padding</h3>
            <p className="text-sm text-gray-600">Compact spacing</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Default Padding</h3>
            <p className="text-sm text-gray-600">Standard spacing</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8">
            <h3 className="text-lg font-semibold mb-2">Large Padding</h3>
            <p className="text-sm text-gray-600">Generous spacing</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">No Padding</h3>
              <p className="text-sm text-gray-600">Custom content spacing</p>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Card padding="sm">Small padding</Card>
<Card padding="default">Default padding</Card>
<Card padding="lg">Large padding</Card>
<Card padding="none">No padding</Card>`}</code>
      </pre>

      <h2>With Footer</h2>
      <p>Cards with action buttons or additional content.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex flex-col space-y-1.5 mb-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Getting Started
              </h3>
              <p className="text-sm text-gray-600">
                Learn how to use our component library
              </p>
            </div>
            <div className="pt-6 mb-6">
              <p className="text-gray-700">
                Follow our comprehensive guide to get up and running with the UI components in minutes.
              </p>
            </div>
            <div className="flex items-center pt-6">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 shadow-sm mr-2">
                Get Started
              </button>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 h-10 px-4 py-2 border-2 border-orange-600 bg-transparent text-orange-600 hover:bg-orange-50">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <pre>
        <code>{`<Card>
  <CardHeader>
    <CardTitle>Getting Started</CardTitle>
    <CardDescription>
      Learn how to use our component library
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Follow our comprehensive guide...</p>
  </CardContent>
  <CardFooter>
    <Button>Get Started</Button>
    <Button variant="outline">Learn More</Button>
  </CardFooter>
</Card>`}</code>
      </pre>

      <h2>Complex Example</h2>
      <p>Rich card with multiple elements and interactions.</p>

      <div className="not-prose border rounded-lg p-6 mb-6">
        <div className="max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-600 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">Sarah Wilson</h4>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Just finished implementing the new dashboard design. Really happy with how it turned out!
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <button className="flex items-center gap-1 hover:text-red-500">
                  <Heart className="h-4 w-4" />
                  24
                </button>
                <button className="flex items-center gap-1 hover:text-blue-500">
                  <MessageCircle className="h-4 w-4" />
                  8
                </button>
                <button className="flex items-center gap-1 hover:text-green-500">
                  <Share className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2>API Reference</h2>

      <div className="not-prose space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Card</h3>
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
                    <code className="text-xs">"default" | "elevated" | "outlined" | "ghost"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">"default"</td>
                  <td className="px-4 py-3 text-gray-600">Visual style variant</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">padding</td>
                  <td className="px-4 py-3 text-gray-600">
                    <code className="text-xs">"none" | "sm" | "default" | "lg"</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">"default"</td>
                  <td className="px-4 py-3 text-gray-600">Internal padding size</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">asChild</td>
                  <td className="px-4 py-3 text-gray-600"><code className="text-xs">boolean</code></td>
                  <td className="px-4 py-3 text-gray-600">false</td>
                  <td className="px-4 py-3 text-gray-600">Render as child component</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">CardHeader</h3>
          <p className="text-sm text-gray-600">Container for card title and description.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">CardTitle</h3>
          <p className="text-sm text-gray-600">Primary heading for the card.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">CardDescription</h3>
          <p className="text-sm text-gray-600">Supporting text or description.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">CardContent</h3>
          <p className="text-sm text-gray-600">Main content area of the card.</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">CardFooter</h3>
          <p className="text-sm text-gray-600">Footer area for actions and additional content.</p>
        </div>
      </div>
    </div>
  )
}