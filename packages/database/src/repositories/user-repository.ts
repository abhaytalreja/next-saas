/**
 * User repository for user-specific database operations
 */

import { BaseRepository } from './base-repository';
import type { User } from '../types/tables';
import type { SingleResult, MutationResult, UUID } from '../types/base';
import type { DatabaseProvider } from '../abstractions/interfaces/database-provider';

export class UserRepository extends BaseRepository<User> {
  constructor(provider: DatabaseProvider) {
    super(provider, 'users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SingleResult<User>> {
    return this.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Update last seen timestamp
   */
  async updateLastSeen(userId: UUID): Promise<MutationResult<User>> {
    return this.update(userId, {
      last_seen_at: new Date()
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: UUID): Promise<MutationResult<User>> {
    return this.update(userId, {
      email_verified_at: new Date()
    });
  }

  /**
   * Find users by organization
   */
  async findByOrganization(organizationId: UUID) {
    const query = `
      SELECT u.* FROM users u
      JOIN memberships m ON m.user_id = u.id
      WHERE m.organization_id = $1
      AND m.accepted_at IS NOT NULL
      AND u.deleted_at IS NULL
      ORDER BY u.name, u.email
    `;

    return this.provider.raw<User>(query, [organizationId]);
  }

  /**
   * Search users by name or email
   */
  async search(query: string, organizationId?: UUID) {
    const searchTerm = `%${query}%`;
    
    if (organizationId) {
      const sql = `
        SELECT DISTINCT u.* FROM users u
        JOIN memberships m ON m.user_id = u.id
        WHERE m.organization_id = $1
        AND m.accepted_at IS NOT NULL
        AND (u.name ILIKE $2 OR u.email ILIKE $2)
        AND u.deleted_at IS NULL
        ORDER BY u.name, u.email
        LIMIT 20
      `;
      return this.provider.raw<User>(sql, [organizationId, searchTerm]);
    }

    return this.find({
      where: {
        deleted_at: null
      },
      orderBy: [{ column: 'name', direction: 'asc' }],
      limit: 20
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: UUID) {
    const stats = await this.provider.raw<{
      organizations_count: number;
      projects_count: number;
      items_count: number;
      last_activity: Date;
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM memberships WHERE user_id = $1 AND accepted_at IS NOT NULL) as organizations_count,
        (SELECT COUNT(*) FROM projects WHERE created_by = $1 AND deleted_at IS NULL) as projects_count,
        (SELECT COUNT(*) FROM items WHERE created_by = $1 AND deleted_at IS NULL) as items_count,
        (SELECT MAX(created_at) FROM activities WHERE user_id = $1) as last_activity
    `, [userId]);

    return stats.data[0];
  }

  /**
   * Check if user is organization member
   */
  async isOrganizationMember(userId: UUID, organizationId: UUID): Promise<boolean> {
    return this.provider.exists('memberships', {
      user_id: userId,
      organization_id: organizationId,
      accepted_at: { not: null }
    });
  }

  /**
   * Get user's role in organization
   */
  async getOrganizationRole(userId: UUID, organizationId: UUID): Promise<string | null> {
    const result = await this.provider.raw<{ role: string }>(`
      SELECT role FROM memberships
      WHERE user_id = $1 AND organization_id = $2
      AND accepted_at IS NOT NULL
    `, [userId, organizationId]);

    return result.data[0]?.role || null;
  }
}