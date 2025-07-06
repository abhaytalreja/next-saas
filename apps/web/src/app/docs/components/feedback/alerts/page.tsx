'use client'

import React from 'react'
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Container,
  Heading,
  Text,
} from '@nextsaas/ui'
import { AlertCircle, Info, CheckCircle, AlertTriangle, X } from 'lucide-react'

export default function AlertsPage() {
  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-8">
            <Heading level="h1" className="mb-2">
              Alerts
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              Alert components for displaying important messages and notifications
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-12">
          {/* Basic Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    This is an informational alert message.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Something went wrong. Please try again.
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your changes have been saved successfully.
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Please review your information before continuing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Alerts with Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts with Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertTitle>Update Available</AlertTitle>
                    <AlertDescription>
                      A new version of the application is available.
                    </AlertDescription>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      Update
                    </button>
                    <button className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      Later
                    </button>
                  </div>
                </Alert>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      Your subscription expires in 3 days. Please renew to avoid service interruption.
                    </AlertDescription>
                  </div>
                  <button className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    Renew Now
                  </button>
                </Alert>

                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertTitle>Backup Completed</AlertTitle>
                    <AlertDescription>
                      Your data has been successfully backed up to the cloud.
                    </AlertDescription>
                  </div>
                  <button className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                    View Details
                  </button>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Dismissible Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Dismissible Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertTitle>Cookie Notice</AlertTitle>
                    <AlertDescription>
                      We use cookies to improve your experience on our website.
                    </AlertDescription>
                  </div>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <X className="h-4 w-4" />
                  </button>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex-1">
                    <AlertTitle>Maintenance Scheduled</AlertTitle>
                    <AlertDescription>
                      System maintenance is scheduled for tonight from 11 PM to 1 AM.
                    </AlertDescription>
                  </div>
                  <button className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded">
                    <X className="h-4 w-4" />
                  </button>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Compact Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Compact Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="py-3">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Form saved as draft
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive" className="py-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Invalid email format
                  </AlertDescription>
                </Alert>

                <Alert className="py-3 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Profile updated successfully
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Alert Variations */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filled alerts */}
                <Alert className="bg-blue-600 text-white border-blue-600">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    This is a filled information alert.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-red-600 text-white border-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    This is a filled error alert.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-green-600 text-white border-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    This is a filled success alert.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-yellow-600 text-white border-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    This is a filled warning alert.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}