# הגדרת Admin User

## ✅ אימות: השדה `role` קיים בטבלת `users`

השדה `role` קיים ופועל ב-Supabase:

- **שם השדה**: `role`
- **סוג**: `text`
- **ברירת מחדל**: `'user'`
- **ערכים אפשריים**: `'user'` או `'admin'`

## דרכים להפוך משתמש ל-Admin

### דרך 1: Script (מומלץ)

הרץ את הפקודה הבאה עם האימייל של המשתמש:

```bash
pnpm db:make-admin your-email@example.com
```

דוגמה:

```bash
pnpm db:make-admin demo@lines.app
```

### דרך 2: דרך Supabase Dashboard

1. היכנס ל-Supabase Dashboard
2. לך ל-Table Editor
3. בחר את הטבלה `users`
4. מצא את המשתמש לפי email
5. ערוך את השדה `role` מ-`user` ל-`admin`
6. שמור

**⚠️ הערה**: אם אתה רואה שגיאה עם `updated_at` בעת עריכה, זה בגלל trigger ישן. ה-trigger הוסר אוטומטית, אבל אם השגיאה עדיין מופיעה - רענן את הדף ונסה שוב. Prisma מטפל ב-`updatedAt` אוטומטית.

### דרך 3: דרך Prisma Studio

```bash
pnpm db:studio
```

1. פתח את הטבלה `users`
2. מצא את המשתמש
3. לחץ עליו לעריכה
4. שנה את `role` ל-`admin`
5. שמור

### דרך 4: SQL Query ישיר

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## אימות

לאחר השינוי:

1. התנתק מהמערכת
2. התחבר מחדש
3. בדוק שהתפריט מציג "ניהול מערכת"
4. גש ל-`/admin` לוודא שהגישה עובדת

## הגדרת מערכת Testing

### דרישות מוקדמות

1. **Vercel KV (Redis)** - צריך להיות מוגדר ב-Vercel project
2. **GitHub Personal Access Token** - עם permissions:
   - `actions:write`
   - `workflow:write`
   - `repo` (read access)
3. **GitHub Repository** - שם ה-repository בפורמט `owner/repo`

### Environment Variables

הוסף ב-Vercel Dashboard את ה-environment variables הבאים:

```
KV_URL=<vercel-kv-url>
KV_REST_API_URL=<vercel-kv-rest-api-url>
KV_REST_API_TOKEN=<vercel-kv-rest-api-token>
GITHUB_TOKEN=<github-personal-access-token>
GITHUB_REPO=<owner/repo>
WEBHOOK_SECRET=<random-secret-token>
WEBHOOK_URL=https://your-app.vercel.app/api/admin/tests/webhook
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### יצירת GitHub Personal Access Token

1. לך ל-GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. לחץ "Generate new token (classic)"
3. בחר permissions:
   - `repo` (full control)
   - `workflow` (write)
4. העתק את ה-token והדבק ב-`GITHUB_TOKEN`

### יצירת WEBHOOK_SECRET

הרץ את הפקודה הבאה ליצירת secret אקראי:

```bash
openssl rand -hex 32
```

או:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

הדבק את התוצאה ב-`WEBHOOK_SECRET`.

### בדיקה

1. היכנס ל-Admin Dashboard
2. לך לטאב "Testing"
3. לחץ "הרץ טסטים" - זה אמור להפעיל את ה-GitHub Actions workflow
4. בדוק ב-GitHub Actions שהעבודה רצה
5. לאחר סיום, התוצאות אמורות להופיע בממשק

## הערות

- רק משתמשים עם `role = 'admin'` יכולים לגשת ל-`/admin`
- Admin יכול לשנות תפקידים של משתמשים אחרים דרך ה-Admin Dashboard
- Admin לא יכול לשנות את התפקיד של עצמו (מניעת נעילה)
- תוצאות טסטים נשמרות ב-Redis למשך 30 ימים
- היסטוריה מוגבלת ל-50 הרצות אחרונות
