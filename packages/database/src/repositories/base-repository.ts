/**
 * Base repository class with common CRUD operations
 */

import type { DatabaseProvider } from '../abstractions/interfaces/database-provider';
import type { 
  BaseEntity, 
  FindOptions, 
  CreateOptions, 
  UpdateOptions, 
  DeleteOptions,
  QueryResult,
  SingleResult,
  MutationResult,
  UUID
} from '../types/base';

export abstract class BaseRepository<T extends BaseEntity> {
  protected provider: DatabaseProvider;
  protected tableName: string;

  constructor(provider: DatabaseProvider, tableName: string) {
    this.provider = provider;
    this.tableName = tableName;
  }

  /**
   * Find multiple records
   */
  async find(options: FindOptions = {}): Promise<QueryResult<T>> {
    return this.provider.find<T>(this.tableName, options);
  }

  /**
   * Find a single record
   */
  async findOne(options: FindOptions): Promise<SingleResult<T>> {
    return this.provider.findOne<T>(this.tableName, options);
  }

  /**
   * Find by ID
   */
  async findById(id: UUID): Promise<SingleResult<T>> {
    return this.findOne({ where: { id } });
  }

  /**
   * Count records
   */
  async count(options: FindOptions = {}): Promise<number> {
    return this.provider.count(this.tableName, options);
  }

  /**
   * Check if exists
   */
  async exists(where: Record<string, any>): Promise<boolean> {
    return this.provider.exists(this.tableName, where);
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, keyof BaseEntity>, options?: CreateOptions): Promise<MutationResult<T>> {
    return this.provider.create<T>(this.tableName, data as any, options);
  }

  /**
   * Update records
   */
  async update(
    id: UUID,
    data: Partial<Omit<T, keyof BaseEntity>>,
    options?: Omit<UpdateOptions, 'where'>
  ): Promise<MutationResult<T>> {
    return this.provider.update<T>(this.tableName, data as any, {
      ...options,
      where: { id }
    });
  }

  /**
   * Update multiple records
   */
  async updateMany(
    where: Record<string, any>,
    data: Partial<Omit<T, keyof BaseEntity>>,
    options?: Omit<UpdateOptions, 'where'>
  ): Promise<MutationResult<T>> {
    return this.provider.update<T>(this.tableName, data as any, {
      ...options,
      where
    });
  }

  /**
   * Delete a record
   */
  async delete(id: UUID, soft = true): Promise<MutationResult<any>> {
    return this.provider.delete(this.tableName, {
      where: { id },
      soft
    });
  }

  /**
   * Delete multiple records
   */
  async deleteMany(where: Record<string, any>, soft = true): Promise<MutationResult<any>> {
    return this.provider.delete(this.tableName, {
      where,
      soft
    });
  }

  /**
   * Restore soft deleted record
   */
  async restore(id: UUID): Promise<MutationResult<T>> {
    return this.update(id, { deleted_at: null } as any);
  }

  /**
   * Find with pagination
   */
  async paginate(
    page: number,
    perPage: number,
    options: Omit<FindOptions, 'limit' | 'offset'> = {}
  ): Promise<QueryResult<T> & { page: number; perPage: number; totalPages: number }> {
    const offset = (page - 1) * perPage;
    const [result, total] = await Promise.all([
      this.find({ ...options, limit: perPage, offset }),
      this.count(options)
    ]);

    return {
      ...result,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    };
  }

  /**
   * Find all (without deleted)
   */
  async findActive(options: FindOptions = {}): Promise<QueryResult<T>> {
    return this.find({
      ...options,
      where: {
        ...options.where,
        deleted_at: null
      }
    });
  }

  /**
   * Batch create
   */
  async createMany(data: Array<Omit<T, keyof BaseEntity>>): Promise<MutationResult<T[]>> {
    // Most databases support bulk insert
    const results = await Promise.all(
      data.map(item => this.create(item))
    );

    return {
      data: results.map(r => r.data),
      affected: results.reduce((acc, r) => acc + r.affected, 0)
    };
  }
}