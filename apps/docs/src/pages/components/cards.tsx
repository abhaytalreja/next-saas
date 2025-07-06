import React from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal, Star } from 'lucide-react'

export default function CardsPage() {
  return (
    <div className="prose max-w-none">
      <h1>Cards</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Card components for displaying content in organized layouts
      </p>

      <h2>Basic Cards</h2>
      <p>
        Cards provide a flexible container for grouping related content and actions.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-2">Simple Card</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  This is a basic card with header and content.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Card content goes here. This can include any type of content
                  like text, images, or other components.
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-2">Card with Footer</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  This card includes a footer section.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Content section with relevant information and details.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This is a card with only content, no header or footer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@nextsaas/ui'

// Simple card
<Card>
  <CardHeader>
    <CardTitle>Simple Card</CardTitle>
    <CardDescription>
      This is a basic card with header and content.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
</Card>

// Card with footer
<Card>
  <CardHeader>
    <CardTitle>Card with Footer</CardTitle>
    <CardDescription>This card includes a footer section.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content section with relevant information.</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm">Learn More</Button>
  </CardFooter>
</Card>`}</code>
      </pre>

      <h2>Profile Cards</h2>
      <p>
        Cards designed for displaying user profiles and social content.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">John Doe</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Software Engineer
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                    React
                  </span>
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                    TypeScript
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button className="w-full px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  View Profile
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-full mx-auto mb-4"></div>
                <h4 className="font-semibold mb-1">Jane Smith</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Product Designer
                </p>
                <div className="flex justify-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Connect
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full"></div>
                    <div>
                      <h4 className="font-semibold text-sm">Alex Johnson</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Just shipped a new feature! Excited to see how users respond
                  to the improved onboarding flow.
                </p>
                <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <button className="flex items-center gap-1 hover:text-gray-800">
                    <Heart className="h-4 w-4" />
                    12
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-800">
                    <MessageCircle className="h-4 w-4" />
                    3
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-800">
                    <Share className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Profile card with avatar and tags
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center space-x-4">
      <Avatar>
        <img src="/profile.jpg" alt="Profile" />
      </Avatar>
      <div className="flex-1">
        <h4 className="font-semibold">John Doe</h4>
        <p className="text-sm text-gray-600">Software Engineer</p>
      </div>
    </div>
    <div className="mt-4 flex space-x-2">
      <Badge variant="secondary">React</Badge>
      <Badge variant="secondary">TypeScript</Badge>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="outline" className="w-full">
      View Profile
    </Button>
  </CardFooter>
</Card>

// Social media style card
<Card>
  <CardHeader className="pb-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar />
        <div>
          <h4 className="font-semibold">Alex Johnson</h4>
          <p className="text-xs text-gray-600">2 hours ago</p>
        </div>
      </div>
      <Button variant="ghost" size="sm">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Just shipped a new feature!</p>
  </CardContent>
  <CardFooter>
    <div className="flex space-x-4">
      <Button variant="ghost" size="sm">
        <Heart className="h-4 w-4 mr-1" />12
      </Button>
      <Button variant="ghost" size="sm">
        <MessageCircle className="h-4 w-4 mr-1" />3
      </Button>
    </div>
  </CardFooter>
</Card>`}</code>
      </pre>

      <h2>Feature Cards</h2>
      <p>
        Cards designed for showcasing features, benefits, or key information.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Fast Performance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lightning-fast loading times and optimized performance.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Secure</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enterprise-grade security with advanced encryption.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">User Friendly</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intuitive design that users love and understand.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Feature card with icon
<Card className="text-center">
  <CardContent className="pt-6">
    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
      <ZapIcon className="w-6 h-6 text-blue-600" />
    </div>
    <h4 className="font-semibold mb-2">Fast Performance</h4>
    <p className="text-sm text-gray-600">
      Lightning-fast loading times and optimized performance.
    </p>
  </CardContent>
</Card>`}</code>
      </pre>

      <h2>Interactive Cards</h2>
      <p>
        Cards with hover effects and interactive elements for enhanced user experience.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600"></div>
              <div className="p-6">
                <h4 className="font-semibold mb-2">Hoverable Card</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This card has a hover effect that enhances the shadow.
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Add New Item</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to add a new item to your collection.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Hoverable card with image
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  <CardContent className="p-0">
    <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg"></div>
    <div className="p-6">
      <h4 className="font-semibold mb-2">Hoverable Card</h4>
      <p className="text-sm text-gray-600">
        This card has a hover effect that enhances the shadow.
      </p>
    </div>
  </CardContent>
</Card>

// Dashed border "add" card
<Card className="border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors">
  <CardContent className="pt-6 text-center">
    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
      <PlusIcon className="w-6 h-6 text-gray-600" />
    </div>
    <h4 className="font-semibold mb-2">Add New Item</h4>
    <p className="text-sm text-gray-600">
      Click to add a new item to your collection.
    </p>
  </CardContent>
</Card>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Card</h3>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">children</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>ReactNode</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">The card content</td>
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
            <h3 className="text-lg font-semibold mb-3">CardHeader</h3>
            <p className="text-sm text-gray-600 mb-3">Container for card title and description.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">CardTitle</h3>
            <p className="text-sm text-gray-600 mb-3">Main heading for the card.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">CardDescription</h3>
            <p className="text-sm text-gray-600 mb-3">Subtitle or description text for the card.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">CardContent</h3>
            <p className="text-sm text-gray-600 mb-3">Main content area of the card.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">CardFooter</h3>
            <p className="text-sm text-gray-600 mb-3">Footer area for actions and additional content.</p>
          </div>
        </div>
      </div>
    </div>
  )
}