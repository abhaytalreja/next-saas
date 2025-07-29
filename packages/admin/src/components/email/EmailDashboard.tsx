'use client'

import React, { useState } from 'react'
import { Mail, Send, Users, BarChart3, Settings, Plus, Eye, Edit, Trash2, RefreshCw, Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Progress
} from '@nextsaas/ui'
import { AnalyticsChart } from '../analytics/AnalyticsChart'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent' | 'sending'
  template: string
  recipients: number
  sent: number
  opened: number
  clicked: number
  deliveryRate: number
  openRate: number
  clickRate: number
  createdAt: string
  scheduledAt?: string
  sentAt?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  type: 'welcome' | 'newsletter' | 'promotional' | 'transactional'
  status: 'active' | 'inactive'
  lastUsed?: string
  usageCount: number
  createdAt: string
}

interface EmailMetrics {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  totalUnsubscribed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Welcome Series - Week 1',
    subject: 'Welcome to NextSaaS! Get Started in 5 Minutes',
    status: 'sent',
    template: 'welcome-template',
    recipients: 1250,
    sent: 1250,
    opened: 875,
    clicked: 312,
    deliveryRate: 98.4,
    openRate: 70.0,
    clickRate: 25.0,
    createdAt: '2024-01-15T10:00:00Z',
    sentAt: '2024-01-15T14:00:00Z'
  },
  {
    id: '2',
    name: 'Product Update Newsletter',
    subject: 'New Features Released - Enhanced Analytics Dashboard',
    status: 'sending',
    template: 'newsletter-template',
    recipients: 5420,
    sent: 3200,
    opened: 1280,
    clicked: 384,
    deliveryRate: 97.8,
    openRate: 40.0,
    clickRate: 12.0,
    createdAt: '2024-01-20T09:00:00Z',
    scheduledAt: '2024-01-21T10:00:00Z'
  },
  {
    id: '3',
    name: 'Holiday Promotion',
    subject: '🎉 50% Off All Plans - Limited Time Offer',
    status: 'scheduled',
    template: 'promotional-template',
    recipients: 8750,
    sent: 0,
    opened: 0,
    clicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    createdAt: '2024-01-18T16:00:00Z',
    scheduledAt: '2024-01-25T12:00:00Z'
  }
]

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}!',
    type: 'welcome',
    status: 'active',
    lastUsed: '2024-01-20T10:00:00Z',
    usageCount: 156,
    createdAt: '2024-01-01T12:00:00Z'
  },
  {
    id: '2',
    name: 'Newsletter Template',
    subject: 'Newsletter - {{date}}',
    type: 'newsletter',
    status: 'active',
    lastUsed: '2024-01-19T14:00:00Z',
    usageCount: 24,
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: '3',
    name: 'Promotional Campaign',
    subject: 'Special Offer Just for You!',
    type: 'promotional',
    status: 'active',
    lastUsed: '2024-01-15T09:00:00Z',
    usageCount: 8,
    createdAt: '2024-01-10T15:00:00Z'
  },
  {
    id: '4',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    type: 'transactional',
    status: 'active',
    lastUsed: '2024-01-21T11:30:00Z',
    usageCount: 89,
    createdAt: '2024-01-01T12:00:00Z'
  }
]

const mockMetrics: EmailMetrics = {
  totalSent: 45820,
  totalDelivered: 44956,
  totalOpened: 22478,
  totalClicked: 6743,
  totalBounced: 864,
  totalUnsubscribed: 156,
  deliveryRate: 98.1,
  openRate: 50.0,
  clickRate: 15.0,
  bounceRate: 1.9,
  unsubscribeRate: 0.3
}

