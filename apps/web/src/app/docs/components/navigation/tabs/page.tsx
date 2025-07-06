'use client'

import React, { useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Container,
  Heading,
  Text,
  Badge,
  Button,
} from '@nextsaas/ui'
import { User, Settings, Bell, Shield, CreditCard, FileText } from 'lucide-react'

export default function TabsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-full">
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-8">
            <Heading level="h1" className="mb-2">
              Tabs
            </Heading>
            <Text size="lg" className="text-gray-600 dark:text-gray-400">
              Tab components for organizing content into separate views
            </Text>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-8 space-y-12">
          {/* Basic Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="mt-4">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-semibold mb-2">Content for Tab 1</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This is the content for the first tab. It can contain any type of content
                      including text, images, forms, or other components.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="tab2" className="mt-4">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-semibold mb-2">Content for Tab 2</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This is the content for the second tab. Each tab can have completely
                      different content and layout.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="tab3" className="mt-4">
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <h3 className="font-semibold mb-2">Content for Tab 3</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This is the content for the third tab. Tabs are great for organizing
                      related information without overwhelming the user.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Tabs with Icons */}
          <Card>
            <CardHeader>
              <CardTitle>Tabs with Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-4">
                  <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-lg">John Doe</h3>
                        <p className="text-gray-600 dark:text-gray-400">john.doe@example.com</p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your profile information and preferences.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="mt-4">
                  <div className="p-6 border rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Account Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Two-factor authentication</span>
                        <Badge variant="outline">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email notifications</span>
                        <Badge variant="secondary">Disabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Dark mode</span>
                        <Badge>Auto</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="notifications" className="mt-4">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Email notifications</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Push notifications</span>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>SMS notifications</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Dashboard Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Example</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">1,234</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                    </div>
                    <div className="p-6 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">$12,345</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                    </div>
                    <div className="p-6 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">89%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction</div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Analytics Dashboard</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Page Views</span>
                        <span className="font-mono">45,231</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Unique Visitors</span>
                        <span className="font-mono">12,431</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Bounce Rate</span>
                        <span className="font-mono">23.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Avg. Session Duration</span>
                        <span className="font-mono">4:32</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reports" className="mt-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Generated Reports</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <span>Monthly Report - November 2024</span>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <span>Quarterly Report - Q4 2024</span>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <span>Annual Report - 2024</span>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="team" className="mt-6">
                  <div className="p-6 border rounded-lg">
                    <h3 className="font-semibold mb-4">Team Members</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Alice Johnson</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Product Manager</div>
                        </div>
                        <Badge variant="outline">Admin</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Bob Smith</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Developer</div>
                        </div>
                        <Badge variant="secondary">Member</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Carol Davis</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Designer</div>
                        </div>
                        <Badge variant="secondary">Member</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Vertical Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Vertical Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex flex-col space-y-2 border-r pr-6">
                  <button 
                    className={`px-4 py-2 text-left rounded ${activeTab === 'account' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('account')}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </div>
                  </button>
                  <button 
                    className={`px-4 py-2 text-left rounded ${activeTab === 'security' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security
                    </div>
                  </button>
                  <button 
                    className={`px-4 py-2 text-left rounded ${activeTab === 'billing' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => setActiveTab('billing')}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Billing
                    </div>
                  </button>
                </div>
                
                <div className="flex-1">
                  {activeTab === 'account' && (
                    <div>
                      <h3 className="font-semibold mb-3">Account Information</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Manage your account details and personal information.
                      </p>
                    </div>
                  )}
                  {activeTab === 'security' && (
                    <div>
                      <h3 className="font-semibold mb-3">Security Settings</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Configure your security preferences and authentication methods.
                      </p>
                    </div>
                  )}
                  {activeTab === 'billing' && (
                    <div>
                      <h3 className="font-semibold mb-3">Billing & Payments</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        View your billing history and manage payment methods.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}