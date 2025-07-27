export interface EmailAnalytics {
  organizationId: string;
  period: AnalyticsPeriod;
  delivery: DeliveryMetrics;
  engagement: EngagementMetrics;
  performance: PerformanceMetrics;
  revenue?: RevenueMetrics;
  trends: TrendData[];
  comparisons?: ComparisonData;
  segments?: SegmentAnalytics[];
  campaigns?: CampaignPerformance[];
  providers?: ProviderPerformance[];
}

export interface DeliveryMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  rejected: number;
  deferred: number;
  rates: {
    delivery: number;
    bounce: number;
    rejection: number;
  };
  bounceBreakdown: {
    hard: number;
    soft: number;
    technical: number;
    reputation: number;
  };
  topBounceReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export interface EngagementMetrics {
  opened: number;
  clicked: number;
  unsubscribed: number;
  complained: number;
  forwarded?: number;
  rates: {
    open: number;
    click: number;
    clickToOpen: number;
    unsubscribe: number;
    complaint: number;
  };
  uniqueEngagement: {
    uniqueOpens: number;
    uniqueClicks: number;
    uniqueUnsubscribes: number;
  };
  engagementTiming: {
    avgTimeToOpen: number; // minutes
    avgTimeToClick: number; // minutes
    peakEngagementHour: number;
    peakEngagementDay: string;
  };
  linkPerformance: Array<{
    url: string;
    clicks: number;
    uniqueClicks: number;
    clickRate: number;
  }>;
  deviceBreakdown: {
    desktop: DeviceMetrics;
    mobile: DeviceMetrics;
    tablet: DeviceMetrics;
    unknown: DeviceMetrics;
  };
  clientBreakdown: Record<string, ClientMetrics>;
  geographyBreakdown: Record<string, GeographyMetrics>;
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    emailsPerMinute: number;
    emailsPerHour: number;
    emailsPerDay: number;
  };
  errorRate: number;
  successRate: number;
  retryRate: number;
  queueDepth: number;
  processingTime: {
    avg: number;
    max: number;
    min: number;
  };
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenuePerEmail: number;
  revenuePerRecipient: number;
  conversions: number;
  conversionRate: number;
  attributedRevenue: number;
  revenueBySource: Record<string, number>;
  conversionFunnel: Array<{
    stage: string;
    count: number;
    conversionRate: number;
  }>;
  ltv: {
    avgLifetimeValue: number;
    totalLtv: number;
  };
}

export interface TrendData {
  date: Date;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  revenue?: number;
}

export interface ComparisonData {
  previousPeriod: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    revenue?: number;
  };
  changes: {
    sent: PercentageChange;
    delivered: PercentageChange;
    opened: PercentageChange;
    clicked: PercentageChange;
    bounced: PercentageChange;
    unsubscribed: PercentageChange;
    revenue?: PercentageChange;
  };
  industry?: {
    averages: IndustryAverages;
    percentile: number;
  };
}

export interface SegmentAnalytics {
  segmentId: string;
  segmentName: string;
  size: number;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    revenue?: number;
  };
  performance: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    conversionRate?: number;
  };
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  type: string;
  sentAt: Date;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    revenue?: number;
  };
  rates: {
    delivery: number;
    open: number;
    click: number;
    unsubscribe: number;
    conversion?: number;
  };
  roi?: number;
}

export interface ProviderPerformance {
  provider: string;
  metrics: {
    sent: number;
    delivered: number;
    bounced: number;
    responseTime: number;
    errorRate: number;
    cost: number;
  };
  reliability: number;
  reputation: number;
  costEfficiency: number;
}

export interface DeviceMetrics {
  count: number;
  percentage: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
}

export interface ClientMetrics {
  count: number;
  percentage: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
  version?: string;
}

export interface GeographyMetrics {
  count: number;
  percentage: number;
  opens: number;
  clicks: number;
  openRate: number;
  clickRate: number;
  revenue?: number;
}

export interface PercentageChange {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface IndustryAverages {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  complaintRate: number;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  campaigns?: string[];
  segments?: string[];
  providers?: string[];
  emailTypes?: string[];
  geography?: string[];
  devices?: string[];
  clients?: string[];
}

export interface AnalyticsExport {
  id: string;
  organizationId: string;
  type: 'csv' | 'xlsx' | 'pdf' | 'json';
  filters: AnalyticsFilter;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  fileSize?: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface RealTimeMetrics {
  timestamp: Date;
  currentlySending: number;
  queueDepth: number;
  recentActivity: Array<{
    timestamp: Date;
    event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
    count: number;
  }>;
  providerStatus: Record<string, {
    healthy: boolean;
    responseTime: number;
    throughput: number;
  }>;
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
}

export interface AnalyticsDashboard {
  organizationId: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: AnalyticsFilter;
  refreshInterval?: number; // seconds
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: WidgetConfig;
  data?: any;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

export interface WidgetConfig {
  metric: string;
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  period?: AnalyticsPeriod;
  groupBy?: string;
  filters?: Record<string, any>;
  displayOptions?: {
    showLegend?: boolean;
    showLabels?: boolean;
    colorScheme?: string;
  };
}

export type AnalyticsPeriod = 
  | 'last_hour'
  | 'last_24_hours'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_year'
  | 'custom';

export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'heatmap'
  | 'funnel'
  | 'gauge'
  | 'progress'
  | 'list';