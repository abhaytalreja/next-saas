import { analyticsService } from '../analytics-service';

// Mock Supabase client
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({
              data: [
                { date: '2024-01-01', count: 100 },
                { date: '2024-01-02', count: 120 },
              ],
              error: null,
            })),
          })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ 
      data: [{ date: '2024-01-01', value: 100 }], 
      error: null 
    })),
  }),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserGrowth', () => {
    it('calculates user growth over time', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const growth = await analyticsService.getUserGrowth(dateRange);

      expect(growth).toHaveLength(2);
      expect(growth[0].date).toBe('2024-01-01');
      expect(growth[0].value).toBe(100);
    });

    it('handles empty data', async () => {
      // Mock empty response
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.from().select().gte().lte().order.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const growth = await analyticsService.getUserGrowth(dateRange);

      expect(growth).toHaveLength(0);
    });

    it('handles database errors', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.from().select().gte().lte().order.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      await expect(analyticsService.getUserGrowth(dateRange)).rejects.toThrow('Database error');
    });
  });

  describe('getRevenueGrowth', () => {
    it('calculates revenue growth over time', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: [
          { date: '2024-01-01', revenue: 5000 },
          { date: '2024-01-02', revenue: 5500 },
        ],
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const revenue = await analyticsService.getRevenueGrowth(dateRange);

      expect(revenue).toHaveLength(2);
      expect(revenue[0].revenue).toBe(5000);
    });
  });

  describe('getConversionRate', () => {
    it('calculates conversion rate', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc
        .mockResolvedValueOnce({ data: 1000, error: null }) // Total visitors
        .mockResolvedValueOnce({ data: 50, error: null }); // Conversions

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const rate = await analyticsService.getConversionRate(dateRange);

      expect(rate).toBe(5); // 50/1000 * 100
    });

    it('handles zero visitors', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: 0, error: null });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const rate = await analyticsService.getConversionRate(dateRange);

      expect(rate).toBe(0);
    });
  });

  describe('getRetentionRate', () => {
    it('calculates user retention rate', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: { retained: 850, total: 1000 },
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const retention = await analyticsService.getRetentionRate(dateRange);

      expect(retention).toBe(85); // 850/1000 * 100
    });
  });

  describe('getEngagementMetrics', () => {
    it('calculates engagement metrics', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: {
          averageSessionDuration: 750, // seconds
          pageViewsPerSession: 3.5,
          bounceRate: 25.8,
        },
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const metrics = await analyticsService.getEngagementMetrics(dateRange);

      expect(metrics.averageSessionDuration).toBe(12.5); // 750/60 minutes
      expect(metrics.pageViewsPerSession).toBe(3.5);
      expect(metrics.bounceRate).toBe(25.8);
    });
  });

  describe('getTopPages', () => {
    it('returns most visited pages', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.from().select().gte().lte().order.mockResolvedValueOnce({
        data: [
          { path: '/dashboard', views: 5000, unique_visitors: 1200 },
          { path: '/profile', views: 3000, unique_visitors: 800 },
          { path: '/settings', views: 1500, unique_visitors: 400 },
        ],
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const pages = await analyticsService.getTopPages(dateRange, 10);

      expect(pages).toHaveLength(3);
      expect(pages[0].path).toBe('/dashboard');
      expect(pages[0].views).toBe(5000);
    });
  });

  describe('getRevenueByPlan', () => {
    it('calculates revenue breakdown by subscription plan', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: [
          { plan: 'Pro', revenue: 25000, customers: 500 },
          { plan: 'Enterprise', revenue: 45000, customers: 150 },
          { plan: 'Basic', revenue: 8000, customers: 800 },
        ],
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const revenue = await analyticsService.getRevenueByPlan(dateRange);

      expect(revenue).toHaveLength(3);
      expect(revenue[0].plan).toBe('Pro');
      expect(revenue[0].revenue).toBe(25000);
      expect(revenue[0].customers).toBe(500);
    });
  });

  describe('getUsersByRegion', () => {
    it('returns user distribution by geographic region', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.from().select().gte().lte().order.mockResolvedValueOnce({
        data: [
          { region: 'US', users: 2500, percentage: 45.5 },
          { region: 'EU', users: 1800, percentage: 32.7 },
          { region: 'APAC', users: 1200, percentage: 21.8 },
        ],
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const regions = await analyticsService.getUsersByRegion(dateRange);

      expect(regions).toHaveLength(3);
      expect(regions[0].region).toBe('US');
      expect(regions[0].users).toBe(2500);
    });
  });

  describe('getChurnRate', () => {
    it('calculates customer churn rate', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: { churned: 25, total: 1000 },
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const churn = await analyticsService.getChurnRate(dateRange);

      expect(churn).toBe(2.5); // 25/1000 * 100
    });

    it('handles zero customers', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: { churned: 0, total: 0 },
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const churn = await analyticsService.getChurnRate(dateRange);

      expect(churn).toBe(0);
    });
  });

  describe('error handling', () => {
    it('throws error on database failure', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Connection failed' },
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      await expect(analyticsService.getConversionRate(dateRange)).rejects.toThrow('Connection failed');
    });

    it('handles null data gracefully', async () => {
      const supabase = require('@nextsaas/supabase').getSupabaseBrowserClient();
      supabase.rpc.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      const rate = await analyticsService.getConversionRate(dateRange);

      expect(rate).toBe(0);
    });
  });

  describe('date range validation', () => {
    it('validates date range parameters', () => {
      const invalidRange = {
        start: new Date('2024-01-31'),
        end: new Date('2024-01-01'), // End before start
      };

      expect(() => analyticsService.validateDateRange(invalidRange)).toThrow('Invalid date range');
    });

    it('accepts valid date range', () => {
      const validRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };

      expect(() => analyticsService.validateDateRange(validRange)).not.toThrow();
    });
  });
});