# @nextsaas/admin

Admin dashboard and management system for NextSaaS applications.

## Overview

The `@nextsaas/admin` package provides a comprehensive admin dashboard with user management, system monitoring, analytics, and security features. It's designed specifically for multi-tenant SaaS applications with role-based access control.

## Features

- 🏗️ **Complete Admin Dashboard** - Pre-built dashboard with key metrics
- 👥 **User Management** - Comprehensive user administration interface
- 🏢 **Organization Management** - Multi-tenant organization oversight
- 📊 **Analytics & Reporting** - Real-time metrics and data visualization
- 🔒 **Security Dashboard** - Audit logs, threat monitoring, and security alerts
- ⚙️ **System Health** - Performance monitoring and system status
- 📧 **Email Management** - Campaign monitoring and delivery metrics
- 💰 **Billing Dashboard** - Revenue tracking and subscription management
- 🔐 **Role-Based Access** - Secure admin-only access with audit trails

## Installation

```bash
npm install @nextsaas/admin
```

## Quick Start

### 1. Basic Setup

```tsx
import { AdminLayout, AdminDashboard } from '@nextsaas/admin'

function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
```

### 2. User Management

```tsx
import { UserManagement } from '@nextsaas/admin'

function UsersPage() {
  return <UserManagement />
}
```

### 3. Using Admin Hooks

```tsx
import { useAdminDashboard, useUserManagement } from '@nextsaas/admin'

function CustomAdminComponent() {
  const { data: metrics, loading, error } = useAdminDashboard()
  const { users, fetchUsers, updateUser } = useUserManagement()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Total Users: {metrics.totalUsers}</h1>
      {/* Your custom admin UI */}
    </div>
  )
}
```

## Components

### Layout Components

#### `AdminLayout`
Main layout wrapper for admin pages with sidebar navigation and header.

```tsx
import { AdminLayout } from '@nextsaas/admin'

<AdminLayout>
  {/* Your admin content */}
</AdminLayout>
```

#### `AdminSidebar`
Navigation sidebar with admin menu items.

```tsx
import { AdminSidebar } from '@nextsaas/admin'

<AdminSidebar />
```

#### `AdminHeader`
Header component with user info, notifications, and admin actions.

```tsx
import { AdminHeader } from '@nextsaas/admin'

<AdminHeader />
```

### Dashboard Components

#### `AdminDashboard`
Complete dashboard with metrics overview and charts.

```tsx
import { AdminDashboard } from '@nextsaas/admin'

<AdminDashboard />
```

#### `StatsCard`
Individual metric card component.

```tsx
import { StatsCard } from '@nextsaas/admin'

<StatsCard
  title="Total Users"
  value={15420}
  change={5.2}
  trend="positive"
  icon="users"
/>
```

#### `MetricsOverview`
Grid of key metrics with real-time updates.

```tsx
import { MetricsOverview } from '@nextsaas/admin'

<MetricsOverview />
```

### User Management Components

#### `UserManagement`
Complete user management interface with search, filters, and actions.

```tsx
import { UserManagement } from '@nextsaas/admin'

<UserManagement />
```

#### `UserTable`
Data table for displaying users with pagination and sorting.

```tsx
import { UserTable } from '@nextsaas/admin'

<UserTable
  users={users}
  onUserSelect={handleUserSelect}
  onUserUpdate={handleUserUpdate}
/>
```

#### `UserDetails`
Detailed user profile view with edit capabilities.

```tsx
import { UserDetails } from '@nextsaas/admin'

<UserDetails userId="user-id" />
```

### Analytics Components

#### `AnalyticsDashboard`
Analytics overview with charts and insights.

```tsx
import { AnalyticsDashboard } from '@nextsaas/admin'

<AnalyticsDashboard />
```

#### `UserGrowthChart`
User growth visualization over time.

```tsx
import { UserGrowthChart } from '@nextsaas/admin'

<UserGrowthChart period="30d" />
```

#### `RevenueChart`
Revenue tracking and forecasting charts.

