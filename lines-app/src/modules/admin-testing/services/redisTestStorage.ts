import { redisGet, redisSet, redisDel, redisKeys } from "@/core/integrations/redis";
import type { TestSuiteResult, TestType } from "../types";

const TEST_RUN_PREFIX = "test:run:";
const TEST_RUN_HISTORY_KEY = "test:runs:history";
const TEST_RUN_HISTORY_LIMIT = 50;

/**
 * Save a test run to Redis
 * @param runId - Unique test run ID
 * @param data - Test suite result data
 * @param ttlDays - Time to live in days (default: 30)
 */
export async function saveTestRun(
  runId: string,
  data: TestSuiteResult,
  ttlDays: number = 30
): Promise<boolean> {
  const key = `${TEST_RUN_PREFIX}${runId}`;
  const ttlSeconds = ttlDays * 24 * 60 * 60;

  // Save the full test run data
  const saved = await redisSet(key, data, ttlSeconds);
  if (!saved) {
    return false;
  }

  // Update history list (keep last N runs)
  try {
    const historyKey = TEST_RUN_HISTORY_KEY;
    const existingHistory =
      (await redisGet<
        Array<{ runId: string; testType: TestType; startedAt: string; status: string }>
      >(historyKey)) || [];

    // Remove old entry if exists
    const filteredHistory = existingHistory.filter((item) => item.runId !== runId);

    // Add new entry at the beginning
    const newEntry = {
      runId: data.runId,
      testType: data.testType,
      startedAt: data.startedAt.toISOString(),
      status: data.status,
      completedAt: data.completedAt?.toISOString(),
      total: data.total,
      passed: data.passed,
      failed: data.failed
    };

    const updatedHistory = [newEntry, ...filteredHistory].slice(0, TEST_RUN_HISTORY_LIMIT);
    await redisSet(historyKey, updatedHistory, ttlSeconds);
  } catch (error) {
    console.error("Failed to update test run history:", error);
    // Don't fail the entire operation if history update fails
  }

  return true;
}

/**
 * Get a test run from Redis
 * @param runId - Test run ID
 */
export async function getTestRun(runId: string): Promise<TestSuiteResult | null> {
  const key = `${TEST_RUN_PREFIX}${runId}`;
  const data = await redisGet<TestSuiteResult>(key);

  if (!data) {
    return null;
  }

  // Convert date strings back to Date objects
  return {
    ...data,
    startedAt: new Date(data.startedAt),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined
  };
}

/**
 * Get test run history (limited to last N runs)
 * @param limit - Maximum number of runs to return (default: 50)
 */
export async function getTestRunHistory(limit: number = TEST_RUN_HISTORY_LIMIT): Promise<
  Array<{
    runId: string;
    testType: TestType;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    total: number;
    passed: number;
    failed: number;
  }>
> {
  const history = await redisGet<
    Array<{
      runId: string;
      testType: TestType;
      startedAt: string;
      status: string;
      completedAt?: string;
      total: number;
      passed: number;
      failed: number;
    }>
  >(TEST_RUN_HISTORY_KEY);

  if (!history || history.length === 0) {
    return [];
  }

  return history.slice(0, limit).map((item) => ({
    ...item,
    startedAt: new Date(item.startedAt),
    completedAt: item.completedAt ? new Date(item.completedAt) : undefined
  }));
}

/**
 * Delete old test runs older than specified days
 * @param days - Delete runs older than this many days
 */
export async function deleteOldTestRuns(days: number): Promise<number> {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  let deletedCount = 0;

  try {
    const keys = await redisKeys(`${TEST_RUN_PREFIX}*`);

    for (const key of keys) {
      const data = await redisGet<TestSuiteResult>(key);
      if (data && data.startedAt && new Date(data.startedAt).getTime() < cutoffTime) {
        await redisDel(key);
        deletedCount++;
      }
    }

    // Clean up history too
    const history =
      await redisGet<Array<{ runId: string; startedAt: string }>>(TEST_RUN_HISTORY_KEY);
    if (history) {
      const filteredHistory = history.filter((item) => {
        const startedAt = new Date(item.startedAt).getTime();
        return startedAt >= cutoffTime;
      });
      if (filteredHistory.length < history.length) {
        const ttlSeconds = 30 * 24 * 60 * 60; // 30 days
        await redisSet(TEST_RUN_HISTORY_KEY, filteredHistory, ttlSeconds);
      }
    }
  } catch (error) {
    console.error("Error deleting old test runs:", error);
  }

  return deletedCount;
}
