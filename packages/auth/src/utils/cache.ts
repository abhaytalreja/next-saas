'use client'

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
  staleWhileRevalidate: boolean // Return stale data while fetching fresh data
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  isStale: boolean
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
}

// Default cache configurations for different data types
export const CACHE_CONFIGS = {
  profile: { ttl: 5 * 60 * 1000, maxSize: 100, staleWhileRevalidate: true }, // 5 minutes
  avatar: { ttl: 30 * 60 * 1000, maxSize: 200, staleWhileRevalidate: true }, // 30 minutes
  preferences: { ttl: 10 * 60 * 1000, maxSize: 50, staleWhileRevalidate: true }, // 10 minutes
  activity: { ttl: 2 * 60 * 1000, maxSize: 100, staleWhileRevalidate: false }, // 2 minutes
  organization: { ttl: 15 * 60 * 1000, maxSize: 50, staleWhileRevalidate: true }, // 15 minutes
  directory: { ttl: 5 * 60 * 1000, maxSize: 20, staleWhileRevalidate: true }, // 5 minutes
}

class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private config: CacheConfig
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, maxSize: 0 }

  constructor(config: CacheConfig) {
    this.config = config
    this.stats.maxSize = config.maxSize
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      isStale: false
    }

    // Remove oldest entries if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, entry)
    this.stats.size = this.cache.size
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    const age = now - entry.timestamp

    // Check if entry is expired
    if (age > entry.ttl) {
      if (this.config.staleWhileRevalidate) {
        // Mark as stale but return data
        entry.isStale = true
        this.stats.hits++
        return entry.data
      } else {
        // Remove expired entry
        this.cache.delete(key)
        this.stats.size = this.cache.size
        this.stats.misses++
        return null
      }
    }

    this.stats.hits++
    return entry.data
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const age = Date.now() - entry.timestamp
    return entry.isStale || age > entry.ttl
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.size = this.cache.size
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
    this.stats.size = 0
    this.stats.hits = 0
    this.stats.misses = 0
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  private evictOldest(): void {
    if (this.cache.size === 0) return

    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Get all keys matching a pattern
  getKeysMatching(pattern: string | RegExp): string[] {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  // Invalidate all keys matching a pattern
  invalidatePattern(pattern: string | RegExp): number {
    const keysToDelete = this.getKeysMatching(pattern)
    keysToDelete.forEach(key => this.cache.delete(key))
    this.stats.size = this.cache.size
    return keysToDelete.length
  }
}

// Cache manager for different data types
class CacheManager {
  private caches = new Map<string, MemoryCache>()

  getCache(type: keyof typeof CACHE_CONFIGS): MemoryCache {
    if (!this.caches.has(type)) {
      const config = CACHE_CONFIGS[type]
      this.caches.set(type, new MemoryCache(config))
    }
    return this.caches.get(type)!
  }

  // Cached fetch with automatic key generation
  async cachedFetch<T>(
    type: keyof typeof CACHE_CONFIGS,
    url: string,
    options?: RequestInit,
    customKey?: string
  ): Promise<T> {
    const cache = this.getCache(type)
    const key = customKey || `${options?.method || 'GET'}:${url}`
    
    // Check cache first
    const cached = cache.get(key)
    const isStale = cache.isStale(key)
    
    // Return cached data if available and not stale (unless stale-while-revalidate)
    if (cached && !isStale) {
      return cached
    }

    // For stale-while-revalidate, return stale data and fetch in background
    if (cached && isStale && CACHE_CONFIGS[type].staleWhileRevalidate) {
      // Fetch fresh data in background
      this.fetchAndCache(type, url, options, key).catch(console.error)
      return cached
    }

    // Fetch fresh data
    return this.fetchAndCache(type, url, options, key)
  }

  private async fetchAndCache<T>(
    type: keyof typeof CACHE_CONFIGS,
    url: string,
    options?: RequestInit,
    key?: string
  ): Promise<T> {
    const cache = this.getCache(type)
    const cacheKey = key || `${options?.method || 'GET'}:${url}`
    
    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      cache.set(cacheKey, data)
      return data
    } catch (error) {
      // If we have stale data, return it on error
      const stale = cache.get(cacheKey)
      if (stale) {
        return stale
      }
      throw error
    }
  }

  // Invalidate cache entries
  invalidate(type: keyof typeof CACHE_CONFIGS, pattern?: string | RegExp): void {
    const cache = this.getCache(type)
    if (pattern) {
      cache.invalidatePattern(pattern)
    } else {
      cache.clear()
    }
  }

  // Get cache statistics
  getStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {}
    for (const [type, cache] of this.caches.entries()) {
      stats[type] = cache.getStats()
    }
    return stats
  }

  // Clear all caches
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager()

// Convenience functions for specific cache types
export const profileCache = {
  get: (key: string) => cacheManager.getCache('profile').get(key),
  set: (key: string, data: any) => cacheManager.getCache('profile').set(key, data),
  invalidate: (pattern?: string | RegExp) => cacheManager.invalidate('profile', pattern),
  fetch: <T>(url: string, options?: RequestInit, key?: string) => 
    cacheManager.cachedFetch<T>('profile', url, options, key)
}

export const avatarCache = {
  get: (key: string) => cacheManager.getCache('avatar').get(key),
  set: (key: string, data: any) => cacheManager.getCache('avatar').set(key, data),
  invalidate: (pattern?: string | RegExp) => cacheManager.invalidate('avatar', pattern),
  fetch: <T>(url: string, options?: RequestInit, key?: string) => 
    cacheManager.cachedFetch<T>('avatar', url, options, key)
}

export const organizationCache = {
  get: (key: string) => cacheManager.getCache('organization').get(key),
  set: (key: string, data: any) => cacheManager.getCache('organization').set(key, data),
  invalidate: (pattern?: string | RegExp) => cacheManager.invalidate('organization', pattern),
  fetch: <T>(url: string, options?: RequestInit, key?: string) => 
    cacheManager.cachedFetch<T>('organization', url, options, key)
}

// Browser storage cache (for persistence across sessions)
export const persistentCache = {
  set(key: string, data: any, ttl = 24 * 60 * 60 * 1000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(`cache:${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set persistent cache:', error)
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache:${key}`)
      if (!item) return null

      const { data, timestamp, ttl } = JSON.parse(item)
      const age = Date.now() - timestamp

      if (age > ttl) {
        localStorage.removeItem(`cache:${key}`)
        return null
      }

      return data
    } catch (error) {
      console.warn('Failed to get persistent cache:', error)
      return null
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`cache:${key}`)
    } catch (error) {
      console.warn('Failed to remove persistent cache:', error)
    }
  },

  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache:'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error)
    }
  }
}