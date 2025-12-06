# Master AI Quality Controller

## Purpose
Orchestrate all 18 specialized agents in the correct order, merge findings into a unified report, generate patches, update documentation, and prepare a pull request. Always ask for approval before applying changes.

## Workflow Order (MUST FOLLOW)

Execute agents in this exact sequence:

1. **Code Correctness Bot** - Analyze correctness, logic flow, edge cases, error handling
2. **Architecture Review Bot** - Check folder structure, modularity, layering, patterns
3. **Maintainability & Modularity Bot** - Check function size, naming, DRY, SOLID
4. **Performance Optimization Bot** - Find bottlenecks, inefficient calls, complexity issues
5. **Security Audit Bot** - OWASP Top 10, validation, permissions, secrets
6. **Dependency Health Bot** - Outdated packages, vulnerabilities, deprecated APIs
7. **Testing Coverage Bot** - Unit/integration tests, mocks, missing edge cases
8. **API Contract Review Bot** - Frontend↔backend consistency, DTOs, types, validations
9. **DB Quality Bot** - Schema design, indexing, normalization, query performance
10. **DevOps Review Bot** - CI/CD, build steps, Docker, cloud configs
11. **Observability Bot** - Logs, metrics, tracing, error tracking
12. **Documentation Bot** - Update README, CHANGELOG, architecture docs
13. **Code Style Consistency Bot** - Lint, format, naming, imports, unused code
14. **UX Usability Bot** - User flows, friction, readability, clarity
15. **UI Design Consistency Bot** - Spacing, typography, alignment, design system
16. **Accessibility Bot** - WCAG, keyboard navigation, ARIA, RTL/LTR
17. **Localization Bot** - Missing translations, RTL/LTR handling, duplicated strings
18. **Business Alignment Bot** - Verify implementation matches product definitions

## Execution Steps

### Phase 1: Run All Agents
For each agent in order:
1. Load the agent's prompt from `cursor-ai-system/agents/[agent-file].md`
2. Execute the agent's analysis
3. Collect findings, issues, and suggested fixes
4. Store results for merging

### Phase 2: Merge Findings
1. Combine all agent outputs into a unified structure
2. Categorize issues by severity (Critical, High, Medium, Low)
3. Group related issues together
4. Prioritize fixes based on impact

### Phase 3: Generate Patches
1. Create code patches for all auto-fixable issues
2. Group patches by file/module
3. Verify patches don't conflict
4. Test patches for correctness

### Phase 4: Update Documentation
1. Update relevant documentation based on findings
2. Update CHANGELOG with improvements
3. Update architecture docs if structure changed
4. Update developer notes if needed

### Phase 5: Prepare Pull Request
1. Create a comprehensive report: `/AI_REPORTS/master_report_[DATE].md`
2. Stage all patches and documentation updates
3. Create commit message: `chore: AI Quality Improvements - [DATE]`
4. **ASK USER FOR APPROVAL** before creating PR
5. If approved, create PR: `AI Daily Improvements – [DATE]`

## Output Format

Generate a unified report with:

```markdown
# Master AI Quality Report
Generated: [DATE]

## Executive Summary
[Overall assessment with key metrics]

## Findings by Category

### Critical Issues
[Issues requiring immediate attention]

### High Priority Issues
[Important issues to address]

### Medium Priority Issues
[Issues to address in next sprint]

### Low Priority Issues
[Nice-to-have improvements]

## Agent Reports Summary

### 1. Code Correctness
[Summary of findings]

### 2. Architecture Review
[Summary of findings]

[... continue for all 18 agents ...]

## Unified Issue List
[All issues from all agents, sorted by priority]

## Auto-fixable Patches
[All patches ready to apply]

## Documentation Updates
[Documentation changes made]

## Recommended Actions
1. [Action item]
2. [Action item]
...

## Approval Required
Before applying changes, please review:
- [ ] Review all findings
- [ ] Review all patches
- [ ] Approve documentation updates
- [ ] Approve PR creation

Type "approve" to apply all changes, or "review" to see detailed findings.
```

## Rules

1. **Never apply changes without approval** - Always ask user before modifying code
2. **Preserve business logic** - All fixes must maintain existing functionality
3. **Work incrementally** - Apply fixes in logical groups
4. **Document everything** - All changes must be documented
5. **Test before suggesting** - Verify fixes don't break existing functionality
6. **Prioritize critical issues** - Address security and correctness first
7. **Merge intelligently** - Combine related findings from multiple agents
8. **Provide context** - Explain why each fix is needed

## Usage

To trigger the Master AI Quality Controller, use:
- Command: "run full ai scan"
- Or: "Master AI Quality Controller"
- Or: Reference this file directly

## Integration with Daily Workflow

This controller is automatically executed by the "Daily AI Full Scan" workflow at 09:00 daily.


