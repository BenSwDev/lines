# דוח מקיף: אי-התאמות בין Prisma Schema למסד הנתונים

**תאריך:** 2025-01-XX  
**מטרה:** זיהוי כל אי-ההתאמות שעלולות לגרום לשגיאות Prisma מהסוג "The column `.new` does not exist"

---

## 🔴 בעיות קריטיות שזוהו

### 1. טבלה `floor_plan_lines` קיימת במסד הנתונים אבל לא ב-Prisma Schema

**מצב:**

- ✅ קיימת במסד הנתונים: `floor_plan_lines`
- ❌ לא מופיעה ב-`prisma/schema.prisma`

**מבנה הטבלה במסד הנתונים:**

```sql
CREATE TABLE floor_plan_lines (
  floor_plan_id TEXT NOT NULL,
  line_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (floor_plan_id, line_id)
);
```

**השפעה:**

- Prisma Client לא מכיר את הטבלה הזו
- כל ניסיון לעדכן relationships בין FloorPlan ל-Line עלול להיכשל
- יכול לגרום לשגיאות "column does not exist" כאשר Prisma מנסה לעדכן relationships

**פתרון:**

1. להוסיף את הטבלה ל-Prisma schema כ-implicit many-to-many
2. או להסיר את הטבלה אם היא לא בשימוש (לבדוק אם יש foreign keys)

---

## 🔍 בדיקות נוספות נדרשות

### 2. בדיקת כל העמודות במסד הנתונים מול Schema

**טבלאות לבדיקה:**

- `zones` - יש 23 עמודות במסד הנתונים
- `lines` - יש 11 עמודות במסד הנתונים
- `tables` - יש 17 עמודות במסד הנתונים
- `floor_plans` - יש 8 עמודות במסד הנתונים
- `roles` - יש 17 עמודות במסד הנתונים

**צריך לבדוק:**

- האם כל העמודות במסד הנתונים מופיעות ב-schema עם שמות נכונים (camelCase vs snake_case)
- האם יש עמודות ב-schema שלא קיימות במסד הנתונים

---

### 3. בדיקת Relationships

**בעיות אפשריות:**

- Relationships ב-schema שלא תואמים למבנה במסד הנתונים
- Foreign keys במסד הנתונים שלא מופיעים ב-schema
- Implicit many-to-many tables שלא מוגדרות ב-schema

---

### 4. בעיית השגיאה "The column `.new` does not exist"

**השערות:**

1. **Prisma מנסה לעדכן relationship בשם `new`** - יכול להיות שמישהו ניסה לעדכן relationship שלא קיים
2. **בעיה ב-Prisma Client** - אולי יש גרסה לא מסונכרנת של Prisma Client
3. **בעיה ב-migration** - אולי יש migration שלא רץ או רץ חלקית

**צריך לבדוק:**

- כל השימושים ב-`prisma.zone.update()` ו-`prisma.line.update()`
- האם יש ניסיונות לעדכן relationships שלא קיימים
- האם יש שדות ב-data object שלא קיימים ב-schema

---

## 📋 תוכנית תיקון מקצה לקצה

### שלב 1: סנכרון Prisma Schema עם מסד הנתונים

1. **להוסיף את `floor_plan_lines` ל-schema:**

   ```prisma
   model FloorPlanLine {
     floorPlanId String   @map("floor_plan_id")
     lineId      String   @map("line_id")
     createdAt   DateTime @default(now()) @map("created_at")

     floorPlan FloorPlan @relation(fields: [floorPlanId], references: [id], onDelete: Cascade)
     line      Line      @relation(fields: [lineId], references: [id], onDelete: Cascade)

     @@id([floorPlanId, lineId])
     @@map("floor_plan_lines")
   }
   ```

2. **לעדכן את ה-models הקשורים:**
   - להוסיף `floorPlanLines FloorPlanLine[]` ל-`FloorPlan`
   - להוסיף `floorPlanLines FloorPlanLine[]` ל-`Line`

### שלב 2: בדיקת כל העמודות

1. להריץ migration check:

   ```bash
   pnpm prisma migrate dev --create-only --name sync_schema
   ```

2. לבדוק את ה-diff ולראות מה חסר

### שלב 3: תיקון כל ה-Repositories

1. לבדוק שכל ה-repositories משתמשים רק בשדות שקיימים ב-schema
2. לוודא שכל ה-relationships מוגדרים נכון

### שלב 4: בדיקת Prisma Client

1. לרוץ `pnpm prisma generate` מחדש
2. לוודא שהגרסה של Prisma Client תואמת ל-schema

### שלב 5: בדיקת Migrations

1. לבדוק שכל ה-migrations רצו בהצלחה
2. לבדוק אם יש migrations שלא רצו

---

## 🚨 בעיות נוספות שזוהו

### בעיה: שימוש ב-`floor_plan_lines` בקוד

**מיקום:** `lines-app/src/modules/floor-plan-editor/services/floorPlanService.ts`

**קוד בעייתי:**

- השירות משתמש ב-`prisma.line.updateMany()` כדי לעדכן `floorPlanId` ישירות
- אבל יש גם טבלת `floor_plan_lines` שמצביעה על many-to-many relationship

**צריך להחליט:**

- האם ה-relationship הוא 1:1 (Line -> FloorPlan) או Many-to-Many?
- אם זה 1:1, צריך להסיר את `floor_plan_lines`
- אם זה Many-to-Many, צריך לעדכן את ה-schema והקוד

---

## ✅ המלצות מיידיות

