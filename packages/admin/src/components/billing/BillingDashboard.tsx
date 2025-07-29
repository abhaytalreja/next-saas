'use client'

import React, { useState } from 'react'
import { CreditCard, DollarSign, Users, TrendingUp, TrendingDown, Eye, Edit, Download, RefreshCw, AlertTriangle } from 'lucide-react'
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
  Progress,
  Alert,
  AlertDescription
} from '@nextsaas/ui'
import { AnalyticsChart } from '../analytics/AnalyticsChart'

interface Subscription {
  id: string
  organizationId: string
  organizationName: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'
  billingCycle: 'monthly' | 'yearly'
  amount: number
  currency: string
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEnd?: string
  canceledAt?: string
  createdAt: string
  lastPayment?: string
  nextPayment?: string
  paymentMethod?: string
}

interface Invoice {
  id: string
  organizationId: string
  organizationName: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'draft'
  issueDate: string
  dueDate: string
  paidAt?: string
  description: string
  lineItems: InvoiceLineItem[]
}

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface BillingMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  totalSubscriptions: number
  activeSubscriptions: number
  trialingSubscriptions: number
  canceledSubscriptions: number
  revenueGrowthRate: number
  customerLifetimeValue: number
}

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_1',
    organizationId: 'org_1',
    organizationName: 'Acme Corporation',
    plan: 'enterprise',
    status: 'active',
    billingCycle: 'yearly',
    amount: 99900, // $999.00 in cents
    currency: 'USD',
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2025-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    lastPayment: '2024-01-01T00:00:00Z',
    nextPayment: '2025-01-01T00:00:00Z',
    paymentMethod: 'card_****4242'
  },
  {
    id: 'sub_2',
    organizationId: 'org_2',
    organizationName: 'StartupCo',
    plan: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    amount: 4900, // $49.00 in cents
    currency: 'USD',
    currentPeriodStart: '2024-01-15T00:00:00Z',
    currentPeriodEnd: '2024-02-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    lastPayment: '2024-01-15T00:00:00Z',
    nextPayment: '2024-02-15T00:00:00Z',
    paymentMethod: 'card_****1234'
  },
  {
    id: 'sub_3',
    organizationId: 'org_3',
    organizationName: 'TechCompany LLC',
    plan: 'starter',
    status: 'past_due',
    billingCycle: 'monthly',
    amount: 1900, // $19.00 in cents
    currency: 'USD',
    currentPeriodStart: '2024-01-10T00:00:00Z',
    currentPeriodEnd: '2024-02-10T00:00:00Z',
    createdAt: '2024-01-10T00:00:00Z',
    paymentMethod: 'card_****5678'
  },
  {
    id: 'sub_4',
    organizationId: 'org_4',
    organizationName: 'TrialUser Inc',
    plan: 'pro',
    status: 'trialing',
    billingCycle: 'monthly',
    amount: 4900,
    currency: 'USD',
    currentPeriodStart: '2024-01-20T00:00:00Z',
    currentPeriodEnd: '2024-02-20T00:00:00Z',
    trialEnd: '2024-02-03T00:00:00Z',
    createdAt: '2024-01-20T00:00:00Z'
  }
]

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    organizationId: 'org_1',
    organizationName: 'Acme Corporation',
    subscriptionId: 'sub_1',
    amount: 99900,
    currency: 'USD',
    status: 'paid',
    issueDate: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-01T00:00:00Z',
    paidAt: '2024-01-01T00:00:00Z',
    description: 'Enterprise Plan - Annual',
    lineItems: [
      {
        id: 'li_1',
        description: 'Enterprise Plan (Annual)',
        quantity: 1,
        unitPrice: 99900,
        amount: 99900
      }
    ]
  },
  {
    id: 'inv_2',
    organizationId: 'org_2',
    organizationName: 'StartupCo',
    subscriptionId: 'sub_2',
    amount: 4900,
    currency: 'USD',
    status: 'paid',
    issueDate: '2024-01-15T00:00:00Z',
    dueDate: '2024-01-15T00:00:00Z',
    paidAt: '2024-01-15T00:00:00Z',
    description: 'Pro Plan - Monthly',
    lineItems: [
      {
        id: 'li_2',
        description: 'Pro Plan (Monthly)',
        quantity: 1,
        unitPrice: 4900,
        amount: 4900
      }
    ]
  },
  {
    id: 'inv_3',
    organizationId: 'org_3',
    organizationName: 'TechCompany LLC',
    subscriptionId: 'sub_3',
    amount: 1900,
    currency: 'USD',
    status: 'failed',
    issueDate: '2024-01-10T00:00:00Z',
    dueDate: '2024-01-10T00:00:00Z',
    description: 'Starter Plan - Monthly',
    lineItems: [
      {
        id: 'li_3',
        description: 'Starter Plan (Monthly)',
        quantity: 1,
        unitPrice: 1900,
        amount: 1900
      }
    ]
  }
]