export function EmailDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    console.log('Exporting email data...')
  }

  const getStatusBadge = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'sent': return <Badge variant="default">Sent</Badge>
      case 'sending': return <Badge variant="secondary">Sending</Badge>
      case 'scheduled': return <Badge variant="outline">Scheduled</Badge>
      case 'draft': return <Badge variant="destructive">Draft</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTemplateTypeBadge = (type: EmailTemplate['type']) => {
    switch (type) {
      case 'welcome': return <Badge variant="default">Welcome</Badge>
      case 'newsletter': return <Badge variant="secondary">Newsletter</Badge>
      case 'promotional': return <Badge variant="outline">Promotional</Badge>
      case 'transactional': return <Badge variant="destructive">Transactional</Badge>
      default: return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  // Mock email performance data for charts
  const emailPerformanceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 500) + 200
  }))

  const openRateData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 20) + 40
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Administration</h1>
          <p className="mt-2 text-gray-600">
            Manage email campaigns, templates, and monitor delivery performance.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Email Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(mockMetrics.totalSent)}</p>
                <p className="text-sm text-green-600">+12.5% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(mockMetrics.deliveryRate)}</p>
                <p className="text-sm text-green-600">+0.3% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(mockMetrics.openRate)}</p>
                <p className="text-sm text-yellow-600">-2.1% from last month</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(mockMetrics.clickRate)}</p>
                <p className="text-sm text-green-600">+1.8% from last month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Tabs */}
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCampaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{campaign.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{campaign.subject}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatNumber(campaign.recipients)} recipients</span>
                          <span>{formatPercentage(campaign.openRate)} open rate</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(campaign.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {campaign.sentAt ? formatDate(campaign.sentAt) : 
                           campaign.scheduledAt ? formatDate(campaign.scheduledAt) : 
                           formatDate(campaign.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Email Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Delivery Rate</span>
                    <span>{formatPercentage(mockMetrics.deliveryRate)}</span>
                  </div>
                  <Progress value={mockMetrics.deliveryRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Open Rate</span>
                    <span>{formatPercentage(mockMetrics.openRate)}</span>
                  </div>
                  <Progress value={mockMetrics.openRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Click Rate</span>
                    <span>{formatPercentage(mockMetrics.clickRate)}</span>
                  </div>
                  <Progress value={mockMetrics.clickRate} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Bounce Rate</span>
                    <span>{formatPercentage(mockMetrics.bounceRate)}</span>
                  </div>
                  <Progress value={mockMetrics.bounceRate} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Campaigns</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivery Rate</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-gray-600">{campaign.subject}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{formatNumber(campaign.recipients)}</TableCell>
                      <TableCell>
                        <span className={campaign.deliveryRate >= 95 ? 'text-green-600' : campaign.deliveryRate >= 90 ? 'text-yellow-600' : 'text-red-600'}>
                          {formatPercentage(campaign.deliveryRate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={campaign.openRate >= 25 ? 'text-green-600' : campaign.openRate >= 15 ? 'text-yellow-600' : 'text-red-600'}>
                          {formatPercentage(campaign.openRate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={campaign.clickRate >= 5 ? 'text-green-600' : campaign.clickRate >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                          {formatPercentage(campaign.clickRate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {campaign.sentAt ? formatDate(campaign.sentAt) : 
                         campaign.scheduledAt ? formatDate(campaign.scheduledAt) : 
                         formatDate(campaign.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Templates</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.subject}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTemplateTypeBadge(template.type)}</TableCell>
                      <TableCell>
                        <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(template.usageCount)}</TableCell>
                      <TableCell>
                        {template.lastUsed ? formatDate(template.lastUsed) : 'Never'}
                      </TableCell>
                      <TableCell>{formatDate(template.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Volume (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={emailPerformanceData}
                  type="area"
                  dataKey="value"
                  height={300}
                  color="#3b82f6"
                  formatValue={(value) => `${value.toLocaleString()} emails`}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Open Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={openRateData}
                  type="line"
                  dataKey="value"
                  height={300}
                  color="#10b981"
                  formatValue={(value) => `${value}%`}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Sent</span>
                  <span className="font-medium">{formatNumber(mockMetrics.totalSent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="font-medium">{formatNumber(mockMetrics.totalDelivered)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bounced</span>
                  <span className="font-medium text-red-600">{formatNumber(mockMetrics.totalBounced)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivery Rate</span>
                  <span className="font-medium text-green-600">{formatPercentage(mockMetrics.deliveryRate)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opened</span>
                  <span className="font-medium">{formatNumber(mockMetrics.totalOpened)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clicked</span>
                  <span className="font-medium">{formatNumber(mockMetrics.totalClicked)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Open Rate</span>
                  <span className="font-medium text-blue-600">{formatPercentage(mockMetrics.openRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Click Rate</span>
                  <span className="font-medium text-purple-600">{formatPercentage(mockMetrics.clickRate)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>List Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unsubscribed</span>
                  <span className="font-medium">{formatNumber(mockMetrics.totalUnsubscribed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="font-medium text-red-600">{formatPercentage(mockMetrics.bounceRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unsubscribe Rate</span>
                  <span className="font-medium text-yellow-600">{formatPercentage(mockMetrics.unsubscribeRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">List Growth</span>
                  <span className="font-medium text-green-600">+5.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}