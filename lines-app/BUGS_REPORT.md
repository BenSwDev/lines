# דוח באגים - 3 מודולים עיקריים

## תאריך: 2025-01-XX
## מודולים שנבדקו:
1. **LINES** (ליינים)
2. **FLOOR PLANS** (מפה כללית)
3. **ROLES & HIERARCHY** (תפקידים והיררכיה)

---

## 🐛 באגים שנמצאו

### 1. LINES MODULE

#### BUG #1: בעיה בלוגיקת יצירת occurrences בעדכון ליין
**מיקום**: `lines-app/src/modules/lines/actions/updateLine.ts:155`
**תיאור**: 
- בעת עדכון ליין, הפונקציה `generateSuggestions` נקראת ללא פרמטרים של `anchorDate` ו-`horizonMonths`
- זה גורם ליצירת occurrences מהתאריך הנוכחי ולא מתאריך ההתחלה של הליין
- בנוסף, זה יוצר occurrences רק ל-`DEFAULT_SUGGESTION_MONTHS` חודשים קדימה, ולא עד סוף השנה

**השפעה**: 
- בעת עדכון ליין, occurrences לא נוצרים נכון
- occurrences לא נוצרים עד סוף השנה כפי שצריך

**פתרון נדרש**: 
- צריך להעביר `anchorDate` (תאריך ההתחלה) ו-`horizonMonths` (עד סוף השנה) ל-`generateSuggestions`
- או לשנות את הלוגיקה ליצור occurrences עד סוף השנה כמו ב-`CreateLineDialog`

---

#### BUG #2: בעיה בלוגיקת יצירת occurrences ב-createLine
**מיקום**: `lines-app/src/modules/lines/actions/createLine.ts:64`
**תיאור**: 
- בעת יצירת ליין, הפונקציה `generateSuggestions` נקראת ללא פרמטרים של `anchorDate` ו-`horizonMonths`
- זה גורם ליצירת occurrences מהתאריך הנוכחי ולא מתאריך ההתחלה שנבחר
- בנוסף, זה יוצר occurrences רק ל-`DEFAULT_SUGGESTION_MONTHS` חודשים קדימה, ולא עד סוף השנה

**השפעה**: 
- בעת יצירת ליין, occurrences לא נוצרים נכון
- occurrences לא נוצרים עד סוף השנה כפי שצריך

**פתרון נדרש**: 
- צריך להעביר `anchorDate` (תאריך ההתחלה) ו-`horizonMonths` (עד סוף השנה) ל-`generateSuggestions`
- או לשנות את הלוגיקה ליצור occurrences עד סוף השנה כמו ב-`CreateLineDialog`

---

#### BUG #3: בעיה בעדכון occurrences בעדכון ליין
**מיקום**: `lines-app/src/modules/lines/actions/updateLine.ts:68-102`
**תיאור**: 
- בעת עדכון ליין, הלוגיקה מנסה ליצור occurrences מ-`selectedDates` ו-`manualDates`
- אבל אם לא נשלחו `selectedDates` או `manualDates`, הלוגיקה לא יוצרת occurrences חדשים
- בנוסף, אם נשלחו `daySchedules`, הלוגיקה מנסה ליצור occurrences מ-`generateSuggestions` אבל לא משתמשת בתאריך ההתחלה הנכון

**השפעה**: 
- בעת עדכון ליין, occurrences לא מתעדכנים נכון
- occurrences לא נוצרים עד סוף השנה כפי שצריך

**פתרון נדרש**: 
- צריך לתקן את הלוגיקה כך שתשתמש בתאריך ההתחלה הנכון
- צריך לוודא ש-occurrences נוצרים עד סוף השנה

---

#### BUG #4: בעיה בטעינת נתונים בעריכת ליין
**מיקום**: `lines-app/src/modules/lines/ui/CreateLineDialog.tsx:146-173`
**תיאור**: 
- בעת טעינת ליין קיים לעריכה, הפורם לא טוען את תאריך ההתחלה הנכון
- הפורם מגדיר `startDateMode` ל-"custom" אבל לא מגדיר את החודש והשנה הנכונים
- בנוסף, הפורם לא טוען את התאריך הראשון של הליין

**השפעה**: 
- בעת עריכת ליין, המשתמש לא רואה את תאריך ההתחלה הנכון
- המשתמש צריך לבחור מחדש את החודש והשנה

**פתרון נדרש**: 
- צריך לטעון את התאריך הראשון של הליין ולהגדיר את החודש והשנה בהתאם
- צריך להציג את התאריך הנכון בפורם

---

### 2. FLOOR PLANS MODULE

#### BUG #5: בעיה ב-revalidation paths
**מיקום**: `lines-app/src/modules/floor-plan-editor/actions/floorPlanActions.ts`
**תיאור**: 
- יש שימוש ב-`router.refresh()` במקומות רבים במקום `revalidatePath`
- זה יכול לגרום לבעיות cache ולא לעדכן את הדף נכון

