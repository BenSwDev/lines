**“Whenever I request development of any feature, component, architecture, or design, you must always reason and produce results according to these principles:

Deliver a complete, end-to-end, production-ready solution that requires zero refactoring.

Ensure maximal modularity, reusability, scalability, and long-term maintainability — always design for future expansion.

Analyze the existing state of the system in full detail, including data structures, relationships, workflows, UI, UX, API, and dependencies.

Provide a precise description of what exists today, identify gaps, and propose an improved final version that is correct, stable, and does not break existing code.

Your response must include how to reach the final result: exact steps, considerations, dependencies, and decisions — all fully reasoned.

You must account for every relevant edge case, user flow, future expansion scenario, and system-wide implication.

Your output must be unambiguous, perfectly structured, and aligned with real-world engineering standards.”**

-------


everytime ill ask you to do success-check you need to do it based on the @success-check.md on @src 
then creating new file increment the number and write on top date and time

-------
## Task Execution Methodology - Complete End-to-End Process

When I receive a task from you, I MUST follow this complete methodology from start to finish:

### Phase 1: Understanding & Planning (MANDATORY FIRST STEP)
1. **Read and analyze** the complete request carefully
2. **Ask clarifying questions** if critical architectural decisions are needed (only if truly essential)
3. **Provide a clear summary** of what I understood, broken down into:
   - What is being requested
   - What the final result will look like
   - How I will implement it (architecture/approach)
   - Real examples from the current project showing the expected outcome
4. **Wait for explicit approval** before starting implementation
5. **Create a TODO list** using the todo_write tool with all major tasks (if the task has 3+ steps)
6. **Show progress tracking**: "📊 Progress: X% | Task Y/Z - Description"

### Phase 2: Systematic Implementation
1. **Work task-by-task** following the TODO list sequentially
2. **Update TODO status** after completing each task (completed/in_progress)
3. **Show progress percentage** after each completed task
4. **Never skip steps** - complete every TODO before moving to the next
5. **Handle errors immediately** - if a build/lint error occurs, fix it before proceeding
6. **Use the project's conventions**:
   - Follow existing folder structure (src/modules/, src/app/, etc.)
   - Use the same coding patterns as existing code
   - Respect TypeScript/ESLint/Prettier rules
   - Use pnpm (NOT npm or yarn)

### Phase 3: Quality Assurance (MANDATORY BEFORE COMPLETION)
1. **Run prettier**: `pnpm format:fix` to fix all formatting
2. **Check linter**: Use read_lints tool on modified files
3. **Run build**: `pnpm build` and ensure 0 errors
4. **Fix any issues** that arise in build/lint
5. **Verify the build output** shows success
6. **Re-run build** if any fixes were made to confirm 0 errors

### Phase 4: Integration & Testing
1. **Add to navigation** if creating new pages/features
2. **Verify all imports** are correct and working
3. **Check for unused code** and clean up
4. **Test that the feature is accessible** in the app structure
5. **Ensure responsive design** (mobile, tablet, desktop) if UI is involved

### Phase 5: Production Deployment (FINAL STEP - TASK NOT COMPLETE UNTIL THIS IS DONE)
1. **Create meaningful commit** with conventional commit format (feat:/fix:/refactor:)
2. **Push to GitHub**: `git push origin main`
3. **Deploy to Vercel**: `vercel deploy --prod`
4. **Verify deployment success**
5. **Clean up temporary files** (scripts, test files, etc.)
6. **Mark all TODOs as completed**
7. **Confirm**: "✅ Task 100% complete - Live in production"

### Critical Rules:
- ❌ **NEVER** stop before completing ALL TODOs
- ❌ **NEVER** leave build errors unfixed
- ❌ **NEVER** commit code that doesn't build successfully
- ❌ **NEVER** deploy without running `pnpm build` first
- ❌ **NEVER** use npm or yarn (only pnpm)
- ✅ **ALWAYS** show progress percentage after each task
- ✅ **ALWAYS** update TODOs as I progress
- ✅ **ALWAYS** fix formatting/linting before final commit
- ✅ **ALWAYS** deploy to production as the final step
- ✅ **ALWAYS** work within the docs/ folder guidelines if documentation exists

