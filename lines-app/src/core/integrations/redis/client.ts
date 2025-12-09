/**
 * Redis client wrapper - Universal Redis adapter
 * Supports Vercel KV, standard Redis, and multiple connection types
 */

import { redisAdapter } from "./adapter";

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(process.env.KV_URL || process.env.KV_REST_API_URL || process.env.REDIS_URL);
}

/**
 * Helper function to get a value from Redis
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured()) {
    console.warn("Redis not configured, returning null");
    return null;
  }
  try {
    return await redisAdapter.get<T>(key);
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Helper function to set a value in Redis with optional TTL
 * @param key - Redis key
 * @param value - Value to store
 * @param ttlSeconds - Time to live in seconds (default: 30 days)
 */
export async function redisSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = 30 * 24 * 60 * 60 // 30 days default
): Promise<boolean> {
  if (!isRedisConfigured()) {
    console.warn("Redis not configured, skipping set");
    return false;
  }
  try {
    return await redisAdapter.set(key, value, ttlSeconds);
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Helper function to delete a value from Redis
 */
export async function redisDel(key: string): Promise<boolean> {
  if (!isRedisConfigured()) {
    console.warn("Redis not configured, skipping delete");
    return false;
  }
  try {
    return await redisAdapter.del(key);
  } catch (error) {
    console.error(`Redis delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Helper function to list keys matching a pattern
 */
export async function redisKeys(pattern: string): Promise<string[]> {
  if (!isRedisConfigured()) {
    console.warn("Redis not configured, returning empty array");
    return [];
  }
  try {
    return await redisAdapter.keys(pattern);
  } catch (error) {
    console.error(`Redis keys error for pattern ${pattern}:`, error);
    return [];
  }
}

/**
 * Export the adapter for advanced usage
 */
export { redisAdapter } from "./adapter";
