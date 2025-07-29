# Admin Dashboard User Guide

This guide covers how to use the NextSaaS admin dashboard to manage users, monitor system health, and perform administrative tasks.

## Getting Started

### Accessing the Admin Dashboard

1. **Sign in** to your NextSaaS application with an admin account
2. **Navigate** to `/admin` in your browser
3. You'll be redirected to the main admin dashboard

> **Note**: Only users with system administrator privileges can access the admin dashboard.

### Dashboard Overview

The admin dashboard provides a comprehensive view of your SaaS application with key metrics and management tools.

## Main Dashboard

### Key Metrics Cards

The dashboard displays real-time metrics across four main categories:

#### 👥 User Metrics
- **Total Users**: Complete count of registered users
- **Active Users**: Users who've logged in within the last 7 days
- **New Users Today**: New registrations in the current day
- **User Growth Rate**: Percentage growth over the previous period
- **User Retention Rate**: Percentage of users returning within 30 days

#### 🏢 Organization Metrics
- **Total Organizations**: Count of all organizations
- **Active Organizations**: Organizations with recent activity
- **New Organizations Today**: Organizations created today
- **Organization Growth Rate**: Growth percentage over time

#### 💰 Revenue Metrics
- **Monthly Recurring Revenue (MRR)**: Current MRR
- **Total Revenue**: Cumulative revenue
- **Average Revenue Per User (ARPU)**: Revenue divided by user count
- **Revenue Growth Rate**: Monthly revenue growth percentage
- **Churn Rate**: Percentage of customers canceling subscriptions

#### ⚙️ System Metrics
- **System Uptime**: Percentage uptime over the last 30 days
- **API Response Time**: Average API response time in milliseconds
- **Error Rate**: Percentage of requests resulting in errors
- **Active Connections**: Current number of active connections

#### 📧 Email Metrics
- **Emails Sent Today**: Count of emails sent in the current day
- **Email Delivery Rate**: Percentage of successfully delivered emails
- **Active Campaigns**: Number of running email campaigns
- **Subscriber Count**: Total email subscribers

### Recent Activity Feed

The dashboard shows the latest user and system activities:
- User registrations and profile updates
- Organization changes
- System events and errors
- Administrative actions

## User Management

### Accessing User Management

1. Click **"Users"** in the admin sidebar
2. Or navigate to `/admin/users`

### User List View

The user management interface provides:

#### Search and Filtering
- **Search Bar**: Search by name or email address
- **Status Filter**: Filter by user status (Active, Pending, Suspended)
- **Date Range**: Filter by registration date
- **Organization Filter**: Filter by organization membership

#### User Table Columns
- **Avatar & Name**: Profile picture and full name
- **Email**: User's email address with verification status
- **Status**: Current account status
- **Organizations**: Organizations the user belongs to
- **Role**: User's role within organizations
- **Last Seen**: Last login or activity timestamp
- **Actions**: Quick action buttons

#### Sorting Options
Click column headers to sort by:
- Name (A-Z or Z-A)
- Email address
- Registration date
- Last activity
- Status

#### Pagination
- **Items per page**: 10, 20, 50, or 100 users
- **Navigation**: Previous/Next buttons and page numbers
- **Total count**: Shows total filtered results

### User Actions

#### Individual User Actions
For each user, you can:

1. **View Details**: Click on a user to see their full profile
2. **Edit Profile**: Modify user information
3. **Reset Password**: Send password reset email
4. **Suspend Account**: Temporarily disable user access
5. **Delete Account**: Permanently remove user (with confirmation)
6. **View Organizations**: See all organizations user belongs to
7. **Audit Trail**: View user's activity history

#### Bulk Actions
Select multiple users to:
- **Export Selected**: Download user data as CSV
- **Send Email**: Send bulk email to selected users
- **Change Status**: Bulk status updates
- **Assign to Organization**: Bulk organization assignment

### User Details View