```tsx
import { RevenueChart } from '@nextsaas/admin'

<RevenueChart period="12m" />
```

### Security Components

#### `SecurityDashboard`
Security overview with alerts and monitoring.

```tsx
import { SecurityDashboard } from '@nextsaas/admin'

<SecurityDashboard />
```

#### `AuditLogViewer`
Searchable audit log interface.

```tsx
import { AuditLogViewer } from '@nextsaas/admin'

<AuditLogViewer />
```

#### `ThreatMonitoring`
Real-time threat detection and alerts.

```tsx
import { ThreatMonitoring } from '@nextsaas/admin'

<ThreatMonitoring />
```

## Hooks

### `useAdminDashboard()`
Fetches and manages dashboard metrics data.

```tsx
import { useAdminDashboard } from '@nextsaas/admin'

const {
  data,           // Dashboard metrics
  loading,        // Loading state
  error,          // Error state
  refresh         // Refresh function
} = useAdminDashboard()
```

### `useUserManagement(options?)`
Manages user data with pagination, search, and CRUD operations.

```tsx
import { useUserManagement } from '@nextsaas/admin'

const {
  users,          // User data array
  total,          // Total user count
  loading,        // Loading state
  error,          // Error state
  fetchUsers,     // Fetch users function
  updateUser,     // Update user function
  deleteUser,     // Delete user function
  searchUsers,    // Search function
  filters         // Current filters
} = useUserManagement({
  page: 1,
  limit: 20,
  search: '',
  status: 'active'
})
```

### `useAnalytics(period)`
Provides analytics data for specified time periods.

```tsx
import { useAnalytics } from '@nextsaas/admin'

const {
  metrics,        // Analytics metrics
  charts,         // Chart data
  loading,        // Loading state
  error,          // Error state
  exportData      // Export function
} = useAnalytics('30d')
```

### `useSystemHealth()`
Monitors system health and performance metrics.

```tsx
import { useSystemHealth } from '@nextsaas/admin'

const {
  health,         // System health data
  alerts,         // Active alerts
  loading,        // Loading state
  error           // Error state
} = useSystemHealth()
```

### `useRealTimeMetrics()`
Provides real-time dashboard updates via WebSocket.

```tsx
import { useRealTimeMetrics } from '@nextsaas/admin'

const {
  metrics,        // Real-time metrics
  isConnected,    // Connection status
  reconnect       // Reconnect function
} = useRealTimeMetrics()
```

## Services

### `adminService`
Core admin API service for data operations.

```tsx
import { adminService } from '@nextsaas/admin'

// Get dashboard metrics
const metrics = await adminService.getDashboardMetrics()

// Get users with pagination
const users = await adminService.getUsers({
  page: 1,
  limit: 20,
  search: 'john'
})

// Update user
const updatedUser = await adminService.updateUser(userId, {
  name: 'New Name',
  status: 'active'
})
```

### `analyticsService`
Analytics and reporting service.

```tsx
import { analyticsService } from '@nextsaas/admin'

// Get analytics data
const analytics = await analyticsService.getAnalytics('30d')

// Export analytics data
const exportData = await analyticsService.exportData('csv', {
  period: '30d',
  metrics: ['users', 'revenue']
})
```

## Utilities

### Export Utilities
Functions for exporting admin data in various formats.

```tsx
import { exportToCSV, exportToJSON, exportToExcel } from '@nextsaas/admin'

// Export user data
exportToCSV(users, 'users-export.csv')
exportToJSON(analytics, 'analytics-data.json')
exportToExcel(metrics, 'dashboard-metrics.xlsx')
```

### Filter Utilities
Helper functions for data filtering and search.

```tsx
import { FilterPanel, type FilterConfig } from '@nextsaas/admin'

const filterConfig: FilterConfig = {
  search: { type: 'text', placeholder: 'Search users...' },
  status: { 
    type: 'select', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' }
    ]
  },
  dateRange: { type: 'dateRange' }
}

<FilterPanel
  config={filterConfig}
  values={filters}
  onChange={setFilters}
/>
```

## TypeScript Support