1. **להוסיף את `floor_plan_lines` ל-schema** - זה הפתרון המיידי
2. **לבדוק את כל ה-migrations** - לוודא שכולם רצו
3. **לרוץ `pnpm prisma generate`** - לרענן את Prisma Client
4. **לבדוק את כל ה-repositories** - לוודא שהם לא משתמשים בשדות שלא קיימים

---

## 📝 הערות

- השגיאה "The column `.new` does not exist" יכולה להיות קשורה ל-Prisma relationships
- Prisma משתמש ב-`.new` פנימית לעדכון relationships, אבל אם ה-relationship לא מוגדר נכון, זה יכול להיכשל
- הטבלה `floor_plan_lines` היא many-to-many implicit table, אבל היא לא מוגדרת ב-schema

---

## 🔍 ממצאים נוספים

### בעיה: אי-התאמה בין Schema למסד הנתונים - Line ↔ FloorPlan

**מצב נוכחי:**

- ב-Schema: `Line` יש `floorPlanId` (1:1 relationship)
- במסד הנתונים: יש גם `floor_plan_id` ב-`lines` וגם טבלת `floor_plan_lines` (many-to-many)

**זה אומר:**

- יש שני מנגנונים שונים ל-linking בין Line ל-FloorPlan
- זה יכול לגרום לבלבול ולשגיאות

**צריך להחליט:**

1. אם זה 1:1 - להסיר את `floor_plan_lines`
2. אם זה Many-to-Many - להסיר את `floorPlanId` מ-`Line` ולהוסיף את `floor_plan_lines` ל-schema

---

## ✅ סיכום בעיות קריטיות

1. ✅ **טבלה `floor_plan_lines` לא מופיעה ב-schema** - זה הבעיה העיקרית
2. ⚠️ **אי-התאמה בין 1:1 ל-Many-to-Many** - צריך להחליט על המבנה הנכון
3. ⚠️ **Prisma Client לא מסונכרן** - צריך לרוץ `prisma generate` מחדש

---

## 🚀 תוכנית תיקון מפורטת

### שלב 1: תיקון מיידי (למניעת שגיאות)

**החלטה:** להסיר את `floor_plan_lines` כי היא לא בשימוש (0 שורות, הקוד משתמש ב-`floorPlanId` ישירות)

1. **להסיר את הטבלה `floor_plan_lines` מהמסד הנתונים:**

   ```sql
   DROP TABLE IF EXISTS floor_plan_lines CASCADE;
   ```

2. **לרוץ `pnpm prisma generate`** - לרענן את Prisma Client

3. **לבדוק שאין שגיאות Prisma** - לבדוק שהכל עובד

### שלב 2: החלטה על המבנה ✅

**החלטה:** ✅ 1:1 (Line → FloorPlan) - הקוד משתמש ב-`floorPlanId` ישירות

**פעולות:**

- ✅ להסיר את `floor_plan_lines` (לא בשימוש)
- ✅ להשאיר רק `floorPlanId` ב-`Line` (כפי שזה עכשיו)

### שלב 3: תיקון הקוד ✅

**מצב:** הקוד כבר משתמש ב-`floorPlanId` ישירות (1:1) - אין צורך בשינויים בקוד

**פעולות:**

- ✅ הקוד כבר נכון - משתמש ב-`prisma.line.updateMany()` עם `floorPlanId`
- ✅ אין צורך בשינויים בקוד

### שלב 4: בדיקות

1. לבדוק שכל ה-migrations רצו
2. לבדוק שכל ה-repositories עובדים
3. לבדוק שכל ה-relationships מוגדרים נכון
4. לבדוק שאין שגיאות Prisma

---

## 📋 רשימת בדיקות

- [x] ✅ לזהות את הבעיה - `floor_plan_lines` קיימת במסד הנתונים אבל לא בשימוש
- [x] ✅ להחליט על המבנה - 1:1 (Line → FloorPlan) עם `floorPlanId`
- [ ] 🔄 להסיר את `floor_plan_lines` מהמסד הנתונים
- [ ] 🔄 לרוץ `pnpm prisma generate`
- [ ] 🔄 לבדוק שכל ה-migrations רצו
- [ ] 🔄 לבדוק שכל ה-repositories עובדים
- [ ] 🔄 לבדוק שאין שגיאות Prisma
- [ ] 🔄 לבדוק שהכל עובד בפרודקשן

---

## 🎯 סיכום סופי

### בעיות שזוהו:

1. ✅ **טבלה `floor_plan_lines` קיימת במסד הנתונים אבל לא ב-schema ולא בשימוש**
   - הטבלה ריקה (0 שורות)
   - הקוד משתמש ב-`floorPlanId` ישירות (1:1)
   - זה יכול לגרום לבעיות כאשר Prisma מנסה לעדכן relationships

### פתרון:

1. **להסיר את `floor_plan_lines` מהמסד הנתונים** - זה הפתרון הנכון כי היא לא בשימוש
2. **לרוץ `pnpm prisma generate`** - לרענן את Prisma Client
3. **לבדוק שאין שגיאות Prisma** - לבדוק שהכל עובד

### הערה על השגיאה "The column `.new` does not exist":

- השגיאה יכולה להיות קשורה ל-Prisma relationships
- Prisma משתמש ב-`.new` פנימית לעדכון relationships
- אם יש טבלאות במסד הנתונים שלא מופיעות ב-schema, זה יכול לגרום לבעיות
- הסרת `floor_plan_lines` אמורה לפתור את הבעיה