const mockMetrics: BillingMetrics = {
  totalRevenue: 1547800, // $15,478.00 in cents
  monthlyRecurringRevenue: 125600, // $1,256.00 in cents
  averageRevenuePerUser: 4800, // $48.00 in cents
  churnRate: 2.1,
  totalSubscriptions: 156,
  activeSubscriptions: 142,
  trialingSubscriptions: 8,
  canceledSubscriptions: 6,
  revenueGrowthRate: 12.5,
  customerLifetimeValue: 125000 // $1,250.00 in cents
}

export function BillingDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    console.log('Exporting billing data...')
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active': return <Badge variant="default">Active</Badge>
      case 'trialing': return <Badge variant="secondary">Trial</Badge>
      case 'past_due': return <Badge variant="destructive">Past Due</Badge>
      case 'canceled': return <Badge variant="outline">Canceled</Badge>
      case 'paused': return <Badge variant="outline">Paused</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <Badge variant="default">Paid</Badge>
      case 'pending': return <Badge variant="secondary">Pending</Badge>
      case 'failed': return <Badge variant="destructive">Failed</Badge>
      case 'draft': return <Badge variant="outline">Draft</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: Subscription['plan']) => {
    switch (plan) {
      case 'free': return <Badge variant="outline">Free</Badge>
      case 'starter': return <Badge variant="secondary">Starter</Badge>
      case 'pro': return <Badge variant="default">Pro</Badge>
      case 'enterprise': return <Badge variant="destructive">Enterprise</Badge>
      default: return <Badge variant="outline">{plan}</Badge>
    }
  }

  // Mock revenue trend data
  const revenueData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2024, i, 1).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 50000) + 100000
  }))

  const subscriptionData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2024, i, 1).toISOString().split('T')[0],
    value: Math.floor(Math.random() * 20) + 120
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Administration</h1>
          <p className="mt-2 text-gray-600">
            Manage subscriptions, invoices, and monitor revenue performance.
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
        </div>
      </div>

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockMetrics.totalRevenue)}</p>
                <p className="text-sm text-green-600">+{mockMetrics.revenueGrowthRate}% growth</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockMetrics.monthlyRecurringRevenue)}</p>
                <p className="text-sm text-green-600">+8.2% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{mockMetrics.activeSubscriptions}</p>
                <p className="text-sm text-green-600">+{mockMetrics.activeSubscriptions - mockMetrics.canceledSubscriptions} this month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockMetrics.churnRate}%</p>\n                <p className="text-sm text-red-600">-0.3% improvement</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for important billing issues */}
      {mockSubscriptions.some(sub => sub.status === 'past_due') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {mockSubscriptions.filter(sub => sub.status === 'past_due').length} subscription(s) are past due and require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Billing Tabs */}
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Active</span>
                    <span>{mockMetrics.activeSubscriptions} ({((mockMetrics.activeSubscriptions / mockMetrics.totalSubscriptions) * 100).toFixed(1)}%)</span>
                  </div>
                  <Progress value={(mockMetrics.activeSubscriptions / mockMetrics.totalSubscriptions) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Trialing</span>
                    <span>{mockMetrics.trialingSubscriptions} ({((mockMetrics.trialingSubscriptions / mockMetrics.totalSubscriptions) * 100).toFixed(1)}%)</span>
                  </div>
                  <Progress value={(mockMetrics.trialingSubscriptions / mockMetrics.totalSubscriptions) * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Canceled</span>
                    <span>{mockMetrics.canceledSubscriptions} ({((mockMetrics.canceledSubscriptions / mockMetrics.totalSubscriptions) * 100).toFixed(1)}%)</span>
                  </div>
                  <Progress value={(mockMetrics.canceledSubscriptions / mockMetrics.totalSubscriptions) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Revenue Per User</span>
                  <span className="font-medium">{formatCurrency(mockMetrics.averageRevenuePerUser)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                  <span className="font-medium">{formatCurrency(mockMetrics.customerLifetimeValue)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue Growth Rate</span>
                  <span className="font-medium text-green-600">+{mockMetrics.revenueGrowthRate}%</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className="font-medium text-red-600">{mockMetrics.churnRate}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subscription.organizationName}</div>
                          <div className="text-sm text-gray-600">{subscription.organizationId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(subscription.plan)}</TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                      <TableCell className="capitalize">{subscription.billingCycle}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(subscription.currentPeriodStart)}</div>
                          <div className="text-gray-500">to {formatDate(subscription.currentPeriodEnd)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
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
        
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.organizationName}</div>
                          <div className="text-sm text-gray-600">{invoice.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
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
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={revenueData}
                  type="area"
                  dataKey="value"
                  height={300}
                  color="#10b981"
                  formatValue={(value) => formatCurrency(value)}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={subscriptionData}
                  type="line"
                  dataKey="value"
                  height={300}
                  color="#3b82f6"
                  formatValue={(value) => `${value} subscriptions`}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Enterprise</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">65%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pro</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Starter</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}