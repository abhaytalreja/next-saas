import { adminService } from '../admin-service';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock Supabase client
jest.mock('@nextsaas/supabase', () => ({
  getSupabaseBrowserClient: () => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ 
            data: [{ id: '1', name: 'Test' }], 
            error: null 
          })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: { count: 100 }, error: null })),
  }),
}));

describe('AdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('getDashboardMetrics', () => {
    it('fetches dashboard metrics successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalUsers: 1250,
          activeUsers: 890,
          totalOrganizations: 156,
          monthlyRecurringRevenue: 45780,
        }),
      } as Response);

      const metrics = await adminService.getDashboardMetrics();

      expect(metrics.totalUsers).toBe(1250);
      expect(metrics.activeUsers).toBe(890);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/dashboard');
    });

    it('handles API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('API Error');
    });

    it('handles non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(adminService.getDashboardMetrics()).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('fetches users with pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: '1', email: 'user1@test.com', name: 'User 1' },
            { id: '2', email: 'user2@test.com', name: 'User 2' },
          ],
          metadata: { total: 2, page: 1, totalPages: 1 },
        }),
      } as Response);

      const filters = { search: '', role: '', status: '' };
      const pagination = { page: 1, limit: 10 };
      
      const result = await adminService.getUsers(filters, pagination);

      expect(result.data).toHaveLength(2);
      expect(result.metadata.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users?page=1&limit=10&search=&role=&status='
      );
    });

    it('applies filters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], metadata: {} }),
      } as Response);

      const filters = { search: 'john', role: 'admin', status: 'active' };
      const pagination = { page: 1, limit: 10 };
      
      await adminService.getUsers(filters, pagination);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users?page=1&limit=10&search=john&role=admin&status=active'
      );
    });
  });

  describe('getOrganizations', () => {
    it('fetches organizations successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: '1', name: 'Org 1', mode: 'multi' },
            { id: '2', name: 'Org 2', mode: 'single' },
          ],
          metadata: { total: 2 },
        }),
      } as Response);

      const filters = { search: '', mode: '', status: '' };
      const pagination = { page: 1, limit: 10 };
      
      const result = await adminService.getOrganizations(filters, pagination);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Org 1');
    });
  });

  describe('updateUserStatus', () => {
    it('updates user status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await adminService.updateUserStatus('1', 'suspended');

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' }),
      });
    });
  });

  describe('bulkUpdateUsers', () => {
    it('performs bulk user operations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, updated: 2 }),
      } as Response);

      const userIds = ['1', '2'];
      await adminService.bulkUpdateUsers(userIds, 'suspend');

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend', userIds }),
      });
    });
  });

  describe('exportUsers', () => {
    it('exports user data as CSV', async () => {
      const csvData = 'id,name,email\n1,John,john@test.com\n2,Jane,jane@test.com';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob([csvData], { type: 'text/csv' }),
      } as Response);

      const userIds = ['1', '2'];
      const blob = await adminService.exportUsers(userIds);

      expect(blob).toBeInstanceOf(Blob);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds }),
      });
    });
  });

  describe('getAnalytics', () => {
    it('fetches analytics data with date range', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userGrowth: [{ date: '2024-01-01', value: 100 }],
          revenueGrowth: [{ date: '2024-01-01', value: 5000 }],
          totalUsers: 1250,
          conversionRate: 5.2,
        }),
      } as Response);

      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
      };
      
      const analytics = await adminService.getAnalytics(dateRange);

      expect(analytics.totalUsers).toBe(1250);
      expect(analytics.userGrowth).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/analytics?start=2024-01-01T00:00:00.000Z&end=2024-01-31T00:00:00.000Z'
      );
    });
  });

  describe('getSystemHealth', () => {
    it('fetches system health data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          services: {
            database: { status: 'healthy', responseTime: 45 },
            api: { status: 'healthy', responseTime: 120 },
          },
          performance: {
            responseTime: { current: 150, average: 145 },
            errorRate: { current: 0.1, average: 0.15 },
          },
        }),
      } as Response);

      const health = await adminService.getSystemHealth();

      expect(health.services.database.status).toBe('healthy');
      expect(health.performance.responseTime.current).toBe(150);
    });
  });

  describe('getAuditLogs', () => {
    it('fetches audit logs with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: '1',
              action: 'user_login',
              user: 'admin@test.com',
              timestamp: '2024-01-15T10:00:00Z',
            },
          ],
          metadata: { total: 1 },
        }),
      } as Response);

      const filters = { action: 'user_login', user: '', startDate: null, endDate: null };
      const pagination = { page: 1, limit: 20 };
      
      const logs = await adminService.getAuditLogs(filters, pagination);

      expect(logs.data).toHaveLength(1);
      expect(logs.data[0].action).toBe('user_login');
    });
  });

  describe('error handling', () => {
    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Network error');
    });

    it('handles HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(adminService.getDashboardMetrics()).rejects.toThrow();
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
      } as Response);

      await expect(adminService.getDashboardMetrics()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('authentication', () => {
    it('includes auth headers in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await adminService.getDashboardMetrics();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/dashboard',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});