#### Profile Information
- Personal details (name, email, phone)
- Account status and verification status
- Registration date and last activity
- Profile picture and preferences

#### Organization Memberships
- List of organizations user belongs to
- Role within each organization
- Join date and status for each membership
- Quick actions to modify memberships

#### Activity Timeline
- Login history with IP addresses
- Profile changes and updates
- Organization activities
- Admin actions performed on the account

#### Security Information
- Password last changed
- Two-factor authentication status
- Active sessions and devices
- Security alerts and notifications

## Organization Management

### Organization Overview

Access organization management through the admin sidebar to:
- View all organizations in the system
- Monitor organization health and activity
- Manage organization settings and members
- Track subscription and billing information

### Organization List
- **Search**: Find organizations by name or domain
- **Filter**: Filter by subscription status, size, or activity
- **Sort**: Sort by name, creation date, or member count
- **Export**: Download organization data

### Organization Details
For each organization, view:
- **Basic Information**: Name, description, contact details
- **Member Management**: Add, remove, or modify member roles
- **Subscription Details**: Plan type, billing status, usage metrics
- **Activity Feed**: Recent organization activities
- **Settings**: Organization-specific configurations

## Analytics Dashboard

### Accessing Analytics

Navigate to the analytics section to view:
- **User Growth Charts**: Visual representation of user acquisition
- **Revenue Analytics**: Revenue trends and forecasting
- **Engagement Metrics**: User activity and feature usage
- **Conversion Funnels**: Signup and conversion tracking

### Chart Types
- **Line Charts**: Trends over time
- **Bar Charts**: Comparative data
- **Pie Charts**: Distribution metrics
- **Heat Maps**: Activity patterns

### Time Periods
Select different time ranges:
- Last 7 days
- Last 30 days
- Last 3 months
- Last 12 months
- Custom date range

### Export Options
- **PNG**: Download chart images
- **CSV**: Export raw data
- **PDF**: Generate analytics reports

## Security Dashboard

### Security Overview

Monitor your application's security through:
- **Threat Alerts**: Real-time security notifications
- **Failed Login Attempts**: Monitor suspicious login activity
- **Unusual Activities**: Detect anomalous user behavior
- **System Vulnerabilities**: Security recommendations

### Audit Logs

The audit log tracks all administrative actions:
- **User Actions**: Account modifications, role changes
- **System Events**: Configuration changes, security events
- **Data Access**: Sensitive data access and exports
- **Filter Options**: By user, date range, action type, or severity

### Security Alerts

Review and manage security alerts:
- **High Priority**: Immediate attention required
- **Medium Priority**: Should be addressed soon
- **Low Priority**: Informational or minor issues
- **Resolved**: Previously addressed alerts

## System Health

### System Monitoring

Monitor your application's health through:
- **Performance Metrics**: Response times, throughput, errors
- **Database Status**: Connection health, query performance
- **API Health**: Endpoint availability and response times
- **Resource Usage**: CPU, memory, and storage utilization

### Health Checks
- **Database Connectivity**: Connection status and response time
- **External Services**: Third-party API health
- **Background Jobs**: Queue status and processing times
- **Storage Systems**: File storage and CDN health

### Alerts and Notifications
Set up alerts for:
- **Performance degradation**: When metrics exceed thresholds
- **Service outages**: When critical services become unavailable
- **Error rate spikes**: When error rates increase significantly
- **Resource limits**: When approaching capacity limits

## Data Export

### Export Options

Most admin views support data export:

#### CSV Export
- **User Data**: Complete user profiles and activity
- **Organization Data**: Organization details and metrics
- **Analytics Data**: Chart data and metrics
- **Audit Logs**: Security and activity logs

#### JSON Export
- **Raw Data**: Complete data structures
- **API Format**: Data in API-compatible format
- **Filtered Data**: Only currently filtered/visible data

