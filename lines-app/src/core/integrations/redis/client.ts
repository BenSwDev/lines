import { kv } from "@vercel/kv";

const globalForKv = globalThis as unknown as {
  redis: typeof kv | undefined;
};

/**
 * Redis client wrapper using @vercel/kv
 * Handles connection and provides helper functions for test results storage
 */
export const redis =
  globalForKv.redis ??
  (process.env.KV_URL || process.env.KV_REST_API_URL
    ? kv
    : // Fallback mock for development without Redis
      ({} as typeof kv));

if (process.env.NODE_ENV !== "production") {
  globalForKv.redis = redis;
}

/**
 * Helper function to get a value from Redis
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  if (!process.env.KV_URL && !process.env.KV_REST_API_URL) {
    console.warn("Redis not configured, returning null");
    return null;
  }
  try {
    return (await redis.get<T>(key)) ?? null;
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
  if (!process.env.KV_URL && !process.env.KV_REST_API_URL) {
    console.warn("Redis not configured, skipping set");
    return false;
  }
  try {
    if (ttlSeconds > 0) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error);
    return false;
  }
}

/**
 * Helper function to delete a value from Redis
 */
export async function redisDel(key: string): Promise<boolean> {
  if (!process.env.KV_URL && !process.env.KV_REST_API_URL) {
    console.warn("Redis not configured, skipping delete");
    return false;
  }
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis delete error for key ${key}:`, error);
    return false;
  }
}

/**
 * Helper function to list keys matching a pattern
 */
export async function redisKeys(pattern: string): Promise<string[]> {
  if (!process.env.KV_URL && !process.env.KV_REST_API_URL) {
    console.warn("Redis not configured, returning empty array");
    return [];
  }
  try {
    // @vercel/kv uses scan for pattern matching
    const keys: string[] = [];
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== 0);
    return keys;
  } catch (error) {
    console.error(`Redis keys error for pattern ${pattern}:`, error);
    return [];
  }
}