The package includes comprehensive TypeScript definitions for all components, hooks, and services.

```tsx
import type {
  DashboardMetrics,
  UserData,
  AnalyticsData,
  AdminUser,
  SystemHealth,
  AuditLog
} from '@nextsaas/admin'

// Type-safe admin operations
const handleUserUpdate = (user: AdminUser, updates: Partial<UserData>) => {
  // TypeScript will ensure type safety
}
```

## Authentication & Security

### Prerequisites
- User must be authenticated via NextSaaS auth system
- User must have `is_system_admin` flag set to `true`
- All admin actions are automatically logged for audit purposes

### Admin Guard
Protect admin routes with the `AdminGuard` component:

```tsx
import { AdminGuard } from '@nextsaas/admin'

function AdminApp() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  )
}
```

### Permissions
The package automatically handles admin permission checks:
- API calls include admin authorization
- Components show appropriate states for unauthorized access
- Audit logging is handled transparently

## Customization

### Theming
Admin components support custom theming via CSS variables:

```css
:root {
  --admin-primary-color: #3b82f6;
  --admin-secondary-color: #64748b;
  --admin-background-color: #f8fafc;
  --admin-card-background: #ffffff;
  --admin-border-color: #e2e8f0;
}
```

### Custom Components
Extend or replace default components:

```tsx
import { AdminLayout } from '@nextsaas/admin'

function CustomAdminLayout({ children }) {
  return (
    <AdminLayout
      sidebar={<CustomSidebar />}
      header={<CustomHeader />}
    >
      {children}
    </AdminLayout>
  )
}
```

## API Integration

The package works seamlessly with NextSaaS admin API endpoints:

- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/users` - User management
- `POST /api/admin/users` - User creation
- Additional endpoints documented in [Admin API Reference](../../docs/admin-api-reference.md)

## Performance

- **Lazy Loading**: Components are code-split for optimal loading
- **Virtual Scrolling**: Large datasets use virtual scrolling
- **Caching**: API responses are cached with React Query
- **Real-time Updates**: WebSocket integration for live data
- **Optimistic Updates**: UI updates optimistically for better UX

## Testing

The package includes comprehensive test utilities:

```tsx
import { renderWithAdminProviders, mockAdminData } from '@nextsaas/admin/testing'

test('admin dashboard renders correctly', () => {
  const { getByText } = renderWithAdminProviders(
    <AdminDashboard />,
    { 
      initialData: mockAdminData.dashboard 
    }
  )
  
  expect(getByText('Total Users')).toBeInTheDocument()
})
```

## Examples

### Complete Admin Page

```tsx
'use client'

import { 
  AdminLayout, 
  AdminDashboard, 
  useAdminDashboard 
} from '@nextsaas/admin'

export default function AdminPage() {
  const { data, loading, error } = useAdminDashboard()

  if (loading) return <div>Loading admin dashboard...</div>
  if (error) return <div>Error loading dashboard</div>

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
```

### Custom User Management

```tsx
'use client'

import { 
  UserManagement, 
  useUserManagement,
  exportToCSV 
} from '@nextsaas/admin'

export default function UsersPage() {
  const { users, loading, error, fetchUsers } = useUserManagement()

  const handleExport = () => {
    exportToCSV(users, 'users-export.csv')
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1>User Management</h1>
        <button onClick={handleExport}>
          Export Users
        </button>
      </div>
      <UserManagement />
    </div>
  )
}
```

## Related Documentation

- [Admin Setup Guide](../../docs/admin-setup-guide.md) - Complete setup instructions
- [Admin API Reference](../../docs/admin-api-reference.md) - API endpoint documentation
- [Admin User Guide](../../docs/admin-user-guide.md) - Dashboard usage guide
- [Admin Security](../../ADMIN_SECURITY.md) - Security architecture and best practices

## Contributing

When contributing to the admin package:

1. Follow the established component patterns
2. Add TypeScript types for all new features
3. Include comprehensive tests
4. Update documentation for new features
5. Ensure all admin actions are properly logged

## License

MIT - See LICENSE file for details.