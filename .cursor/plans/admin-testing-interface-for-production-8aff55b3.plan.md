<!-- 8aff55b3-6be9-4dd9-a1a8-750b6d779a6b 0d72ba80-da7b-4ae9-93fa-e9776e0125ad -->
# מערכת הרצת טסטים דרך GitHub Actions + Redis

## מטרה

להחליף את ההרצה הישירה של טסטים ב-Vercel Serverless Functions (שלא עובדת) במערכת שמפעילה GitHub Actions workflows ומשתמשת ב-Redis לאחסון תוצאות.

## ארכיטקטורה

### Flow:

1. **אדמין לוחץ "הרץ טסטים"** → API endpoint ב-Vercel
2. **API endpoint מפעיל GitHub Actions workflow** דרך GitHub API
3. **GitHub Actions מריץ טסטים** (Unit/Integration/E2E)
4. **GitHub Actions שומר תוצאות ב-Redis** דרך webhook ב-Vercel
5. **ממשק אדמין קורא מ-Redis** ומציג תוצאות

## שינויים נדרשים

### 1. התקנת Redis Client

**קובץ:** `package.json`

- הוספת `@vercel/kv` dependency

### 2. יצירת GitHub Actions Workflow

**קובץ חדש:** `.github/workflows/run-tests-on-demand.yml`

- Workflow שניתן להפעיל manual או דרך API
- Input: `test_type` (unit/integration/e2e/all)
- מריץ את הטסטים המתאימים
- שומר תוצאות ב-Redis דרך webhook

**שלבים:**

- Checkout
- Setup pnpm + Node.js
- Install dependencies
- Install Playwright browsers (אם צריך)
- Run tests לפי test_type
- Parse תוצאות ל-JSON
- Call webhook ב-Vercel עם תוצאות

### 3. יצירת Redis Service

**קובץ חדש:** `src/core/integrations/redis/client.ts`

- יצירת Redis client עם `@vercel/kv`
- Helper functions: `get`, `set`, `del`, `list`
- TTL management (30 יום לתוצאות)

**קובץ חדש:** `src/modules/admin-testing/services/redisTestStorage.ts`

- Functions לשמירה/קריאה של test runs ב-Redis
- `saveTestRun(runId, data)`
- `getTestRun(runId)`
- `getTestRunHistory(limit)`
- `deleteOldTestRuns(days)`

### 4. עדכון Test Actions

**קובץ:** `src/modules/admin-testing/actions/testActions.ts`

- החלפת in-memory Map ב-Redis
- `startTestRun()` - מפעיל GitHub Actions workflow דרך GitHub API
- `getTestRunStatus()` - קורא מ-Redis
- `getTestRunResults()` - קורא מ-Redis
- `getTestRunHistory()` - קורא מ-Redis

### 5. יצירת GitHub API Service

**קובץ חדש:** `src/modules/admin-testing/services/githubActionsService.ts`

- `triggerWorkflow(testType)` - מפעיל workflow דרך GitHub API
- `getWorkflowRunStatus(runId)` - בודק סטטוס הרצה
- שימוש ב-`GITHUB_TOKEN` secret

### 6. יצירת Webhook Endpoint

**קובץ חדש:** `src/app/api/admin/tests/webhook/route.ts`

- POST endpoint שמקבל תוצאות מ-GitHub Actions
- אימות עם secret token
- שמירה ב-Redis
- מחזיר 200 OK

### 7. עדכון API Endpoints

**קובץ:** `src/app/api/admin/tests/run/route.ts`

- עדכון להפעלת GitHub Actions במקום הרצה ישירה

**קובץ:** `src/app/api/admin/tests/status/[runId]/route.ts` (אם קיים)

- עדכון לקריאה מ-Redis

**קובץ:** `src/app/api/admin/tests/results/[runId]/route.ts` (אם קיים)

- עדכון לקריאה מ-Redis

### 8. עדכון Environment Variables

**קובץ:** `.env.example` (אם קיים)

