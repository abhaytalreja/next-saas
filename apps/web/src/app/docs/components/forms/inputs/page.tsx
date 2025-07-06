'use client'

import React, { useState } from 'react'
import {
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Container,
  Heading,
  Text,
} from '@nextsaas/ui'
import { Search, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function InputsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-8">
            <Heading level="h1" className="mb-2">
              Inputs
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              Input components for forms and user input
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-12">
          {/* Basic Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <Input placeholder="Enter your name" />
                <Input type="email" placeholder="Enter your email" />
                <Input type="password" placeholder="Enter your password" />
                <Input type="number" placeholder="Enter a number" />
                <Input type="tel" placeholder="Enter your phone number" />
              </div>
            </CardContent>
          </Card>

          {/* Input Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Input Sizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <Input size="sm" placeholder="Small input" />
                <Input placeholder="Default input" />
                <Input size="lg" placeholder="Large input" />
              </div>
            </CardContent>
          </Card>

          {/* Inputs with Icons */}
          <Card>
            <CardHeader>
              <CardTitle>Inputs with Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Search..." 
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" placeholder="Username" />
                </div>
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input className="pl-10" type="email" placeholder="Email address" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    className="pl-10 pr-10" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input States */}
          <Card>
            <CardHeader>
              <CardTitle>Input States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <Input placeholder="Normal state" />
                <Input placeholder="Focused state (click to see)" />
                <Input disabled placeholder="Disabled state" />
                <Input 
                  placeholder="Error state" 
                  className="border-red-500 focus:border-red-500 focus:ring-red-500" 
                />
                <Input 
                  placeholder="Success state" 
                  className="border-green-500 focus:border-green-500 focus:ring-green-500" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Input with Labels and Help Text */}
          <Card>
            <CardHeader>
              <CardTitle>Inputs with Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input type="email" placeholder="you@example.com" />
                  <p className="mt-1 text-sm text-gray-500">
                    We'll never share your email with anyone else.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <Input type="password" placeholder="Enter your password" />
                  <p className="mt-1 text-sm text-gray-500">
                    Must be at least 8 characters long.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Username (Required)
                  </label>
                  <Input 
                    placeholder="Enter username" 
                    className="border-red-500 focus:border-red-500 focus:ring-red-500"
                  />
                  <p className="mt-1 text-sm text-red-600">
                    This field is required.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}