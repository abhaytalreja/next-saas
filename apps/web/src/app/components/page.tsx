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
  Badge,
} from '@nextsaas/ui'
import {
  Layers,
  FileText,
  Layout,
  Navigation,
  Database,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'

const componentCategories = [
  {
    id: 'actions',
    name: 'Actions',
    description: 'Interactive elements that trigger actions',
    icon: Layers,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    components: ['Buttons', 'Links', 'Icon Buttons', 'Menus'],
    href: '/components/actions/buttons',
  },
  {
    id: 'forms',
    name: 'Forms',
    description: 'Form elements for user input and data collection',
    icon: FileText,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    components: ['Inputs', 'Select', 'Checkbox & Radio', 'Textarea', 'Switch'],
    href: '/components/forms/inputs',
  },
  {
    id: 'layout',
    name: 'Layout',
    description: 'Structural components for organizing content',
    icon: Layout,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    components: ['Container', 'Grid', 'Stack', 'Section'],
    href: '/components/layout/container',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Components for moving between different views',
    icon: Navigation,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    components: ['Navbar', 'Sidebar', 'Tabs', 'Breadcrumb', 'Pagination'],
    href: '/components/navigation/tabs',
  },
  {
    id: 'data-display',
    name: 'Data Display',
    description: 'Components for presenting information and data',
    icon: Database,
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
    components: ['Cards', 'Table', 'List', 'Stats', 'Badges', 'Avatars'],
    href: '/components/data-display/cards',
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'Components for user feedback and system status',
    icon: MessageSquare,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
    components: ['Alerts', 'Progress', 'Spinner', 'Tooltip', 'Toast', 'Modal', 'Drawer'],
    href: '/components/feedback/alerts',
  },
]

export default function ComponentsOverviewPage() {
  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-12">
            <Heading level="h1" className="mb-4">
              Component Library
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400 max-w-3xl">
              A comprehensive collection of reusable UI components built with React, TypeScript, 
              and Tailwind CSS. Each component is designed with accessibility, customization, 
              and developer experience in mind.
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {componentCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {category.components.map((component) => (
                          <Badge key={component} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                      
                      <Link
                        href={category.href}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                      >
                        Explore Components
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-16">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                    All components are built with modern web standards and best practices. 
                    They support dark mode, responsive design, and are fully accessible.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium mb-1">TypeScript Ready</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full TypeScript support with comprehensive type definitions
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Layout className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-medium mb-1">Responsive Design</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mobile-first design that works on all screen sizes
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-medium mb-1">Accessible</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        WCAG 2.1 compliant with proper ARIA attributes
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}