- `KV_URL` - Redis connection string
- `KV_REST_API_URL` - Redis REST API URL
- `KV_REST_API_TOKEN` - Redis REST API token
- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_REPO` - Repository owner/name (e.g., `owner/repo`)
- `WEBHOOK_SECRET` - Secret לאימות webhook

### 9. עדכון GitHub Actions Workflow

**קובץ:** `.github/workflows/run-tests-on-demand.yml`

- הוספת step לקריאת webhook עם תוצאות
- שימוש ב-`WEBHOOK_URL` ו-`WEBHOOK_SECRET` secrets

### 10. עדכון Test Configs

**קבצים:** `vitest.config.production.ts`, `playwright.config.production.ts`

- וידוא שהם מוכנים להרצה ב-GitHub Actions
- שימוש ב-`NEXT_PUBLIC_APP_URL` או `TEST_BASE_URL`

## מבנה קבצים חדשים

```
src/
├── core/
│   └── integrations/
│       └── redis/
│           └── client.ts                    # Redis client wrapper
├── modules/
│   └── admin-testing/
│       ├── services/
│       │   ├── redisTestStorage.ts         # Redis storage helpers
│       │   └── githubActionsService.ts      # GitHub API integration
│       └── actions/
│           └── testActions.ts               # עדכון ל-Redis + GitHub
└── app/
    └── api/
        └── admin/
            └── tests/
                └── webhook/
                    └── route.ts              # Webhook endpoint

.github/
└── workflows/
    └── run-tests-on-demand.yml              # Workflow להרצת טסטים
```

## Security Considerations

1. **GitHub Token** - Personal Access Token עם permissions: `actions:write`, `workflow:write`
2. **Webhook Secret** - Secret token לאימות קריאות webhook
3. **Redis Access** - רק מ-Vercel (environment variables)
4. **Admin Only** - כל ה-endpoints מוגנים ב-`requireAdmin()`

## Memory Management (30MB Redis)

- **TTL על test runs:** 30 יום (אוטומטי)
- **Cleanup function:** מחק תוצאות ישנות מ-30 יום
- **Compression:** שמירת תוצאות כ-JSON compressed (אם צריך)
- **Pagination:** היסטוריה מוגבלת ל-50 הרצות אחרונות

## Error Handling

- GitHub API failures → retry logic
- Redis connection failures → fallback error message
- Webhook failures → GitHub Actions retry
- Timeout handling → מקסימום 60 דקות להרצה

## Testing

- Unit tests ל-Redis service
- Integration tests ל-GitHub API service
- Manual testing של workflow end-to-end

## Documentation

- עדכון `src/modules/admin-testing/README.md`
- הוספת setup instructions ל-`docs/ADMIN_SETUP.md`
- עדכון `docs/ARCHITECTURE.md` עם Redis integration

### To-dos

- [x] עדכון seed - מחיקת admin user, השארת demo user בלבד
- [x] יצירת מודול admin עם dashboard, ניהול משתמשים, ניהול venues
- [x] הוספת impersonation - התחברות בהתחזות והתנתקות
- [x] תיקון אוטנטיקציה - התנתקות, הרשמה תמיד כ-user
- [x] הוספת שיחזור סיסמא (מדומה, מוכן ל-mail)
- [x] עדכון middleware - הגנה על admin routes
- [x] בדיקת build, lint, ובדיקות
- [x] יצירת מודול admin-testing עם מבנה קבצים מלא (ui/, actions/, services/, types.ts, README.md)
- [x] יצירת API endpoints להרצת טסטים, בדיקת סטטוס, וקבלת תוצאות (/api/admin/tests/*)
- [x] יצירת שירותי הרצת טסטים (Vitest + Playwright) עם child_process
- [x] יצירת שירות לפורמט תוצאות ל-Markdown (רק תקלות)
- [x] יצירת קבצי config לפרודקשן (vitest.config.production.ts, playwright.config.production.ts)
- [x] הוספת טאב 'Testing' ל-AdminDashboard עם UI להרצת טסטים
- [x] יצירת UI להצגת תוצאות עם כפתור העתקה ל-Clipboard
- [x] עדכון טסטים קיימים לשימוש ב-URL פרודקשן במקום localhost
- [x] הוספת scripts ל-package.json להרצת טסטים על פרודקשן
- [x] הוספת בדיקות אבטחה (requireAdmin, rate limiting) ל-API endpoints
- [ ] עדכון seed - מחיקת admin user, השארת demo user בלבד
- [ ] יצירת מודול admin עם dashboard, ניהול משתמשים, ניהול venues
- [ ] הוספת impersonation - התחברות בהתחזות והתנתקות
- [ ] תיקון אוטנטיקציה - התנתקות, הרשמה תמיד כ-user
- [ ] הוספת שיחזור סיסמא (מדומה, מוכן ל-mail)
- [ ] עדכון middleware - הגנה על admin routes
- [ ] בדיקת build, lint, ובדיקות