'use client'

import React from 'react'
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Container,
  Heading,
  Text,
} from '@nextsaas/ui'
import { Check, X, AlertCircle, Star, Zap } from 'lucide-react'

export default function BadgesPage() {
  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-8">
            <Heading level="h1" className="mb-2">
              Badges
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              Badge components for displaying status, labels, and small pieces of information
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-12">
          {/* Basic Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Status Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Status Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
                  <Check className="mr-1 h-3 w-3" />
                  Active
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100">
                  <X className="mr-1 h-3 w-3" />
                  Inactive
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100">
                  Processing
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Badges with Icons */}
          <Card>
            <CardHeader>
              <CardTitle>Badges with Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">
                  <Star className="mr-1 h-3 w-3" />
                  Featured
                </Badge>
                <Badge variant="secondary">
                  <Zap className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
                <Badge variant="outline">
                  <Check className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100">
                  <Star className="mr-1 h-3 w-3" />
                  Pro
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Size Variations */}
          <Card>
            <CardHeader>
              <CardTitle>Size Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Badge className="text-xs px-2 py-0.5">Small</Badge>
                <Badge>Default</Badge>
                <Badge className="text-sm px-3 py-1">Large</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notification Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-8">
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    3
                  </Badge>
                </div>
                
                <div className="relative">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <Badge className="absolute -top-1 -right-1 h-3 w-3 p-0 bg-green-500 border-2 border-white dark:border-gray-950"></Badge>
                </div>
                
                <div className="relative">
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                    Messages
                  </button>
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white">
                    12
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badge Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Badge Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">Next.js</Badge>
                    <Badge variant="outline">Tailwind CSS</Badge>
                    <Badge variant="outline">Node.js</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Project Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Completed
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      In Progress
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      Not Started
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Priority Levels</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                      High
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      Medium
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Low
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Clickable Badge
                </Badge>
                <Badge 
                  className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  Filter: Active
                  <X className="ml-1 h-3 w-3" />
                </Badge>
                <Badge 
                  className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  Tag: Frontend
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}