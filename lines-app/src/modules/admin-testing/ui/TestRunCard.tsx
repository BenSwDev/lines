"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { TestType } from "../types";

interface TestRunCardProps {
  testType: TestType;
  label: string;
  description: string;
  onRun: (testType: TestType) => void;
  isRunning?: boolean;
  lastRun?: {
    status: string;
    passed: number;
    failed: number;
    total: number;
  };
}

export function TestRunCard({
  testType,
  label,
  description,
  onRun,
  isRunning = false,
  lastRun
}: TestRunCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{label}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          {isRunning && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastRun && (
          <div className="flex items-center gap-2">
            <Badge variant={lastRun.status === "completed" ? "default" : "destructive"}>
              {lastRun.status === "completed" ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {lastRun.status === "completed" ? "עבר" : "נכשל"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {lastRun.passed}/{lastRun.total} עברו
            </span>
            {lastRun.failed > 0 && (
              <span className="text-sm text-red-500">{lastRun.failed} נכשלו</span>
            )}
          </div>
        )}

        <Button
          onClick={() => onRun(testType)}
          disabled={isRunning}
          className="w-full"
          variant={isRunning ? "secondary" : "default"}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              מריץ...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              הרץ טסטים
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
