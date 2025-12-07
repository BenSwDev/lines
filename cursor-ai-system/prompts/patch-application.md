# Patch Application Template

## Purpose
Standard template for applying auto-fixable patches from AI agent reviews.

## When to Use
- After running any agent that generates patches
- When user approves "fix everything"
- When applying specific patches from a report

## Patch Application Process

### Step 1: Review Patches
1. List all patches to be applied
2. Group by file/module
3. Check for conflicts
4. Verify patch correctness

### Step 2: Apply Patches
1. Apply patches file by file
2. Verify each patch applies cleanly
3. Handle conflicts if any
4. Test after each file

### Step 3: Verify Changes
1. Run linter
2. Run tests
3. Check build
4. Verify functionality

### Step 4: Commit Changes
1. Stage all changes
2. Create meaningful commit message
3. Reference the agent/report
4. Wait for approval before pushing

## Patch Format

Each patch should include:
- **File**: Path to file
- **Issue**: What the patch fixes
- **Change**: Description of change
- **Code**: Actual code change (diff format)

## Example Patch Application

```markdown
## Applying Patches

### File: src/modules/auth/services/auth.ts
**Issue**: Missing error handling
**Change**: Add try-catch block
**Patch**:
```diff
+ try {
    const result = await authenticate(user);
+ } catch (error) {
+   logger.error('Authentication failed', error);
+   throw new AuthError('Failed to authenticate');
+ }
```

### Verification
- [ ] Linter passes
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Functionality verified
```

## Safety Checks

Before applying any patch:
- [ ] Patch is marked as auto-fixable
- [ ] No business logic changes
- [ ] No breaking changes
- [ ] Tests exist for affected code
- [ ] User has approved

## Conflict Resolution

If patch conflicts:
1. Show conflict details
2. Suggest resolution
3. Ask user for guidance
4. Apply resolution
5. Verify result

## Rollback Plan

Always provide:
- List of files changed
- Commit hash before changes
- Rollback command
- Verification steps



