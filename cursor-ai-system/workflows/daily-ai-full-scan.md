# Daily AI Full Scan Workflow

## Purpose
Automated daily quality scan that runs the Master AI Quality Controller and generates a report with improvements.

## Schedule
- **Frequency**: Daily
- **Time**: 09:00 (9:00 AM)
- **Timezone**: Project local timezone

## Workflow Steps

### Step 1: Pull Latest Project State
```bash
git pull origin main
```
- Ensure we're working with the latest code
- Handle merge conflicts if any
- Verify repository is clean

### Step 2: Run Master AI Quality Controller
- Load: `cursor-ai-system/master-ai-quality-controller.md`
- Execute all 18 agents in order
- Collect all findings and patches
- Generate unified report

### Step 3: Generate Markdown Report
- Location: `/AI_REPORTS/daily_report_[YYYY-MM-DD].md`
- Include:
  - Executive summary
  - Findings by category
  - Agent summaries
  - Unified issue list
  - Auto-fixable patches
  - Documentation updates
  - Recommended actions

### Step 4: Create Pull Request
- Branch name: `ai-daily-improvements-[YYYY-MM-DD]`
- PR title: `AI Daily Improvements – [YYYY-MM-DD]`
- PR description: Link to daily report
- Include all patches and documentation updates
- **Status**: Draft (waiting for approval)

### Step 5: Request User Approval
- Notify user in Cursor chat
- Show summary of findings
- Display number of patches ready
- Ask: "Review and approve PR: [PR_LINK]?"

## Output Artifacts

1. **Daily Report**: `/AI_REPORTS/daily_report_[DATE].md`
2. **Pull Request**: `AI Daily Improvements – [DATE]`
3. **Patches**: All auto-fixable code changes
4. **Documentation**: Updated docs

## Error Handling

- If git pull fails: Log error, continue with current state
- If agent fails: Log error, continue with other agents
- If PR creation fails: Save report, notify user manually
- If approval timeout: Keep PR as draft, notify user

## Manual Trigger

To run manually:
- Command: "run daily ai scan"
- Or: "Daily AI Full Scan"
- Or: Reference this workflow file

## Configuration

- Report location: `/AI_REPORTS/`
- PR branch prefix: `ai-daily-improvements-`
- Approval timeout: 24 hours (then notify again)

## Integration

This workflow integrates with:
- Master AI Quality Controller
- All 18 specialized agents
- Git/GitHub for PR creation
- Cursor chat for notifications


