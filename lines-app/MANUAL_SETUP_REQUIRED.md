# Manual Setup Required

## ✅ מה שכבר הוגדר אוטומטית:

### Vercel Environment Variables (Production):

- ✅ `GITHUB_REPO` = `BenSwDev/lines`
- ✅ `WEBHOOK_SECRET` = `b18e0a77ed6990e6285f8c4722d0a38dd17c57e4855fd8d6be407736aea492ac`
- ✅ `WEBHOOK_URL` = `https://lines-oakc87uhm-ben-swissa.vercel.app/api/admin/tests/webhook`
- ✅ `NEXT_PUBLIC_APP_URL` = `https://lines-oakc87uhm-ben-swissa.vercel.app`

### GitHub Secrets:

- ✅ `WEBHOOK_URL` = `https://lines-oakc87uhm-ben-swissa.vercel.app/api/admin/tests/webhook`
- ✅ `WEBHOOK_SECRET` = `b18e0a77ed6990e6285f8c4722d0a38dd17c57e4855fd8d6be407736aea492ac`
- ✅ `NEXT_PUBLIC_APP_URL` = `https://lines-oakc87uhm-ben-swissa.vercel.app`

---

## ⚠️ מה שצריך לעשות ידנית (2 דברים בלבד):

### 1. יצירת Vercel KV (Redis) וקבלת פרטי חיבור

1. לך ל: https://vercel.com/dashboard
2. בחר את הפרויקט: `lines-app`
3. לך לטאב **Storage**
4. לחץ **Create Database** → בחר **KV**
5. שם: `lines-kv`
6. בחר region (למשל `iad1`)
7. לחץ **Create**

לאחר היצירה:

1. לחץ על ה-KV database שיצרת
2. לך לטאב **Settings**
3. העתק את:
   - `KV_URL` (או `KV_REST_API_URL`)
   - `KV_REST_API_TOKEN`

4. הרץ את הפקודות הבאות:

```bash
cd lines-app
# הגדר KV_URL
echo "<העתק-מהדאשבורד>" | vercel env add KV_URL production

# הגדר KV_REST_API_URL (אם קיים)
echo "<העתק-מהדאשבורד>" | vercel env add KV_REST_API_URL production

# הגדר KV_REST_API_TOKEN
echo "<העתק-מהדאשבורד>" | vercel env add KV_REST_API_TOKEN production
```

---

### 2. יצירת GitHub Personal Access Token עם הרשאות workflow

1. לך ל: https://github.com/settings/tokens/new
2. שם: `Lines App - Testing Workflow`
3. Expiration: בחר תקופה (למשל 90 days או No expiration)
4. סמן את ה-scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. לחץ **Generate token**
6. **העתק את ה-token מיד!** (לא תוכל לראות אותו שוב)

7. הרץ את הפקודה:

```bash
cd lines-app
echo "<הדבק-את-ה-token>" | vercel env add GITHUB_TOKEN production
```

---

### 3. (אופציונלי) וידוא ש-POSTGRES_PRISMA_URL קיים ב-GitHub Secrets

אם עדיין לא קיים, הוסף:

```bash
gh secret set POSTGRES_PRISMA_URL --body "<your-database-url>" --repo BenSwDev/lines
```

---

## ✅ לאחר ההגדרה:

1. **Redeploy ב-Vercel:**

   ```bash
   cd lines-app
   vercel deploy --prod
   ```

2. **בדיקה:**
   - לך ל: `https://lines-oakc87uhm-ben-swissa.vercel.app/admin`
   - לך לטאב "הרצת טסטים"
   - לחץ "הרץ טסטים" - זה אמור לעבוד!

---

## סיכום

**מה הוגדר:** כל משתני הסביבה פרט ל-KV ו-GitHub Token  
**מה צריך לעשות:** רק 2 דברים:

1. ליצור Vercel KV ולהגדיר את הפרטים (3 משתנים)
2. ליצור GitHub Token ולהגדיר אותו (1 משתנה)

אחרי זה הכל יעבוד! 🚀