**השפעה**: 
- שינויים לא מתעדכנים מיד בדף
- צריך לרענן את הדף ידנית

**פתרון נדרש**: 
- להחליף `router.refresh()` ב-`revalidatePath` במקומות המתאימים
- לוודא ש-revalidation paths נכונים

---

#### BUG #6: בעיה בטיפול בשגיאות
**מיקום**: `lines-app/src/modules/floor-plan-editor/actions/floorPlanActions.ts`
**תיאור**: 
- יש שימוש ב-`console.error` במקומות רבים במקום להחזיר שגיאות למשתמש
- זה יכול לגרום לבעיות debugging ולא לתת feedback למשתמש

**השפעה**: 
- משתמשים לא מקבלים feedback על שגיאות
- קשה לדבג בעיות

**פתרון נדרש**: 
- להחליף `console.error` ב-toast notifications או error messages
- לוודא שכל שגיאה מוחזרת למשתמש

---

### 3. ROLES & HIERARCHY MODULE

#### BUG #7: בעיה בעדכון תפקיד עם requiresManagement
**מיקום**: `lines-app/src/modules/roles-hierarchy/services/rolesService.ts:145-172`
**תיאור**: 
- בעת עדכון תפקיד עם `requiresManagement`, הלוגיקה יוצרת תפקיד ניהול חדש
- אבל אם התפקיד כבר היה עם `requiresManagement` והמשתמש משנה את השם, תפקיד הניהול לא מתעדכן
- בנוסף, אם המשתמש מסיר את `requiresManagement`, תפקיד הניהול נמחק אבל יכול להיות שיש קשרים אליו

**השפעה**: 
- תפקידי ניהול לא מתעדכנים נכון
- יכול להיות נתק בקשרים בין תפקידים

**פתרון נדרש**: 
- צריך לעדכן את תפקיד הניהול כשהתפקיד מתעדכן
- צריך לטפל נכון בהסרת תפקיד ניהול

---

#### BUG #8: בעיה ב-revalidation paths
**מיקום**: `lines-app/src/modules/roles-hierarchy/actions/roleActions.ts`
**תיאור**: 
- יש שימוש ב-`revalidatePath` אבל רק ל-`/venues/${venueId}/roles`
- אבל הדף הוא `/venues/${venueId}/settings/roles` ולא `/venues/${venueId}/roles`

**השפעה**: 
- שינויים לא מתעדכנים מיד בדף
- צריך לרענן את הדף ידנית

**פתרון נדרש**: 
- לתקן את ה-revalidation paths ל-`/venues/${venueId}/settings/roles`

---

## ❓ שאלות לשינויים לוגיים

### שאלה #1: לוגיקת יצירת occurrences
**שאלה**: 
האם הלוגיקה של יצירת occurrences צריכה להיות זהה ב-createLine ו-updateLine?

**הקשר**: 
כרגע יש שתי לוגיקות שונות:
1. ב-`CreateLineDialog` - יוצר occurrences עד סוף השנה
2. ב-`createLine` ו-`updateLine` - יוצר occurrences רק ל-`DEFAULT_SUGGESTION_MONTHS` חודשים

**הצעה**: 
לאחד את הלוגיקה כך שתמיד יוצרים occurrences עד סוף השנה

---

### שאלה #2: לוגיקת עדכון occurrences בעדכון ליין
**שאלה**: 
כשמעדכנים ליין, האם צריך למחוק את כל ה-occurrences הקיימים וליצור חדשים, או לעדכן רק את אלה שצריך?

**הקשר**: 
כרגע הלוגיקה מנסה ליצור occurrences חדשים אבל לא מוחקת את הישנים

**הצעה**: 
לשנות את הלוגיקה כך שתמחק occurrences ישנים ותיצור חדשים, או לעדכן רק את אלה שצריך

---

### שאלה #3: לוגיקת תפקידי ניהול
**שאלה**: 
כשמעדכנים תפקיד עם `requiresManagement`, האם צריך לעדכן את תפקיד הניהול הקיים או ליצור חדש?

**הקשר**: 
כרגע הלוגיקה יוצרת תפקיד ניהול חדש גם אם כבר קיים

**הצעה**: 
לשנות את הלוגיקה כך שתעדכן תפקיד ניהול קיים אם קיים, או ליצור חדש אם לא קיים

---

## 📋 סיכום

**סה"כ באגים שנמצאו**: 8
**באגים קריטיים**: 4 (BUG #1, #2, #3, #4)
**באגים לא קריטיים**: 4 (BUG #5, #6, #7, #8)

**שאלות לשינויים לוגיים**: 3

---

## 🔧 תוכנית תיקון

1. **תיקון BUG #1, #2, #3, #4** - לוגיקת occurrences
2. **תיקון BUG #5, #6** - revalidation ו-error handling
3. **תיקון BUG #7, #8** - תפקידי ניהול ו-revalidation paths
4. **תשובה לשאלות** - לאחר תשובות המשתמש