#### Excel Export
- **Formatted Sheets**: Professional spreadsheet format
- **Multiple Tabs**: Organized data across worksheets
- **Charts Included**: Visual representations included

### Export Process

1. **Select Data**: Choose what to export using filters
2. **Choose Format**: Select CSV, JSON, or Excel
3. **Configure Options**: Set date ranges and fields
4. **Download**: File will be generated and downloaded

### Scheduled Exports

Set up automated exports:
- **Daily Reports**: Automated daily metrics reports
- **Weekly Summaries**: Weekly analytics and activity summaries
- **Monthly Reports**: Comprehensive monthly reports
- **Custom Schedules**: Set up custom export schedules

## Settings and Configuration

### Admin Settings

Configure admin dashboard behavior:
- **Dashboard Refresh**: Auto-refresh intervals
- **Notification Preferences**: Email and in-app notifications
- **Time Zone**: Display timezone for dates and times
- **Date Format**: Preferred date and time formats

### User Defaults
- **Default User Status**: Default status for new users
- **Default Organization Role**: Default role assignment
- **Password Requirements**: Password complexity rules
- **Email Verification**: Require email verification for new users

### System Configuration
- **Session Timeout**: Admin session timeout duration
- **Audit Log Retention**: How long to keep audit logs
- **Export Limits**: Maximum records per export
- **Rate Limiting**: API rate limits for admin endpoints

## Best Practices

### Security Best Practices

1. **Regular Monitoring**: Check the admin dashboard daily
2. **Audit Log Review**: Regularly review audit logs for unusual activity
3. **User Access Review**: Periodically review user permissions
4. **Security Alerts**: Respond promptly to security alerts

### Performance Best Practices

1. **Filter Large Datasets**: Use filters when working with large user lists
2. **Batch Operations**: Use bulk actions for multiple user updates
3. **Regular Exports**: Export data regularly for backup purposes
4. **Monitor System Health**: Keep an eye on performance metrics

### Data Management

1. **Regular Cleanup**: Remove inactive or test accounts periodically
2. **Data Accuracy**: Verify user information is accurate and up-to-date
3. **Privacy Compliance**: Ensure data handling complies with regulations
4. **Backup Verification**: Regularly verify data export functionality

## Troubleshooting

### Common Issues

#### Can't Access Admin Dashboard
- Verify you have system administrator privileges
- Check if you're signed in with the correct account
- Clear browser cache and cookies
- Contact your system administrator

#### Data Not Loading
- Check your internet connection
- Refresh the page
- Check system health dashboard for issues
- Try accessing from a different browser

#### Export Not Working
- Check your browser's download settings
- Verify you have permissions to export data
- Try a smaller data set
- Check if popup blockers are interfering

#### Performance Issues
- Use filters to reduce data load
- Clear browser cache
- Check system health metrics
- Contact technical support if issues persist

## Keyboard Shortcuts

Speed up your admin tasks with keyboard shortcuts:

- **Ctrl/Cmd + K**: Open global search
- **Ctrl/Cmd + E**: Export current view
- **Ctrl/Cmd + R**: Refresh current data
- **Ctrl/Cmd + F**: Open filter panel
- **ESC**: Close modal dialogs
- **Tab**: Navigate between form fields
- **Enter**: Submit forms or confirm actions

## Getting Help

### Support Resources

1. **Documentation**: Refer to the complete admin documentation
2. **API Reference**: Check the [Admin API Reference](./admin-api-reference.md)
3. **Setup Guide**: Review the [Admin Setup Guide](./admin-setup-guide.md)
4. **Security Documentation**: See [Admin Security](../ADMIN_SECURITY.md)

### Contact Support

If you need additional help:
- Check the troubleshooting section first
- Contact your system administrator
- Submit a support ticket through your organization
- Review the project documentation and FAQ

---

**💡 Tip**: The admin dashboard is designed to be intuitive. Most actions include confirmation dialogs and can be undone if needed. Don't hesitate to explore and familiarize yourself with all available features.