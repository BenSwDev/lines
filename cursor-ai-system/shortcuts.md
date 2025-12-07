# Command Shortcuts Reference

## Purpose
Quick command shortcuts to trigger specific AI agents or workflows without typing full commands.

## Available Shortcuts

### 1. "run full ai scan"
**Triggers**: Master AI Quality Controller
**Action**: Runs all 18 agents in sequence, generates unified report, creates patches
**Usage**: Type this phrase in Cursor chat
**Output**: Complete quality report with all findings and patches

### 2. "fix everything"
**Triggers**: Apply All Patches Workflow
**Action**: Applies all auto-fixable patches from the last scan
**Usage**: After running a scan, use this to apply fixes
**Output**: All patches applied, code updated
**Note**: Still requires approval before committing

### 3. "update docs"
**Triggers**: Documentation Bot (Agent #12)
**Action**: Runs only the Documentation Bot to update README, CHANGELOG, architecture docs
**Usage**: When you need documentation updated quickly
**Output**: Documentation updates and suggestions

### 4. "review code quality"
**Triggers**: Code Quality Review (Agents #1, #2, #3, #13)
**Action**: Runs:
- Code Correctness Bot
- Architecture Review Bot
- Maintainability & Modularity Bot
- Code Style Consistency Bot
**Usage**: Quick code quality check without full scan
**Output**: Code quality report from 4 agents

### 5. "review deployment pipeline"
**Triggers**: Deployment Review (Agents #10, #11)
**Action**: Runs:
- DevOps Review Bot
- Observability Bot
**Usage**: Check CI/CD, deployment, and monitoring setup
**Output**: DevOps and observability report

## Additional Shortcuts (Optional)

### 6. "security audit"
**Triggers**: Security Audit Bot (Agent #5)
**Action**: Runs security audit only
**Usage**: Quick security check

### 7. "performance check"
**Triggers**: Performance Optimization Bot (Agent #4)
**Action**: Runs performance analysis only
**Usage**: Check for performance issues

### 8. "test coverage"
**Triggers**: Testing Coverage Bot (Agent #7)
**Action**: Runs test coverage analysis
**Usage**: Check test coverage and quality

### 9. "accessibility check"
**Triggers**: Accessibility Bot (Agent #16)
**Action**: Runs accessibility audit
**Usage**: Check WCAG compliance

### 10. "business alignment"
**Triggers**: Business Alignment Bot (Agent #18)
**Action**: Verifies implementation matches requirements
**Usage**: Check feature completeness

## How to Use

1. Open Cursor chat
2. Type the shortcut phrase (e.g., "run full ai scan")
3. Cursor will recognize the shortcut and trigger the appropriate agent/workflow
4. Review the output
5. Approve changes if needed

## Customization

To add new shortcuts:
1. Add entry to this file
2. Update Cursor's prompt recognition (if needed)
3. Document the shortcut in setup.md

## Notes

- Shortcuts are case-insensitive
- Partial matches may work (e.g., "full scan" might trigger "run full ai scan")
- Shortcuts can be combined with file paths (e.g., "review code quality on src/modules/auth")
- All shortcuts respect the approval workflow



