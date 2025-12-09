"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TestSuiteResult } from "../types";

interface TestResultsViewerProps {
  results: TestSuiteResult;
}

export function TestResultsViewer({ results }: TestResultsViewerProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(results.markdown);
      setCopied(true);
      toast({
        title: "הועתק",
        description: "תוצאות הטסטים הועתקו ללוח"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק ללוח",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([results.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-results-${results.runId}-${new Date(results.startedAt).toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "הורדה",
      description: "קובץ התוצאות הורד"
    });
  };

  const failedTests = results.results.filter((r) => r.status === "failed");

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סה&quot;כ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עברו</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{results.passed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">נכשלו</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{results.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דולגו</CardTitle>
            <SkipForward className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{results.skipped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleCopy} variant="outline" className="gap-2">
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          העתק Markdown ללוח
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          הורד כקובץ
        </Button>
      </div>

      {/* Markdown Preview */}
      <Card>
        <CardHeader>
          <CardTitle>תוצאות (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={results.markdown}
            readOnly
            className="font-mono text-sm min-h-[400px]"
          />
        </CardContent>
      </Card>

      {/* Failed Tests Details */}
      {failedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">טסטים שנכשלו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failedTests.map((test, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="font-semibold">{test.testName}</span>
                    <Badge variant="destructive">נכשל</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {test.testFile}
                  </div>
                  {test.error && (
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="font-semibold">שגיאה:</span> {test.error.message}
                      </div>
                      {test.error.expected && (
                        <div className="text-sm">
                          <span className="font-semibold">צפוי:</span>{" "}
                          <code className="bg-muted px-1 rounded">{test.error.expected}</code>
                        </div>
                      )}
                      {test.error.actual && (
                        <div className="text-sm">
                          <span className="font-semibold">מציאותי:</span>{" "}
                          <code className="bg-muted px-1 rounded">{test.error.actual}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

