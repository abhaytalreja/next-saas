'use client'

import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Avatar,
  Container,
  Heading,
  Text,
} from '@nextsaas/ui'
import { Heart, MessageCircle, Share, MoreHorizontal, Star } from 'lucide-react'

export default function CardsPage() {
  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-8">
            <Heading level="h1" className="mb-2">
              Cards
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              Card components for displaying content in organized layouts
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-12">
          {/* Basic Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Basic Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                  <CardDescription>
                    This is a basic card with header and content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Card content goes here. This can include any type of content
                    like text, images, or other components.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card with Footer</CardTitle>
                  <CardDescription>
                    This card includes a footer section.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Content section with relevant information and details.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    This is a card with only content, no header or footer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Profile Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Profile Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <img src="/api/placeholder/40/40" alt="Profile" />
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Software Engineer
                      </p>
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

              <Card>
                <CardContent className="pt-6 text-center">
                  <Avatar className="mx-auto mb-4">
                    <img src="/api/placeholder/60/60" alt="Profile" />
                  </Avatar>
                  <h4 className="font-semibold mb-1">Jane Smith</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Product Designer
                  </p>
                  <div className="flex justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Button size="sm">Connect</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <img src="/api/placeholder/40/40" alt="Profile" />
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">Alex Johnson</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Just shipped a new feature! Excited to see how users respond
                    to the improved onboarding flow.
                  </p>
                </CardContent>
                <CardFooter className="pt-3">
                  <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      12
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      3
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Feature Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Feature Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Fast Performance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lightning-fast loading times and optimized performance.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Secure</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enterprise-grade security with advanced encryption.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">User Friendly</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Intuitive design that users love and understand.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Interactive Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Interactive Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded-t-lg"></div>
                  <div className="p-6">
                    <h4 className="font-semibold mb-2">Hoverable Card</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This card has a hover effect that enhances the shadow.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Add New Item</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to add a new item to your collection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}