### Windows-Specific Commands:
- Use `cmd /c "cd /d <SHORT_PATH> & command"` for Hebrew paths
- Find short path with: `cmd /c dir /x /ad "C:\Users\...\EABB~1\..."`
- NEVER use `&&` in cmd (use `&` instead)
- Run ONE command at a time (never chain multiple commands)

### Progress Reporting Template:
**📊 Progress: [X]% | Task [Y]/[Z] - [Task Description]**

Example:
"📊 Progress: 25% | Task 4/16 - Building version detector script"

### Completion Confirmation Template:
At the very end, provide a comprehensive summary with:
- ✅ What was built
- ✅ Files created/modified (with counts)
- ✅ Build status (0 errors)
- ✅ Production URL
- ✅ How to use the new feature
- ✅ Statistics (lines added, features delivered, etc.)

### Example of Perfect Execution:
1. Understand request → Create TODOs → Get approval ✅
2. Implement task 1 → Update TODO → Show 6% progress ✅
3. Implement task 2 → Update TODO → Show 12% progress ✅
... continue for all tasks
15. Run build → Fix errors → Verify 0 errors ✅
16. Commit → Push → Deploy to Vercel → Verify production ✅
17. Show completion summary with all details ✅

This methodology ensures zero surprises, full transparency, and production-ready code every time.
-------
always validate yourself that you completed everything without forgetting any detail while you are being asked to write/update documentation or write/update tests
-------
always update/create the files of the latest version once finished update based on all of the code changes the files always based on the former version and add **new** or other options to the document once ill create new folder, it means the version is complete and starting working on the next version
-------
always once finished your task, make sure the build is with 0 errors and working, once everything is perfect, use vercel cli, your tasks ends only once your work is in production on vercel

------

try to avoid powershell and use cmd instead, we are using windows 11, you allow to use cli of supabase, vercel, github, git and remember we are always using only pnpm(!!!)
there are hebrew letters in paths so it might cause issues in powershell, find solution for that and if needed for cmd, never send 2 commands in on command to run one after the other, only one by one.


find the main folder of the app only like that in powershell:
cmd /c dir /x /ad "C:\Users\bensw\Desktop\My Documents\Business\EABB~1\2787~1\AIHELP~1\AI-HEL~1"

powershell cant use $$


-------

run any command you find necessary, i incourage you to use github, vercel and supabase cli to make sure your job is 100% accurate and working on production, but pay attention to the fact the environment is windows 11, you are using powershell, and there are some paths with hebrew text that can occure issues

--------

צא מנקודת הנחה שתמיד יש .env, .env.local
ושאני תמיד צריך להיות מחובר לVERCEL, GITHUB, PRISMA וכל דבר אחר שאנחנו משתמשים בהם לפי הCLI למטרה של ביצוע פעולות ובדיקות בקלות של הAGENT על ידי שליחת פקודות או כל דבר אחר מכיוון שיש לנו חיבור ישיר להכל


-------


תמיד תצא מנקודת הנחה שאם לא ציינתי משהו, אין צורך בו, אלא אם מדובר בדבר מהותי ולכן לפני שתתחיל בפיתוח, שאל אותי לפני, אבל רק אם מדובר במשהו מהותי שצריך לשנות את המבנה של הפרוייקט וישפיע על בשרשרת על דברים אחרים!

----------


תמיד תתייחס לקבצים שנמצאים בDOCS כדי לדעת בדיוק איך לפתח נכון ומתאים על גבי הפרוייקט הקיים דברים חדשים או לבצע שינויים


-------------


שים לב שרק אם אתה חייב תשלח פקודות PROMPT, שים לב שזה POWERSHELL ושיש בעיה עם תווים בעברית, אז צא מנקודת הנחה שאתה תמיד בתקייה הראשית @ai-help-center-platform 
ואל תשלח PROMPT שצריך להריץ 2 פקודות אחת אחרי השנייה, רק פקודה אחת כל פעם

