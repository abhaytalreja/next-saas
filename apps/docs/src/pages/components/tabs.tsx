import React, { useState } from 'react'
import { User, Settings, Bell, Shield, CreditCard, FileText } from 'lucide-react'

export default function TabsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="prose max-w-none">
      <h1>Tabs</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400">
        Tab components for organizing content into separate views
      </p>

      <h2>Basic Tabs</h2>
      <p>
        Tabs organize content into multiple panels where users can select a panel to view its associated content.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button className="py-2 px-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  Tab 1
                </button>
                <button className="py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  Tab 2
                </button>
                <button className="py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  Tab 3
                </button>
              </nav>
            </div>
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Content for Tab 1</h4>
              <p className="text-gray-600 text-sm">
                This is the content for the first tab. It can contain any type of content
                including text, images, forms, or other components.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@nextsaas/ui'

<Tabs defaultValue="tab1" className="w-full">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1" className="mt-4">
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Content for Tab 1</h3>
      <p className="text-gray-600">
        This is the content for the first tab.
      </p>
    </div>
  </TabsContent>
  
  <TabsContent value="tab2" className="mt-4">
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Content for Tab 2</h3>
      <p className="text-gray-600">
        This is the content for the second tab.
      </p>
    </div>
  </TabsContent>
  
  <TabsContent value="tab3" className="mt-4">
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-2">Content for Tab 3</h3>
      <p className="text-gray-600">
        This is the content for the third tab.
      </p>
    </div>
  </TabsContent>
</Tabs>`}</code>
      </pre>

      <h2>Tabs with Icons</h2>
      <p>
        Enhance tabs with icons to provide visual context and improve usability.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button className="flex items-center gap-2 py-2 px-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button className="flex items-center gap-2 py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button className="flex items-center gap-2 py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300">
                  <Bell className="h-4 w-4" />
                  Notifications
                </button>
              </nav>
            </div>
            <div className="mt-6 p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full"></div>
                <div>
                  <h4 className="font-semibold text-lg">John Doe</h4>
                  <p className="text-gray-600">john.doe@example.com</p>
                </div>
              </div>
              <p className="text-gray-600">
                Manage your profile information and preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`import { User, Settings, Bell } from 'lucide-react'

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
          <p className="text-gray-600">john.doe@example.com</p>
        </div>
      </div>
      <p className="text-gray-600">
        Manage your profile information and preferences.
      </p>
    </div>
  </TabsContent>
</Tabs>`}</code>
      </pre>

      <h2>Dashboard Tabs</h2>
      <p>
        Complex tab implementations for dashboard interfaces with rich content.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'reports' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'team' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('team')}
              >
                Team
              </button>
            </div>
            
            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">1,234</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">$12,345</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                  <div className="p-6 border border-gray-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              )}
              
              {activeTab === 'analytics' && (
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-4">Analytics Dashboard</h4>
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
              )}
              
              {activeTab === 'reports' && (
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-4">Generated Reports</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <span>Monthly Report - November 2024</span>
                      </div>
                      <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <span>Quarterly Report - Q4 2024</span>
                      </div>
                      <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'team' && (
                <div className="p-6 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold mb-4">Team Members</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">Alice Johnson</div>
                        <div className="text-sm text-gray-600">Product Manager</div>
                      </div>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Admin
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">Bob Smith</div>
                        <div className="text-sm text-gray-600">Developer</div>
                      </div>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        Member
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Dashboard style tabs with state management
const [activeTab, setActiveTab] = useState('overview')

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
        <div className="text-sm text-gray-600">Total Users</div>
      </div>
      {/* More stat cards... */}
    </div>
  </TabsContent>
  
  <TabsContent value="analytics" className="mt-6">
    <div className="p-6 border rounded-lg">
      <h3 className="font-semibold mb-4">Analytics Dashboard</h3>
      {/* Analytics content... */}
    </div>
  </TabsContent>
</Tabs>`}</code>
      </pre>

      <h2>Vertical Tabs</h2>
      <p>
        Vertical tab layout for settings pages and complex navigation interfaces.
      </p>

      <div className="not-prose">
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Live Example</h3>
          <div className="flex gap-6 mb-6">
            <div className="flex flex-col space-y-2 border-r border-gray-200 pr-6 min-w-[200px]">
              <button className="flex items-center gap-2 px-4 py-2 text-left rounded text-sm font-medium bg-blue-50 text-blue-700">
                <User className="h-4 w-4" />
                Account
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-left rounded text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Shield className="h-4 w-4" />
                Security
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-left rounded text-sm font-medium text-gray-700 hover:bg-gray-100">
                <CreditCard className="h-4 w-4" />
                Billing
              </button>
            </div>
            
            <div className="flex-1">
              <div>
                <h4 className="font-semibold mb-3">Account Information</h4>
                <p className="text-gray-600 text-sm">
                  Manage your account details and personal information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Code Example</h3>
      <pre>
        <code>{`// Vertical tabs layout
<div className="flex gap-6">
  <div className="flex flex-col space-y-2 border-r pr-6">
    <button 
      className="flex items-center gap-2 px-4 py-2 text-left rounded"
      onClick={() => setActiveTab('account')}
    >
      <User className="h-4 w-4" />
      Account
    </button>
    <button 
      className="flex items-center gap-2 px-4 py-2 text-left rounded"
      onClick={() => setActiveTab('security')}
    >
      <Shield className="h-4 w-4" />
      Security
    </button>
    <button 
      className="flex items-center gap-2 px-4 py-2 text-left rounded"
      onClick={() => setActiveTab('billing')}
    >
      <CreditCard className="h-4 w-4" />
      Billing
    </button>
  </div>
  
  <div className="flex-1">
    {activeTab === 'account' && (
      <div>
        <h3 className="font-semibold mb-3">Account Information</h3>
        <p>Manage your account details and personal information.</p>
      </div>
    )}
    {/* Other tab content... */}
  </div>
</div>`}</code>
      </pre>

      <h2>API Reference</h2>

      <div className="not-prose">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Tabs</h3>
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">defaultValue</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">The default active tab</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">value</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">The controlled active tab</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">onValueChange</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>(value: string) => void</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Called when the active tab changes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">orientation</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>"horizontal" | "vertical"</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">"horizontal"</td>
                    <td className="px-4 py-3 text-sm text-gray-600">The orientation of the tabs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">TabsList</h3>
            <p className="text-sm text-gray-600 mb-3">Container for tab triggers.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">TabsTrigger</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Prop</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">value</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">The value of the tab</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">disabled</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>boolean</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">Whether the tab is disabled</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">TabsContent</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Prop</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">value</td>
                    <td className="px-4 py-3 text-sm text-gray-600"><code>string</code></td>
                    <td className="px-4 py-3 text-sm text-gray-600">The value of the associated tab</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}