import { AudienceService } from '../AudienceService';
import { CampaignAudience, AudienceFilter } from '../types';

// Mock database interface
const mockDatabase = {
  query: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('AudienceService', () => {
  let audienceService: AudienceService;

  beforeEach(() => {
    audienceService = new AudienceService(mockDatabase as any);
    jest.clearAllMocks();
  });

  describe('createAudience', () => {
    const baseAudienceData = {
      name: 'Premium Users',
      organizationId: 'org-123',
      description: 'All premium subscription users',
      filters: [
        {
          field: 'subscription_tier',
          operator: 'equals' as const,
          value: 'premium',
        },
      ],
    };

    it('should create audience successfully', async () => {
      const mockAudience: CampaignAudience = {
        id: 'audience-123',
        ...baseAudienceData,
        size: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabase.insert.mockResolvedValue(mockAudience);
      mockDatabase.query.mockResolvedValue([{ count: 150 }]);

      const audience = await audienceService.createAudience(baseAudienceData);

      expect(audience.id).toBe('audience-123');
      expect(audience.name).toBe('Premium Users');
      expect(audience.size).toBe(150);
      expect(mockDatabase.insert).toHaveBeenCalledWith('audiences', expect.objectContaining({
        name: 'Premium Users',
        organizationId: 'org-123',
      }));
    });

    it('should validate required fields', async () => {
      const invalidData = {
        ...baseAudienceData,
        name: '', // Invalid empty name
      };

      await expect(audienceService.createAudience(invalidData))
        .rejects.toThrow('Audience name is required');
    });

    it('should validate filters', async () => {
      const invalidData = {
        ...baseAudienceData,
        filters: [
          {
            field: '', // Invalid empty field
            operator: 'equals' as const,
            value: 'premium',
          },
        ],
      };

      await expect(audienceService.createAudience(invalidData))
        .rejects.toThrow('Filter field is required');
    });

    it('should handle complex filter combinations', async () => {
      const complexFilters: AudienceFilter[] = [
        {
          field: 'subscription_tier',
          operator: 'equals',
          value: 'premium',
        },
        {
          field: 'last_login',
          operator: 'greater_than',
          value: '2024-01-01',
        },
        {
          field: 'country',
          operator: 'in',
          value: ['US', 'CA', 'UK'],
        },
      ];

      const complexAudienceData = {
        ...baseAudienceData,
        filters: complexFilters,
      };

      mockDatabase.insert.mockResolvedValue({
        id: 'audience-complex',
        ...complexAudienceData,
        size: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockDatabase.query.mockResolvedValue([{ count: 75 }]);

      const audience = await audienceService.createAudience(complexAudienceData);

      expect(audience.filters).toHaveLength(3);
      expect(audience.size).toBe(75);
    });
  });

  describe('getAudienceSize', () => {
    it('should return audience size for valid audience', async () => {
      mockDatabase.query.mockResolvedValue([{ count: 250 }]);

      const size = await audienceService.getAudienceSize('audience-123');

      expect(size).toBe(250);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT'),
        expect.arrayContaining(['audience-123'])
      );
    });

    it('should return 0 for non-existent audience', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const size = await audienceService.getAudienceSize('non-existent');

      expect(size).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockDatabase.query.mockRejectedValue(new Error('Database error'));

      await expect(audienceService.getAudienceSize('audience-123'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getAudienceEmails', () => {
    it('should return paginated email list', async () => {
      const mockEmails = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com',
      ];

      mockDatabase.query.mockResolvedValue(
        mockEmails.map(email => ({ email }))
      );

      const emails = await audienceService.getAudienceEmails('audience-123', {
        limit: 10,
        offset: 0,
      });

      expect(emails).toEqual(mockEmails);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['audience-123'])
      );
    });

    it('should handle pagination correctly', async () => {
      const mockEmails = ['user4@example.com', 'user5@example.com'];

      mockDatabase.query.mockResolvedValue(
        mockEmails.map(email => ({ email }))
      );

      const emails = await audienceService.getAudienceEmails('audience-123', {
        limit: 2,
        offset: 3,
      });

      expect(emails).toEqual(mockEmails);
      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 2 OFFSET 3'),
        expect.any(Array)
      );
    });

    it('should return empty array for non-existent audience', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const emails = await audienceService.getAudienceEmails('non-existent');

      expect(emails).toEqual([]);
    });

    it('should filter out invalid email addresses', async () => {
      const mockResults = [
        { email: 'valid@example.com' },
        { email: 'invalid-email' },
        { email: 'another@example.com' },
        { email: '' },
      ];

      mockDatabase.query.mockResolvedValue(mockResults);

      const emails = await audienceService.getAudienceEmails('audience-123');

      expect(emails).toEqual(['valid@example.com', 'another@example.com']);
    });
  });

  describe('updateAudience', () => {
    it('should update audience properties', async () => {
      const updates = {
        name: 'Updated Premium Users',
        description: 'Updated description',
      };

      const mockUpdatedAudience: CampaignAudience = {
        id: 'audience-123',
        name: 'Updated Premium Users',
        organizationId: 'org-123',
        description: 'Updated description',
        filters: [],
        size: 200,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      };

      mockDatabase.update.mockResolvedValue(mockUpdatedAudience);
      mockDatabase.query.mockResolvedValue([{ count: 200 }]);

      const audience = await audienceService.updateAudience('audience-123', updates);

      expect(audience.name).toBe('Updated Premium Users');
      expect(audience.description).toBe('Updated description');
      expect(audience.size).toBe(200);
      expect(mockDatabase.update).toHaveBeenCalledWith(
        'audiences',
        'audience-123',
        expect.objectContaining(updates)
      );
    });

    it('should recalculate size when filters are updated', async () => {
      const updates = {
        filters: [
          {
            field: 'subscription_tier',
            operator: 'in' as const,
            value: ['premium', 'enterprise'],
          },
        ],
      };

      mockDatabase.update.mockResolvedValue({
        id: 'audience-123',
        ...updates,
      });
      mockDatabase.query.mockResolvedValue([{ count: 350 }]);

      const audience = await audienceService.updateAudience('audience-123', updates);

      expect(audience.size).toBe(350);
      expect(mockDatabase.query).toHaveBeenCalled(); // Size recalculation
    });

    it('should handle non-existent audience', async () => {
      mockDatabase.update.mockResolvedValue(null);

      await expect(audienceService.updateAudience('non-existent', { name: 'New Name' }))
        .rejects.toThrow('Audience not found');
    });
  });

  describe('deleteAudience', () => {
    it('should delete audience successfully', async () => {
      mockDatabase.delete.mockResolvedValue(true);

      const result = await audienceService.deleteAudience('audience-123');

      expect(result).toBe(true);
      expect(mockDatabase.delete).toHaveBeenCalledWith('audiences', 'audience-123');
    });

    it('should return false for non-existent audience', async () => {
      mockDatabase.delete.mockResolvedValue(false);

      const result = await audienceService.deleteAudience('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('listAudiences', () => {
    it('should list audiences for organization', async () => {
      const mockAudiences = [
        {
          id: 'audience-1',
          name: 'Premium Users',
          organizationId: 'org-123',
          size: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'audience-2',
          name: 'Active Users',
          organizationId: 'org-123',
          size: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDatabase.query.mockResolvedValue(mockAudiences);

      const audiences = await audienceService.listAudiences('org-123');

      expect(audiences).toHaveLength(2);
      expect(audiences[0].name).toBe('Premium Users');
      expect(audiences[1].name).toBe('Active Users');
    });

    it('should return empty array for organization with no audiences', async () => {
      mockDatabase.query.mockResolvedValue([]);

      const audiences = await audienceService.listAudiences('org-456');

      expect(audiences).toEqual([]);
    });
  });

  describe('buildFilterQuery', () => {
    it('should build simple filter query', () => {
      const filters: AudienceFilter[] = [
        {
          field: 'subscription_tier',
          operator: 'equals',
          value: 'premium',
        },
      ];

      const { query, params } = (audienceService as any).buildFilterQuery(filters);

      expect(query).toContain('subscription_tier = ?');
      expect(params).toContain('premium');
    });

    it('should build complex filter query with multiple conditions', () => {
      const filters: AudienceFilter[] = [
        {
          field: 'subscription_tier',
          operator: 'equals',
          value: 'premium',
        },
        {
          field: 'last_login',
          operator: 'greater_than',
          value: '2024-01-01',
        },
        {
          field: 'country',
          operator: 'in',
          value: ['US', 'CA'],
        },
      ];

      const { query, params } = (audienceService as any).buildFilterQuery(filters);

      expect(query).toContain('subscription_tier = ?');
      expect(query).toContain('last_login > ?');
      expect(query).toContain('country IN (?, ?)');
      expect(params).toEqual(['premium', '2024-01-01', 'US', 'CA']);
    });

    it('should handle different operators correctly', () => {
      const filters: AudienceFilter[] = [
        { field: 'age', operator: 'greater_than', value: 18 },
        { field: 'age', operator: 'less_than', value: 65 },
        { field: 'name', operator: 'contains', value: 'john' },
        { field: 'email', operator: 'not_equals', value: 'test@example.com' },
      ];

      const { query, params } = (audienceService as any).buildFilterQuery(filters);

      expect(query).toContain('age > ?');
      expect(query).toContain('age < ?');
      expect(query).toContain('name LIKE ?');
      expect(query).toContain('email != ?');
      expect(params).toEqual([18, 65, '%john%', 'test@example.com']);
    });
  });

  describe('validateFilters', () => {
    it('should validate valid filters', () => {
      const validFilters: AudienceFilter[] = [
        {
          field: 'subscription_tier',
          operator: 'equals',
          value: 'premium',
        },
      ];

      expect(() => (audienceService as any).validateFilters(validFilters))
        .not.toThrow();
    });

    it('should reject filters with empty field', () => {
      const invalidFilters: AudienceFilter[] = [
        {
          field: '',
          operator: 'equals',
          value: 'premium',
        },
      ];

      expect(() => (audienceService as any).validateFilters(invalidFilters))
        .toThrow('Filter field is required');
    });

    it('should reject filters with invalid operator', () => {
      const invalidFilters: AudienceFilter[] = [
        {
          field: 'subscription_tier',
          operator: 'invalid_operator' as any,
          value: 'premium',
        },
      ];

      expect(() => (audienceService as any).validateFilters(invalidFilters))
        .toThrow('Invalid filter operator');
    });

    it('should reject filters with empty value', () => {
      const invalidFilters: AudienceFilter[] = [
        {
          field: 'subscription_tier',
          operator: 'equals',
          value: '',
        },
      ];

      expect(() => (audienceService as any).validateFilters(invalidFilters))
        .toThrow('Filter value is required');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@test-domain.org',
      ];

      validEmails.forEach(email => {
        expect((audienceService as any).isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
        null,
        undefined,
      ];

      invalidEmails.forEach(email => {
        expect((audienceService as any).isValidEmail(email)).toBe(false);
      });
    });
  });
});