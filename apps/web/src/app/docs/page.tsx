'use client'

import React from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Container,
  Heading,
  Text,
} from '@nextsaas/ui'
import { Box, FileText, ExternalLink } from 'lucide-react'

export default function DocsHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Container>
        <div className="py-16">
          <div className="text-center mb-12">
            <Heading level="h1" className="mb-4">
              NextSaaS Documentation
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive documentation for the NextSaaS design system, components, and development guides.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    <Box className="h-5 w-5" />
                  </div>
                  <CardTitle>UI Components</CardTitle>
                </div>
                <CardDescription>
                  Browse our comprehensive library of React components with live examples and documentation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/docs/components"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  View Components
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle>Developer Guides</CardTitle>
                </div>
                <CardDescription>
                  Learn how to get started, customize components, and integrate with your application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Read Guides
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle>API Reference</CardTitle>
                </div>
                <CardDescription>
                  Detailed API documentation for all components, hooks, and utilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="http://localhost:3001/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Browse API
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Get started with NextSaaS components in your project. All components are built with TypeScript, 
                  support dark mode, and follow accessibility best practices.
                </p>
                
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-2xl mx-auto">
                  <code className="text-sm">
                    npm install @nextsaas/ui
                  </code>
                </div>
                
                <div className="mt-6">
                  <Link
                    href="/docs/components"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Explore Components
                    <Box className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}