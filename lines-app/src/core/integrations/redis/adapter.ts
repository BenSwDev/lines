/**
 * Redis Adapter - Universal Redis client adapter
 * Supports multiple Redis connection types:
 * 1. Vercel KV (KV_URL or KV_REST_API_URL) - uses @vercel/kv
 * 2. Standard Redis (REDIS_URL) - uses ioredis
 */

import { kv } from "@vercel/kv";
import Redis from "ioredis";
import type { Redis as IORedisType } from "ioredis";

export interface RedisAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  scan(cursor: number, options?: { match?: string; count?: number }): Promise<[number, string[]]>;
}

class VercelKVAdapter implements RedisAdapter {
  private client: typeof kv;

  constructor() {
    this.client = kv;
  }

  async get<T>(key: string): Promise<T | null> {
    return (await this.client.get<T>(key)) ?? null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, value, { ex: ttlSeconds });
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const keys: string[] = [];
      let cursor = 0;
      do {
        const result = await this.scan(cursor, { match: pattern, count: 100 });
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== 0);
      return keys;
    } catch {
      return [];
    }
  }

  async scan(
    cursor: number,
    options?: { match?: string; count?: number }
  ): Promise<[number, string[]]> {
    return await this.client.scan(cursor, options || {});
  }
}

class IORedisAdapter implements RedisAdapter {
  private client: IORedisType;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch {
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch {
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch {
      return [];
    }
  }

  async scan(
    cursor: number,
    options?: { match?: string; count?: number }
  ): Promise<[number, string[]]> {
    try {
      const result = await this.client.scan(
        cursor,
        "MATCH",
        options?.match || "*",
        "COUNT",
        options?.count || 100
      );
      // ioredis returns [string, string[]] but we need [number, string[]]
      const nextCursor = parseInt(result[0] as string, 10);
      return [nextCursor, result[1]];
    } catch {
      return [0, []];
    }
  }
}

class MockRedisAdapter implements RedisAdapter {
  async get<T>(): Promise<T | null> {
    console.warn("Redis not configured, returning null");
    return null;
  }

  async set(): Promise<boolean> {
    console.warn("Redis not configured, skipping set");
    return false;
  }

  async del(): Promise<boolean> {
    console.warn("Redis not configured, skipping delete");
    return false;
  }

  async keys(): Promise<string[]> {
    console.warn("Redis not configured, returning empty array");
    return [];
  }

  async scan(): Promise<[number, string[]]> {
    return [0, []];
  }
}

/**
 * Create the appropriate Redis adapter based on available environment variables
 */
function createRedisAdapter(): RedisAdapter {
  // Check for Vercel KV first
  if (process.env.KV_URL || process.env.KV_REST_API_URL) {
    try {
      return new VercelKVAdapter();
    } catch (error) {
      console.error("Failed to initialize Vercel KV adapter:", error);
    }
  }

  // Check for standard Redis connection (REDIS_URL)
  if (process.env.REDIS_URL) {
    try {
      return new IORedisAdapter(process.env.REDIS_URL);
    } catch (error) {
      console.error("Failed to initialize ioredis adapter:", error);
    }
  }

  // Fallback to mock adapter
  return new MockRedisAdapter();
}

const globalForRedis = globalThis as unknown as {
  redisAdapter: RedisAdapter | undefined;
};

/**
 * Singleton Redis adapter instance
 * Automatically selects the appropriate adapter based on environment variables
 * Priority: KV_URL/KV_REST_API_URL > REDIS_URL > Mock
 */
export const redisAdapter: RedisAdapter =
  globalForRedis.redisAdapter ?? createRedisAdapter();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisAdapter = redisAdapter;
}
