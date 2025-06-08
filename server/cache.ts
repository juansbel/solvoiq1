import NodeCache from 'node-cache';
import logger from './logger';

// Cache configuration
const cacheConfig = {
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every minute
  useClones: false, // Don't clone values
};

// Create cache instance
const cache = new NodeCache(cacheConfig);

// Cache keys
export const CACHE_KEYS = {
  CLIENTS: 'clients',
  TEAM_MEMBERS: 'team_members',
  TASKS: 'tasks',
  STATISTICS: 'statistics',
  KNOWLEDGE_ARTICLES: 'knowledge_articles',
} as const;

// Cache wrapper function
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = cacheConfig.stdTTL
): Promise<T> {
  try {
    // Try to get from cache
    const cached = cache.get<T>(key);
    if (cached) {
      logger.debug(`Cache hit for key: ${key}`);
      return cached;
    }

    // If not in cache, fetch and store
    logger.debug(`Cache miss for key: ${key}`);
    const data = await fetchFn();
    cache.set(key, data, ttl);
    return data;
  } catch (error) {
    logger.error(`Cache error for key: ${key}`, { error });
    // If cache fails, just fetch directly
    return fetchFn();
  }
}

// Cache invalidation
export function invalidateCache(key: string): void {
  try {
    cache.del(key);
    logger.debug(`Cache invalidated for key: ${key}`);
  } catch (error) {
    logger.error(`Cache invalidation error for key: ${key}`, { error });
  }
}

// Batch cache invalidation
export function invalidateCacheBatch(keys: string[]): void {
  try {
    cache.del(keys);
    logger.debug(`Cache invalidated for keys: ${keys.join(', ')}`);
  } catch (error) {
    logger.error(`Cache batch invalidation error`, { error, keys });
  }
}

// Cache statistics
export function getCacheStats(): NodeCache.Stats {
  return cache.getStats();
}

// Export cache instance
export default cache; 