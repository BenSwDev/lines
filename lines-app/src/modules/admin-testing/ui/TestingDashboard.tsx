"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TestRunCard } from "./TestRunCard";
import { TestResultsViewer } from "./TestResultsViewer";
import { startTestRun, getTestRunStatus, getTestRunResults, getTestRunHistory } from "../actions/testActions";
import { useToast } from "@/hooks/use-toast";
import type { TestType, TestSuiteResult } from "../types";
import { Loader2, History } from "lucide-react";

export function TestingDashboard() {
  const { toast } = useToast();
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [currentRunStatus, setCurrentRunStatus] = useState<"queued" | "running" | "completed" | "failed" | null>(null);
  const [currentRunProgress, setCurrentRunProgress] = useState(0);
  const [currentResults, setCurrentResults] = useState<TestSuiteResult | null>(null);
  const [runningTestType, setRunningTestType] = useState<TestType | null>(null);
  const [history, setHistory] = useState<Array<{
    runId: string;
    testType: TestType;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    total: number;
    passed: number;
    failed: number;
  }>>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (currentRunId && (currentRunStatus === "queued" || currentRunStatus === "running")) {
      const interval = setInterval(async () => {
        const statusResult = await getTestRunStatus(currentRunId);
        if (statusResult.success && statusResult.status) {
          setCurrentRunStatus(statusResult.status as "queued" | "running" | "completed" | "failed");
          setCurrentRunProgress(statusResult.progress || 0);

          if (statusResult.status === "completed" || statusResult.status === "failed") {
            clearInterval(interval);
            const resultsResult = await getTestRunResults(currentRunId);
            if (resultsResult.success && resultsResult.results) {
              setCurrentResults(resultsResult.results);
            }
            setRunningTestType(null);
            loadHistory();
          }
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentRunId, currentRunStatus]);

  const loadHistory = async () => {
    const result = await getTestRunHistory();
    if (result.success && result.runs) {
      setHistory(result.runs);
    }
  };

  const handleRunTests = async (testType: TestType) => {
    try {
      setRunningTestType(testType);
      setCurrentResults(null);
      setCurrentRunProgress(0);

      const result = await startTestRun(testType);
      if (result.success && result.runId) {
        setCurrentRunId(result.runId);
        setCurrentRunStatus("queued");
        toast({
          title: "הטסטים התחילו",
          description: `הרצת ${testType} התחילה`
        });
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "לא ניתן להתחיל הרצת טסטים",
          variant: "destructive"
        });
        setRunningTestType(null);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "לא ניתן להתחיל הרצת טסטים";
      toast({
        title: "שגיאה",
        description: errorMessage,
        variant: "destructive"
      });
      setRunningTestType(null);
    }
  };

  const handleViewResults = async (runId: string) => {
    const result = await getTestRunResults(runId);
    if (result.success && result.results) {
      setCurrentResults(result.results);
      setCurrentRunId(runId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">הרצת טסטים</h2>
        <p className="text-muted-foreground mt-1">
          הרץ טסטים על פרודקשן וצפה בתוצאות
        </p>
      </div>

      {/* Test Run Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TestRunCard
          testType="all"
          label="הרץ את כל הטסטים"
          description="Unit + Integration + E2E"
          onRun={handleRunTests}
          isRunning={runningTestType === "all"}
          lastRun={history.find((h) => h.testType === "all")}
        />
        <TestRunCard
          testType="unit"
          label="Unit Tests"
          description="טסטים יחידה"
          onRun={handleRunTests}
          isRunning={runningTestType === "unit"}
          lastRun={history.find((h) => h.testType === "unit")}
        />
        <TestRunCard
          testType="integration"
          label="Integration Tests"
          description="טסטי אינטגרציה"
          onRun={handleRunTests}
          isRunning={runningTestType === "integration"}
          lastRun={history.find((h) => h.testType === "integration")}
        />
        <TestRunCard
          testType="e2e"
          label="E2E Tests"
          description="טסטים מקצה לקצה"
          onRun={handleRunTests}
          isRunning={runningTestType === "e2e"}
          lastRun={history.find((h) => h.testType === "e2e")}
        />
      </div>

      {/* Progress */}
      {currentRunStatus && (currentRunStatus === "queued" || currentRunStatus === "running") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              מריץ טסטים...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={currentRunProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              סטטוס: {currentRunStatus === "queued" ? "בתור" : "מריץ"} ({currentRunProgress}%)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentResults && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">תוצאות</h3>
          <TestResultsViewer results={currentResults} />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              היסטוריית הרצות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.slice(0, 10).map((run) => (
                <div
                  key={run.runId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleViewResults(run.runId)}
                >
                  <div>
                    <div className="font-medium">{run.testType.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(run.startedAt).toLocaleString("he-IL")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {run.passed}/{run.total} עברו
                    </span>
                    {run.failed > 0 && (
                      <span className="text-sm text-red-500">{run.failed} נכשלו</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

