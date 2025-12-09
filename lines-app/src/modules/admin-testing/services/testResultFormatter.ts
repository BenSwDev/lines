import type { TestSuiteResult, TestResult } from "../types";

/**
 * Formats test results as Markdown, showing only failures
 */
export function formatTestResultsAsMarkdown(result: TestSuiteResult): string {
  const {
    testType,
    startedAt,
    completedAt,
    total,
    passed,
    failed,
    skipped,
    results: testResults
  } = result;

  const date = new Date(startedAt).toLocaleString("he-IL", {
    dateStyle: "long",
    timeStyle: "short"
  });

  let markdown = `# Test Results - ${date}\n\n`;
  markdown += `**Test Type:** ${testType.toUpperCase()}\n`;
  markdown += `**Started:** ${new Date(startedAt).toLocaleString("he-IL")}\n`;

  if (completedAt) {
    markdown += `**Completed:** ${new Date(completedAt).toLocaleString("he-IL")}\n`;
    const duration = Math.round(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );
    markdown += `**Duration:** ${duration}s\n`;
  }

  markdown += `\n## Summary\n\n`;
  markdown += `- **Total:** ${total}\n`;
  markdown += `- **Passed:** ${passed} ✅\n`;
  markdown += `- **Failed:** ${failed} ❌\n`;
  markdown += `- **Skipped:** ${skipped} ⏭️\n\n`;

  // Filter only failed tests
  const failedTests = testResults.filter((r) => r.status === "failed");

  if (failedTests.length === 0) {
    markdown += `## ✅ All Tests Passed!\n\n`;
    markdown += `No failures detected. All ${total} test(s) passed successfully.\n`;
    return markdown;
  }

  markdown += `## ❌ Failed Tests\n\n`;

  // Group by test file
  const testsByFile = failedTests.reduce(
    (acc, test) => {
      if (!acc[test.testFile]) {
        acc[test.testFile] = [];
      }
      acc[test.testFile].push(test);
      return acc;
    },
    {} as Record<string, TestResult[]>
  );

  // Format each file's failures
  for (const [file, tests] of Object.entries(testsByFile)) {
    markdown += `### ${file}\n\n`;

    for (const test of tests) {
      markdown += `- ❌ **${test.testName}**\n`;

      if (test.error) {
        markdown += `  - **Error:** ${test.error.message}\n`;

        if (test.error.expected) {
          markdown += `  - **Expected:** \`${test.error.expected}\`\n`;
        }

        if (test.error.actual) {
          markdown += `  - **Actual:** \`${test.error.actual}\`\n`;
        }

        if (test.error.stack) {
          // Show only first few lines of stack trace
          const stackLines = test.error.stack.split("\n").slice(0, 5).join("\n");
          markdown += `  - **Stack:**\n\`\`\`\n${stackLines}\n\`\`\`\n`;
        }
      }

      if (test.duration) {
        markdown += `  - **Duration:** ${test.duration}ms\n`;
      }

      markdown += `\n`;
    }
  }

  markdown += `---\n\n`;
  markdown += `**Note:** Only failed tests are shown. ${passed} test(s) passed successfully.\n`;

  return markdown;
}
