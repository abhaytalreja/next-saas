'use client'

import React from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Container,
  Heading,
  Text,
} from '@nextsaas/ui'
import { Download, Upload, Search, Settings } from 'lucide-react'

export default function ButtonsPage() {
  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-8">
            <Heading level="h1" className="mb-2">
              Buttons
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              Button components for actions and navigation
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-12">
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </CardContent>
          </Card>

          {/* Button Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Buttons with Icons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons with Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button variant="secondary">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button variant="ghost">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Disabled Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Disabled State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Default Disabled</Button>
                <Button variant="outline" disabled>
                  Outline Disabled
                </Button>
                <Button variant="secondary" disabled>
                  Secondary Disabled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Loading State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button disabled>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  Loading...
                </Button>
                <Button variant="outline" disabled>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  Processing
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Button Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Button Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <Button variant="outline" className="rounded-r-none border-r-0">
                    Left
                  </Button>
                  <Button variant="outline" className="rounded-none border-r-0">
                    Center
                  </Button>
                  <Button variant="outline" className="rounded-l-none">
                    Right
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm">Option 1</Button>
                  <Button size="sm" variant="outline">Option 2</Button>
                  <Button size="sm" variant="secondary">Option 3</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}