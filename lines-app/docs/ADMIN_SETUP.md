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

## הערות

- רק משתמשים עם `role = 'admin'` יכולים לגשת ל-`/admin`
- Admin יכול לשנות תפקידים של משתמשים אחרים דרך ה-Admin Dashboard
- Admin לא יכול לשנות את התפקיד של עצמו (מניעת נעילה)

