# Cursor AI System - Usage Guide

## Quick Start

### 1. System is Ready!
All 18 agents, the Master Controller, workflows, and shortcuts are now set up in your `cursor-ai-system/` folder.

### 2. How to Use

#### Run a Full Quality Scan
Simply type in Cursor chat:
```
run full ai scan
```

This will:
- Run all 18 specialized agents
- Generate a unified report
- Create patches for auto-fixable issues
- Ask for your approval before applying changes

#### Apply All Fixes
After a scan, type:
```
fix everything
```

This applies all approved patches.

#### Quick Quality Check
For a faster review of code quality:
```
review code quality
```

#### Update Documentation
To update docs only:
```
update docs
```

#### Check Deployment Pipeline
To review CI/CD and monitoring:
```
review deployment pipeline
```

### 3. File Structure

```
cursor-ai-system/
├── setup.md                          # Master definition (source of truth)
├── master-ai-quality-controller.md   # Orchestrates all agents
├── shortcuts.md                      # Command shortcuts reference
├── USAGE_GUIDE.md                    # This file
├── agents/                           # 18 specialized agents
│   ├── 01-code-correctness-bot.md
│   ├── 02-architecture-review-bot.md
│   ├── ... (all 18 agents)
│   └── 18-business-alignment-bot.md
├── workflows/                        # Workflow definitions
│   └── daily-ai-full-scan.md
├── rules/                           # Global rules
│   └── global-rules.md
├── prompts/                         # Reusable templates
│   ├── patch-application.md
│   └── doc-sync.md
└── documentation-sync/              # Doc sync rules
```

### 4. Daily Automated Scan

The system is configured to run automatically:
- **When**: Every day at 09:00
- **What**: Full quality scan
- **Output**: Report at `/AI_REPORTS/daily_report_[DATE].md`
- **Action**: Creates PR for your review

### 5. Understanding Agent Outputs

Each agent provides:
- **Summary**: Quick overview
- **Issues List**: Problems found
- **Suggested Fixes**: Recommendations
- **Auto-fix Patches**: Ready-to-apply code
- **Documentation Updates**: Doc changes needed

### 6. Approval Workflow

**Important**: The system NEVER applies changes without your approval.

1. Agent runs and finds issues
2. Generates report with patches
3. **Asks for your approval**
4. You review and approve
5. Changes are applied

### 7. Individual Agent Usage

You can also run individual agents:

```
Run Code Correctness Bot on src/modules/auth
Run Security Audit Bot
Run Performance Optimization Bot on this file
```

### 8. Customization

To customize agents:
1. Edit the agent file in `agents/` folder
2. Update `setup.md` if changing core behavior
3. Reload system: "Load /cursor-ai-system/setup.md"

### 9. Reports Location

All reports are saved to:
```
/AI_REPORTS/
├── daily_report_2025-01-15.md
├── master_report_2025-01-15.md
└── ...
```

### 10. Troubleshooting

**System not responding?**
- Say: "Load /cursor-ai-system/setup.md"

**Want to see what agents are available?**
- Check: `cursor-ai-system/setup.md`

**Need help with a specific agent?**
- Read the agent file in `agents/` folder

**Want to add a new shortcut?**
- Edit: `cursor-ai-system/shortcuts.md`

## Next Steps

1. **Try it out**: Run `run full ai scan` on your codebase
2. **Review results**: Check the generated report
3. **Approve fixes**: Review and approve patches
4. **Customize**: Adjust agents to your needs

## Support

- Master definition: `cursor-ai-system/setup.md`
- Agent details: `cursor-ai-system/agents/`
- Workflows: `cursor-ai-system/workflows/`
- Rules: `cursor-ai-system/rules/global-rules.md`

---

**Remember**: The system is designed to help, not replace, your judgment. Always review findings before approving changes!


