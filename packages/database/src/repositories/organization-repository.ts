/**
 * Organization repository for organization-specific database operations
 */

import { BaseRepository } from './base-repository';
import type { Organization, Membership, User } from '../types/tables';
import type { SingleResult, MutationResult, UUID, UserRole } from '../types/base';
import type { DatabaseProvider } from '../abstractions/interfaces/database-provider';

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(provider: DatabaseProvider) {
    super(provider, 'organizations');
  }

  /**
   * Find organization by slug
   */
  async findBySlug(slug: string): Promise<SingleResult<Organization>> {
    return this.findOne({
      where: { slug, deleted_at: null }
    });
  }

  /**
   * Find organization by domain
   */
  async findByDomain(domain: string): Promise<SingleResult<Organization>> {
    return this.findOne({
      where: { domain, deleted_at: null }
    });
  }

  /**
   * Create organization with owner
   */
  async createWithOwner(
    data: Omit<Organization, keyof BaseRepository<Organization>>,
    ownerId: UUID
  ): Promise<MutationResult<Organization>> {
    // Create organization
    const orgResult = await this.create({
      ...data,
      created_by: ownerId
    });

    // Create owner membership
    await this.provider.create<Membership>('memberships', {
      user_id: ownerId,
      organization_id: orgResult.data.id,
      role: 'owner' as UserRole,
      accepted_at: new Date()
    });

    return orgResult;
  }

  /**
   * Get organization members
   */
  async getMembers(organizationId: UUID) {
    const query = `
      SELECT 
        u.*,
        m.role,
        m.permissions,
        m.accepted_at,
        m.created_at as joined_at
      FROM users u
      JOIN memberships m ON m.user_id = u.id
      WHERE m.organization_id = $1
      AND u.deleted_at IS NULL
      ORDER BY 
        CASE m.role 
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        m.created_at
    `;

    return this.provider.raw<User & { role: UserRole; permissions: string[]; joined_at: Date }>(
      query,
      [organizationId]
    );
  }

  /**
   * Get pending invitations
   */
  async getPendingInvitations(organizationId: UUID) {
    const query = `
      SELECT 
        u.*,
        m.role,
        m.invited_by,
        m.invited_at,
        inviter.name as inviter_name,
        inviter.email as inviter_email
      FROM memberships m
      JOIN users u ON u.id = m.user_id
      LEFT JOIN users inviter ON inviter.id = m.invited_by
      WHERE m.organization_id = $1
      AND m.accepted_at IS NULL
      ORDER BY m.invited_at DESC
    `;

    return this.provider.raw(query, [organizationId]);
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    organizationId: UUID,
    userId: UUID,
    role: UserRole
  ): Promise<MutationResult<Membership>> {
    return this.provider.update<Membership>('memberships', 
      { role },
      {
        where: {
          organization_id: organizationId,
          user_id: userId
        }
      }
    );
  }

  /**
   * Remove member
   */
  async removeMember(organizationId: UUID, userId: UUID): Promise<MutationResult<any>> {
    return this.provider.delete('memberships', {
      where: {
        organization_id: organizationId,
        user_id: userId
      },
      soft: false
    });
  }

  /**
   * Get organization statistics
   */
  async getStats(organizationId: UUID) {
    const stats = await this.provider.raw<{
      members_count: number;
      projects_count: number;
      items_count: number;
      storage_used: number;
      api_calls_this_month: number;
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM memberships WHERE organization_id = $1 AND accepted_at IS NOT NULL) as members_count,
        (SELECT COUNT(*) FROM projects WHERE organization_id = $1 AND deleted_at IS NULL) as projects_count,
        (SELECT COUNT(*) FROM items WHERE organization_id = $1 AND deleted_at IS NULL) as items_count,
        (SELECT COALESCE(SUM(file_size), 0) FROM attachments WHERE organization_id = $1) as storage_used,
        (SELECT COALESCE(SUM(usage_count), 0) FROM usage_tracking 
         WHERE organization_id = $1 
         AND feature = 'api_calls'
         AND period_start >= date_trunc('month', CURRENT_DATE)) as api_calls_this_month
    `, [organizationId]);

    return stats.data[0];
  }

  /**
   * Get organizations for user
   */
  async findByUser(userId: UUID) {
    const query = `
      SELECT 
        o.*,
        m.role,
        m.permissions,
        m.accepted_at
      FROM organizations o
      JOIN memberships m ON m.organization_id = o.id
      WHERE m.user_id = $1
      AND m.accepted_at IS NOT NULL
      AND o.deleted_at IS NULL
      ORDER BY 
        CASE m.role 
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          ELSE 3
        END,
        o.created_at DESC
    `;

    return this.provider.raw<Organization & { role: UserRole; permissions: string[] }>(
      query,
      [userId]
    );
  }

  /**
   * Transfer ownership
   */
  async transferOwnership(
    organizationId: UUID,
    currentOwnerId: UUID,
    newOwnerId: UUID
  ): Promise<void> {
    // Update current owner to admin
    await this.updateMemberRole(organizationId, currentOwnerId, 'admin');
    
    // Update new owner
    await this.updateMemberRole(organizationId, newOwnerId, 'owner');
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: UUID): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    
    const exists = await this.provider.exists(this.tableName, where);
    return !exists;
  }
}