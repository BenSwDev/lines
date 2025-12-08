# ניתוח מלא: מעבר מ-Venue Map ל-Venue Settings
## מקצה לקצה - האפליקציה כולה והשינויים הנדרשים

**תאריך:** 2025-01-XX  
**גרסה:** 1.0.0  
**סטטוס:** ניתוח והמלצות

---

## 📋 תוכן עניינים

1. [מבנה האפליקציה הנוכחי](#1-מבנה-האפליקציה-הנוכחי)
2. [מודולים קיימים - ניתוח מפורט](#2-מודולים-קיימים---ניתוח-מפורט)
3. [מודל הנתונים הנוכחי](#3-מודל-הנתונים-הנוכחי)
4. [החזון החדש: Venue Settings](#4-החזון-החדש-venue-settings)
5. [שינויים נדרשים במסד הנתונים](#5-שינויים-נדרשים-במסד-הנתונים)
6. [שינויים נדרשים במודולים](#6-שינויים-נדרשים-במודולים)
7. [תוכנית מימוש](#7-תוכנית-מימוש)
8. [התוצאה הסופית](#8-התוצאה-הסופית)

---

## 1. מבנה האפליקציה הנוכחי

### 1.1 ארכיטקטורה כללית

```
lines-app/
├── src/
│   ├── app/                    # Next.js App Router - Routing בלבד
│   │   └── venues/[venueId]/
│   │       ├── map/            # ❌ יוחלף ב-settings/
│   │       ├── lines/          # ✅ נשאר
│   │       ├── calendar/       # ✅ נשאר
│   │       ├── info/           # ✅ נשאר
│   │       ├── roles/          # ✅ נשאר
│   │       └── reservations/   # ✅ נשאר
│   │
│   ├── modules/                # מודולי עסק - Self-contained
│   │   ├── venue-map/          # ❌ יוחלף ב-venue-settings/
│   │   ├── lines/              # ✅ נשאר
│   │   ├── calendar/           # ✅ נשאר
│   │   ├── venue-info/         # ✅ נשאר
│   │   ├── roles-hierarchy/    # ✅ נשאר
│   │   └── reservation-settings/ # ✅ נשאר
│   │
│   ├── core/                   # תשתית משותפת
│   │   ├── db/                 # Repositories
│   │   ├── integrations/       # Prisma, etc.
│   │   ├── auth/               # NextAuth
│   │   └── i18n/               # תרגומים
│   │
│   └── shared/                 # רכיבי UI משותפים
│
├── prisma/
│   └── schema.prisma           # מודל הנתונים
│
└── docs/                       # תיעוד
```

### 1.2 זרימת נתונים כללית

```
User Action
    ↓
UI Component (modules/*/ui/)
    ↓
Server Action (modules/*/actions/)
    ↓
Service Layer (modules/*/services/)
    ↓
Repository (core/db/repositories/)
    ↓
Database (PostgreSQL via Prisma)
```

---

## 2. מודולים קיימים - ניתוח מפורט

### 2.1 `venue-map` (יוחלף)

**מיקום:** `src/modules/venue-map/`

**תפקיד נוכחי:**
- ניהול מפה ויזואלית של המקום
- עורך אינטראקטיבי עם drag & drop
- ניהול zones, tables, bars, special areas
- טמפלטים למפות

**מבנה:**
```
venue-map/
├── ui/
│   ├── FloorPlanEditor.tsx      # העורך הראשי (חדש)
│   ├── FloorPlanEditorV2.tsx    # העורך הישן (6490 שורות!)
│   ├── VenueMapPage.tsx         # דף המפה
│   ├── Sidebar/                 # Sidebar components
│   ├── Elements/                # רכיבי אלמנטים (Table, Zone, etc.)
│   ├── FloorPlanCanvas/         # Canvas components
│   └── AddElement/              # דיאלוגים להוספת אלמנטים
├── actions/
│   ├── floorPlanActions.ts      # Server actions לשמירה/טעינה
│   └── templateActions.ts       # פעולות טמפלטים
├── hooks/                       # Custom hooks
├── utils/                       # פונקציות עזר
└── types/                       # TypeScript types
```

**בעיות:**
- ❌ קובץ אחד ענק (FloorPlanEditorV2.tsx - 6490 שורות)
- ❌ אין הפרדה בין "מבנה" ל"הגדרות"
- ❌ אין קשר ל-Lines
- ❌ אין תמיכה במפות מרובות
- ❌ Canvas לא נוח למשתמש

**מה נשמור:**
- ✅ כל רכיבי ה-UI (Elements, Canvas, Sidebar)
- ✅ כל ה-hooks (useDragAndDrop, useTransform, etc.)
- ✅ כל ה-utils (zoneContainment, smartDefaults, etc.)
- ✅ כל ה-actions (floorPlanActions)

**מה נשנה:**
- 🔄 שם המודול: `venue-map` → `venue-settings`
- 🔄 מבנה היררכי: מפה אחת → מפות מרובות
- 🔄 קשר ל-Lines: Line חייב מפה אחת
- 🔄 קשר ל-Events: Event יכול מפה מותאמת

---

### 2.2 `lines` (נשאר עם שינויים)

**מיקום:** `src/modules/lines/`

**תפקיד נוכחי:**
- ניהול Lines (שעות פעילות, ימים, תדירות)
- יצירת LineOccurrences
- הגדרות הזמנות לכל Line

**מבנה:**
```
lines/
├── ui/
│   ├── LinesTab.tsx            # רשימת Lines
│   ├── LineCard.tsx            # כרטיס Line
│   ├── CreateLineDialog.tsx   # יצירת Line חדש
│   └── LineDetailPage.tsx     # דף פרטי Line
├── actions/
│   ├── createLine.ts
│   ├── updateLine.ts
│   ├── getLine.ts
│   └── listLines.ts
├── services/
│   ├── linesService.ts
│   └── lineScheduleService.ts
└── schemas/
    └── lineSchemas.ts
```

**שינויים נדרשים:**
- ➕ הוספת `floorPlanId` ל-Line (חובה)
- ➕ UI לבחירת מפה בעת יצירת Line
- ➕ הצגת המפה בדף Line

**מודל נתונים נוכחי:**
```prisma
model Line {
  id        String
  venueId   String
  name      String
  days      Int[]
  startTime String
  endTime   String
  frequency String
  color     String
  // ❌ חסר: floorPlanId
}
```

**מודל נתונים חדש:**
```prisma
model Line {
  id          String
  venueId     String
  floorPlanId String  // ➕ חובה - Line חייב מפה
  name        String
  days        Int[]
  startTime   String
  endTime     String
  frequency   String
  color       String
  floorPlan   FloorPlan @relation(...)
}
```

---

### 2.3 `events` / `line-occurrences` (נשאר עם שינויים)

**מיקום:** `src/modules/events/`

**תפקיד נוכחי:**
- הצגת פרטי אירוע (LineOccurrence)
- ניהול סטטוס אירוע

**שינויים נדרשים:**
- ➕ הוספת `customFloorPlanId` ל-LineOccurrence (אופציונלי)
- ➕ UI לבחירת מפה מותאמת לאירוע
- ➕ הצגת המפה בדף אירוע

**מודל נתונים נוכחי:**
```prisma
model LineOccurrence {
  id          String
  lineId      String
  venueId     String
  date        String
  startTime   String
  endTime     String
  // ❌ חסר: customFloorPlanId
}
```

**מודל נתונים חדש:**
```prisma
model LineOccurrence {
  id              String
  lineId          String
  venueId         String
  customFloorPlanId String?  // ➕ אופציונלי - מפה מותאמת לאירוע
  date            String
  startTime       String
  endTime         String
  customFloorPlan FloorPlan? @relation(...)
}
```

---

### 2.4 `roles-hierarchy` (נשאר)

**מיקום:** `src/modules/roles-hierarchy/`

**תפקיד נוכחי:**
- ניהול תפקידים והיררכיה
- יצירת departments ו-roles
- תצוגה היררכית

**מבנה:**
```
roles-hierarchy/
├── ui/
│   ├── RolesHierarchyPage.tsx
│   ├── HierarchyView.tsx
│   ├── RoleCard.tsx
│   └── CreateRoleDialog.tsx
├── services/
│   ├── rolesService.ts
│   └── hierarchyService.ts
└── actions/
    └── roleActions.ts
```

**שינויים נדרשים:**
- ✅ אין שינויים - נשאר כפי שהוא
- 🔗 יקושר ל-Venue Settings (סידור עבודה)

---

### 2.5 `venue-info` (נשאר)

**מיקום:** `src/modules/venue-info/`

**תפקיד נוכחי:**
- ניהול פרטי קשר של המקום
- טלפון, אימייל, כתובת

**שינויים נדרשים:**
- ✅ אין שינויים - נשאר כפי שהוא

---

### 2.6 `reservation-settings` (נשאר)

**מיקום:** `src/modules/reservation-settings/`

**תפקיד נוכחי:**
- הגדרות הזמנות כלליות למקום
- הגדרות הזמנות לכל Line
- בניית טופס הזמנה

**שינויים נדרשים:**
- ✅ אין שינויים - נשאר כפי שהוא
- 🔗 יקושר ל-Venue Settings (מינימום הזמנה)

---

## 3. מודל הנתונים הנוכחי

### 3.1 מבנה Venue → Zones → Tables

```
Venue (1)
  ├── VenueDetails (1:1)
  ├── Menu[] (1:N)
  ├── Zone[] (1:N)          # ❌ קשור ישירות ל-Venue
  │   └── Table[] (1:N)     # ❌ קשור ל-Zone
  ├── Line[] (1:N)
  │   └── LineOccurrence[] (1:N)
  ├── VenueArea[] (1:N)     # ❌ קשור ישירות ל-Venue
  └── Role[] (1:N)
```

**בעיות:**
- ❌ אין מושג "מפה" (FloorPlan) - הכל קשור ישירות ל-Venue
- ❌ אין אפשרות למפות מרובות
- ❌ אין קשר בין Line למפה
- ❌ אין קשר בין Event למפה

---

## 4. החזון החדש: Venue Settings

### 4.1 היררכיה חדשה

```
Venue Settings (הגדרת מקום)
  │
  ├── 1. Lines (ליינים)                    # ✅ קיים - נשאר
  │   └── שעות פעילות, ימים, תדירות
  │
  ├── 2. Roles & Hierarchy (תפקידים)      # ✅ קיים - נשאר
  │   └── היררכיית תפקידים
  │
  ├── 3. Structure (מבנה)                 # 🆕 חדש - מפות
  │   ├── Floor Plan 1 (מפה בסיסית)
  │   ├── Floor Plan 2 (מפה לאירועים)
  │   └── Floor Plan 3 (מפה מותאמת)
  │       ├── Layout (עיצוב)              # 🔄 מה-venue-map
  │       │   ├── Zones (איזורים)
  │       │   ├── Tables (שולחנות)
  │       │   ├── Bars (ברים)
  │       │   └── Special Areas (אזורים מיוחדים)
  │       │
  │       ├── Content (תכולה)              # 🆕 חדש
  │       │   ├── Zone Settings
  │       │   │   ├── Name
  │       │   │   ├── Number (מספר איזור)
  │       │   │   ├── Table Count
  │       │   │   └── Auto-numbering rules
  │       │   ├── Table Settings
  │       │   │   ├── Seats per table
  │       │   │   ├── Table numbers
  │       │   │   └── Individual/Default
  │       │   └── Bar Settings
  │       │       ├── Name
  │       │       ├── Capacity
  │       │       └── Number
  │       │
  │       ├── Staffing (סידור עבודה)      # 🆕 חדש
  │       │   ├── Zone Staffing
  │       │   │   └── Roles needed per zone
  │       │   ├── Table Staffing
  │       │   │   └── Roles needed per table
  │       │   └── Bar Staffing
  │       │       └── Roles needed per bar
  │       │
  │       └── Minimum Order (מינימום הזמנה) # 🆕 חדש
  │           ├── Zone Minimum
  │           ├── Table Minimum
  │           └── Line Overrides
  │
  └── 4. General Settings (הגדרות כלליות)  # ✅ קיים
      ├── Venue Info
      ├── Reservation Settings
      └── Menus
```

### 4.2 זרימת עבודה חדשה

```
1. יצירת Venue
   ↓
2. הגדרת Lines (חובה)
   ↓
3. הגדרת Roles & Hierarchy (חובה)
   ↓
4. יצירת Floor Plan (מבנה)
   │
   ├── 4.1 Layout (עיצוב)
   │   └── בניית המפה: איזורים, שולחנות, ברים
   │
   ├── 4.2 Content (תכולה)
   │   └── הגדרת כמויות, מספור, שמות
   │
   ├── 4.3 Staffing (סידור עבודה)
   │   └── כמה עובדים בכל איזור/שולחן/בר
   │
   └── 4.4 Minimum Order (מינימום הזמנה)
       └── מינימום הזמנה לכל איזור/שולחן
   ↓
5. קישור Line למפה (חובה)
   ↓
6. (אופציונלי) יצירת מפה מותאמת לאירוע
```

### 4.3 כללי עסק חדשים

1. **מפה חובה למקום:**
   - לכל Venue חייבת להיות לפחות מפה אחת
   - ניתן ליצור מפות מרובות (לצרכים שונים)

2. **Line → Floor Plan:**
   - כל Line חייב להיות קשור למפה אחת (חובה)
   - Line לא יכול להתקיים ללא מפה

3. **Event → Floor Plan:**
   - Event יכול להשתמש במפה של ה-Line שלו (ברירת מחדל)
   - Event יכול להיות עם מפה מותאמת אישית (אופציונלי)

4. **מבנה נעול:**
   - אחרי בניית Layout, המבנה נעול
   - ניתן לערוך רק Content, Staffing, Minimum Order
   - עריכת Layout רק במצב "עריכה" מיוחד

5. **איזורים:**
   - איזור = מקיף שולחנות צמודים (כמו נחש)
   - רשימה: איזור + כמות שולחנות
   - איזורים מיוחדים = קבועים, לא לעריכה

---

## 5. שינויים נדרשים במסד הנתונים

### 5.1 מודל FloorPlan (חדש)

```prisma
model FloorPlan {
  id          String   @id @default(cuid())
  venueId     String
  name        String   // שם המפה (לדוגמה: "מפה בסיסית", "מפה לאירועים")
  description String?
  isDefault   Boolean  @default(false) // האם זו המפה ברירת המחדל
  isLocked    Boolean  @default(false) // האם המבנה נעול
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  venue       Venue              @relation(fields: [venueId], references: [id], onDelete: Cascade)
  zones       Zone[]            // ➕ Zones קשורים למפה
  lines       Line[]            // ➕ Lines קשורים למפה
  occurrences LineOccurrence[]   // ➕ Events עם מפה מותאמת

  @@index([venueId])
  @@index([venueId, isDefault])
  @@map("floor_plans")
}
```

### 5.2 שינוי Zone

```prisma
model Zone {
  id            String
  floorPlanId   String      // ➕ שינוי: מ-venueId ל-floorPlanId
  name          String
  color         String
  description   String?
  // Visual layout
  positionX     Decimal?
  positionY     Decimal?
  width         Decimal?
  height        Decimal?
  shape         String?
  polygonPoints Json?
  // Content settings (תכולה)
  zoneNumber    Int?        // ➕ מספר איזור
  tableCount    Int?        // ➕ כמות שולחנות (auto-calculated)
  // Staffing (סידור עבודה)
  staffingRules Json?       // ➕ { roleId: count }[]
  // Pricing
  zoneMinimumPrice Decimal?
  createdAt     DateTime
  updatedAt     DateTime

  // Relationships
  floorPlan     FloorPlan   @relation(...)  // ➕ שינוי
  tables        Table[]
  // ❌ הסרה: venue

  @@index([floorPlanId])
  @@map("zones")
}
```

### 5.3 שינוי Table

```prisma
model Table {
  id        String
  zoneId    String
  name      String
  seats     Int?
  notes     String?
  // Visual layout
  positionX Decimal?
  positionY Decimal?
  width     Decimal?
  height    Decimal?
  rotation  Decimal?
  shape     String?
  tableType String?
  // Content settings (תכולה)
  tableNumber  Int?        // ➕ מספר שולחן
  // Staffing (סידור עבודה)
  staffingRules Json?      // ➕ { roleId: count }[]
  // Pricing
  minimumPrice Decimal?
  createdAt DateTime
  updatedAt DateTime

  // Relationships
  zone Zone @relation(...)

  @@index([zoneId])
  @@map("tables")
}
```

### 5.4 שינוי VenueArea

```prisma
model VenueArea {
  id        String
  floorPlanId String    // ➕ שינוי: מ-venueId ל-floorPlanId
  areaType  String
  name      String
  // Visual layout
  positionX Decimal
  positionY Decimal
  width     Decimal
  height     Decimal
  rotation  Decimal?
  shape     String?
  icon      String?
  color     String?
  createdAt DateTime
  updatedAt DateTime

  // Relationships
  floorPlan FloorPlan @relation(...)  // ➕ שינוי
  // ❌ הסרה: venue

  @@index([floorPlanId])
  @@map("venue_areas")
}
```

### 5.5 שינוי Line

```prisma
model Line {
  id          String
  venueId     String
  floorPlanId String    // ➕ חובה - Line חייב מפה
  name        String
  days        Int[]
  startTime   String
  endTime     String
  frequency   String
  color       String
  createdAt   DateTime
  updatedAt   DateTime

  // Relationships
  venue       Venue       @relation(...)
  floorPlan   FloorPlan   @relation(...)  // ➕ חדש
  occurrences LineOccurrence[]
  // ... rest

  @@index([venueId])
  @@index([floorPlanId])  // ➕ חדש
  @@map("lines")
}
```

### 5.6 שינוי LineOccurrence

```prisma
model LineOccurrence {
  id                String
  lineId            String
  venueId           String
  customFloorPlanId String?  // ➕ אופציונלי - מפה מותאמת לאירוע
  date              String
  startTime         String
  endTime           String
  isExpected        Boolean
  isActive          Boolean
  title             String?
  subtitle          String?
  description       String?
  location          String?
  contact           String?
  createdAt         DateTime
  updatedAt         DateTime

  // Relationships
  line              Line        @relation(...)
  venue             Venue       @relation(...)
  customFloorPlan   FloorPlan?  @relation(...)  // ➕ חדש

  @@unique([lineId, date])
  @@index([venueId])
  @@index([lineId])
  @@index([customFloorPlanId])  // ➕ חדש
  @@map("line_occurrences")
}
```

### 5.7 מודל StaffingRule (חדש - אופציונלי)

```prisma
model StaffingRule {
  id        String   @id @default(cuid())
  floorPlanId String
  targetType  String   // "zone" | "table" | "bar"
  targetId    String   // ID של Zone/Table/Bar
  roleId      String
  count       Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  floorPlan   FloorPlan @relation(...)
  role        Role      @relation(...)

  @@index([floorPlanId])
  @@index([targetType, targetId])
  @@map("staffing_rules")
}
```

**או פשוט יותר - JSON ב-Zone/Table:**

```prisma
// ב-Zone:
staffingRules Json?  // { [roleId]: count }[]

// ב-Table:
staffingRules Json?  // { [roleId]: count }[]
```

---

## 6. שינויים נדרשים במודולים

### 6.1 `venue-map` → `venue-settings`

**שינוי שם:**
```
src/modules/venue-map/  →  src/modules/venue-settings/
```

**מבנה חדש:**
```
venue-settings/
├── ui/
│   ├── VenueSettingsPage.tsx        # 🆕 דף ראשי עם tabs
│   │
│   ├── tabs/
│   │   ├── LinesTab.tsx            # ✅ מ-lines (או import)
│   │   ├── RolesTab.tsx            # ✅ מ-roles-hierarchy (או import)
│   │   ├── StructureTab.tsx        # 🆕 חדש - ניהול מפות
│   │   └── GeneralTab.tsx          # ✅ מ-venue-info (או import)
│   │
│   ├── structure/
│   │   ├── FloorPlansList.tsx      # 🆕 רשימת מפות
│   │   ├── FloorPlanEditor.tsx     # 🔄 מ-venue-map (שיפור)
│   │   │
│   │   ├── layout/
│   │   │   ├── LayoutEditor.tsx    # 🔄 מה-FloorPlanEditor
│   │   │   └── [כל הקבצים מה-venue-map]
│   │   │
│   │   ├── content/
│   │   │   ├── ContentEditor.tsx    # 🆕 עורך תכולה
│   │   │   ├── ZoneContentPanel.tsx
│   │   │   ├── TableContentPanel.tsx
│   │   │   └── BarContentPanel.tsx
│   │   │
│   │   ├── staffing/
│   │   │   ├── StaffingEditor.tsx  # 🆕 עורך סידור עבודה
│   │   │   └── StaffingPanel.tsx
│   │   │
│   │   └── minimum-order/
│   │       ├── MinimumOrderEditor.tsx  # 🆕 עורך מינימום הזמנה
│   │       └── MinimumOrderPanel.tsx
│   │
│   └── [כל הקבצים מה-venue-map/ui]
│
├── actions/
│   ├── floorPlanActions.ts         # 🔄 עדכון - תמיכה במפות מרובות
│   ├── contentActions.ts           # 🆕 חדש - ניהול תכולה
│   ├── staffingActions.ts         # 🆕 חדש - ניהול סידור עבודה
│   └── minimumOrderActions.ts     # 🆕 חדש - ניהול מינימום הזמנה
│
├── services/
│   ├── floorPlanService.ts         # 🆕 חדש - לוגיקת מפות
│   ├── contentService.ts           # 🆕 חדש - לוגיקת תכולה
│   ├── staffingService.ts         # 🆕 חדש - לוגיקת סידור עבודה
│   └── minimumOrderService.ts     # 🆕 חדש - לוגיקת מינימום הזמנה
│
├── schemas/
│   ├── floorPlanSchemas.ts         # 🆕 חדש
│   ├── contentSchemas.ts           # 🆕 חדש
│   ├── staffingSchemas.ts         # 🆕 חדש
│   └── minimumOrderSchemas.ts     # 🆕 חדש
│
└── types/
    └── index.ts                    # 🔄 עדכון - types חדשים
```

### 6.2 `lines` - עדכון

**שינויים:**
- ➕ הוספת `floorPlanId` ל-Line (חובה)
- ➕ UI לבחירת מפה בעת יצירת Line
- ➕ הצגת המפה בדף Line

**קבצים לעדכון:**
```
lines/
├── ui/
│   ├── CreateLineDialog.tsx       # ➕ בחירת מפה
│   └── LineDetailPage.tsx         # ➕ הצגת מפה
├── actions/
│   └── createLine.ts              # ➕ floorPlanId
└── schemas/
    └── lineSchemas.ts             # ➕ floorPlanId validation
```

### 6.3 `events` - עדכון

**שינויים:**
- ➕ הוספת `customFloorPlanId` ל-LineOccurrence (אופציונלי)
- ➕ UI לבחירת מפה מותאמת לאירוע
- ➕ הצגת המפה בדף אירוע

**קבצים לעדכון:**
```
events/
├── ui/
│   └── EventDetailPage.tsx       # ➕ בחירת מפה מותאמת
└── actions/
    └── updateOccurrence.ts       # ➕ customFloorPlanId
```

### 6.4 Routes - עדכון

**שינויים:**
```
src/app/venues/[venueId]/
├── map/                    # ❌ מחיקה
│   └── page.tsx
│
└── settings/               # 🆕 חדש
    ├── page.tsx            # דף ראשי עם tabs
    ├── lines/              # ✅ מ-lines (או redirect)
    ├── roles/              # ✅ מ-roles (או redirect)
    ├── structure/          # 🆕 חדש
    │   ├── page.tsx        # רשימת מפות
    │   └── [floorPlanId]/
    │       ├── page.tsx    # עורך מפה
    │       ├── layout/     # עורך מבנה
    │       ├── content/    # עורך תכולה
    │       ├── staffing/   # עורך סידור עבודה
    │       └── minimum-order/ # עורך מינימום הזמנה
    └── general/            # ✅ מ-info (או redirect)
```

---

## 7. תוכנית מימוש

### שלב 1: הכנה (1-2 ימים)

1. ✅ יצירת מסמך זה (ניתוח)
2. ✅ אישור מהמשתמש
3. ✅ יצירת branch חדש: `feature/venue-settings-transformation`

### שלב 2: מסד נתונים (2-3 ימים)

1. ✅ יצירת migration ל-FloorPlan
2. ✅ עדכון Zone, Table, VenueArea → floorPlanId
3. ✅ עדכון Line → floorPlanId (חובה)
4. ✅ עדכון LineOccurrence → customFloorPlanId (אופציונלי)
5. ✅ יצירת migration scripts
6. ✅ בדיקת migrations

### שלב 3: מודול venue-settings (5-7 ימים)

1. ✅ העתקת venue-map → venue-settings
2. ✅ יצירת VenueSettingsPage עם tabs
3. ✅ יצירת StructureTab
4. ✅ יצירת FloorPlansList
5. ✅ עדכון FloorPlanEditor לתמיכה במפות מרובות
6. ✅ יצירת ContentEditor
7. ✅ יצירת StaffingEditor
8. ✅ יצירת MinimumOrderEditor
9. ✅ עדכון כל ה-actions/services

### שלב 4: עדכון lines (1-2 ימים)

1. ✅ הוספת floorPlanId ל-Line
2. ✅ עדכון CreateLineDialog
3. ✅ עדכון LineDetailPage
4. ✅ עדכון schemas/actions

### שלב 5: עדכון events (1 יום)

1. ✅ הוספת customFloorPlanId ל-LineOccurrence
2. ✅ עדכון EventDetailPage
3. ✅ עדכון schemas/actions

### שלב 6: Routes & Navigation (1 יום)

1. ✅ מחיקת /map
2. ✅ יצירת /settings
3. ✅ עדכון navigation
4. ✅ עדכון redirects

### שלב 7: שיפור Canvas (2-3 ימים)

1. ✅ שיפור CanvasViewport
2. ✅ שיפור drag & drop
3. ✅ שיפור zoom/pan
4. ✅ שיפור UI/UX

### שלב 8: בדיקות & Deploy (2-3 ימים)

1. ✅ בדיקות יחידה
2. ✅ בדיקות אינטגרציה
3. ✅ בדיקות E2E
4. ✅ Deploy ל-staging
5. ✅ בדיקות משתמש
6. ✅ Deploy ל-production

**סה"כ: 15-22 ימי עבודה**

---

## 8. התוצאה הסופית

### 8.1 מבנה הניווט החדש

```
/venues/[venueId]/
├── settings/                    # 🆕 הגדרת מקום
│   ├── (default)               # Tabs: Lines | Roles | Structure | General
│   ├── lines/                  # ✅ ליינים
│   ├── roles/                  # ✅ תפקידים
│   ├── structure/              # 🆕 מבנה
│   │   ├── (list)              # רשימת מפות
│   │   └── [floorPlanId]/      # עורך מפה
│   │       ├── layout/         # עיצוב
│   │       ├── content/        # תכולה
│   │       ├── staffing/       # סידור עבודה
│   │       └── minimum-order/  # מינימום הזמנה
│   └── general/                # ✅ הגדרות כלליות
│
├── calendar/                   # ✅ נשאר
├── lines/[lineId]/             # ✅ נשאר (עם מפה)
└── events/[lineId]/[occurrenceId]/  # ✅ נשאר (עם מפה מותאמת)
```

### 8.2 חוויית משתמש חדשה

**1. יצירת Venue:**
```
1. משתמש יוצר Venue
2. מועבר אוטומטית ל-Venue Settings
3. נדרש להגדיר Lines (חובה)
4. נדרש להגדיר Roles (חובה)
5. נדרש ליצור מפה אחת לפחות (חובה)
```

**2. יצירת Line:**
```
1. משתמש יוצר Line חדש
2. נדרש לבחור מפה (חובה)
3. Line קשור למפה
4. בדף Line מוצגת המפה
```

**3. יצירת Event:**
```
1. משתמש יוצר Event
2. ברירת מחדל: משתמש במפה של ה-Line
3. אופציונלי: יכול לבחור מפה מותאמת
4. בדף Event מוצגת המפה הנבחרת
```

**4. עריכת מפה:**
```
1. משתמש נכנס ל-Structure
2. רואה רשימת מפות
3. בוחר מפה לעריכה
4. 4 מצבים:
   - Layout: עיצוב המפה (נעול אחרי בנייה)
   - Content: תכולה (כמויות, מספור, שמות)
   - Staffing: סידור עבודה
   - Minimum Order: מינימום הזמנה
```

### 8.3 יתרונות הפתרון החדש

✅ **היררכיה ברורה:**
- Lines → Roles → Structure → General
- זרימת עבודה לוגית

✅ **גמישות:**
- מפות מרובות למקום
- מפה מותאמת לאירוע
- Line חייב מפה (חובה)

✅ **הפרדת אחריות:**
- Layout (עיצוב) - נעול אחרי בנייה
- Content (תכולה) - ניתן לעריכה
- Staffing (סידור עבודה) - ניתן לעריכה
- Minimum Order (מינימום הזמנה) - ניתן לעריכה

✅ **שיפור UX:**
- Canvas משופר
- UI נקי ואינטואיטיבי
- זרימת עבודה ברורה

---

## 9. סיכום והמלצות

### 9.1 מה למחוק

❌ **`src/modules/venue-map/`** - להחליף ב-venue-settings  
❌ **`src/app/venues/[venueId]/map/`** - להחליף ב-settings  
❌ **`FloorPlanEditorV2.tsx`** - קובץ ענק, להחליף ב-FloorPlanEditor החדש

### 9.2 מה לשנות

🔄 **`src/modules/lines/`** - הוספת floorPlanId  
🔄 **`src/modules/events/`** - הוספת customFloorPlanId  
🔄 **Schema** - הוספת FloorPlan, עדכון Zone/Table/Line

### 9.3 מה להוסיף

➕ **`src/modules/venue-settings/`** - מודול חדש מלא  
➕ **Content Editor** - עורך תכולה  
➕ **Staffing Editor** - עורך סידור עבודה  
➕ **Minimum Order Editor** - עורך מינימום הזמנה  
➕ **FloorPlan model** - מודל מפה

### 9.4 התוצאה הסופית

🎯 **Venue Settings** - מודול מרכזי להגדרת המקום  
🎯 **היררכיה ברורה** - Lines → Roles → Structure → General  
🎯 **גמישות מקסימלית** - מפות מרובות, מפה מותאמת לאירוע  
🎯 **UX משופר** - Canvas חלק, UI נקי, זרימת עבודה ברורה

---

**סוף המסמך**

