import type { FeatureCard } from "../types";

/**
 * Feature Cards for Interactive Slider
 * Modern, international, interactive feature showcase
 */

export const linesFeatures: FeatureCard[] = [
  {
    id: "create-line",
    title: "צור ליין חדש",
    description: "הגדר אירועים חוזרים עם לוחות זמנים גמישים - שבועי, חודשי, או מותאם אישית",
    icon: "📅",
    gradient: "from-blue-500 to-cyan-500",
    actions: [
      {
        label: "צור עכשיו",
        onClick: () => {
          // Will be handled by parent component
        },
        variant: "default"
      }
    ],
    badge: "חדש",
    highlight: true
  },
  {
    id: "color-coding",
    title: "קידוד צבעים",
    description: "15 צבעים ייחודיים לכל ליין - זיהוי מהיר וניהול ויזואלי",
    icon: "🎨",
    gradient: "from-purple-500 to-pink-500",
    badge: "פופולרי"
  },
  {
    id: "auto-events",
    title: "יצירת אירועים אוטומטית",
    description: "המערכת יוצרת את כל האירועים אוטומטית לפי הליינים שלך",
    icon: "⚡",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    id: "calendar-view",
    title: "תצוגת לוח שנה",
    description: "ראה את כל האירועים בלוח שנה אינטואיטיבי עם סינון מתקדם",
    icon: "📆",
    gradient: "from-green-500 to-emerald-500"
  }
];

export const rolesFeatures: FeatureCard[] = [
  {
    id: "manage-roles",
    title: "ניהול תפקידים",
    description: "הגדר תפקידים ומחלקות - מטבח, בר, שירות, ניהול",
    icon: "👥",
    gradient: "from-indigo-500 to-blue-500",
    actions: [
      {
        label: "צור תפקיד",
        onClick: () => {},
        variant: "default"
      }
    ],
    highlight: true
  },
  {
    id: "hierarchy",
    title: "היררכיה ארגונית",
    description: "ארגן את הצוות בהיררכיה - תפקידים ניהוליים ותפקידים רגילים",
    icon: "🏢",
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    id: "departments",
    title: "מחלקות",
    description: "חלק את התפקידים למחלקות - ארגון יעיל ונוח",
    icon: "📋",
    gradient: "from-pink-500 to-rose-500"
  }
];

export const mapFeatures: FeatureCard[] = [
  {
    id: "visual-map",
    title: "מפה ויזואלית",
    description: "צור מפה ויזואלית של המקום עם אזורים ושולחנות",
    icon: "🗺️",
    gradient: "from-teal-500 to-cyan-500",
    actions: [
      {
        label: "צור מפה",
        onClick: () => {},
        variant: "default"
      }
    ],
    highlight: true
  },
  {
    id: "zones",
    title: "אזורים",
    description: "חלק את המקום לאזורים - חלל פנימי, חלל חיצוני, בר",
    icon: "📍",
    gradient: "from-blue-500 to-teal-500"
  },
  {
    id: "tables",
    title: "שולחנות",
    description: "הוסף שולחנות למפה - כללי או ספציפיים לליין",
    icon: "🪑",
    gradient: "from-orange-500 to-red-500"
  }
];

export const menusFeatures: FeatureCard[] = [
  {
    id: "upload-menu",
    title: "העלאת תפריטים",
    description: "העלה תפריטים ומסמכים - PDF או תמונות",
    icon: "📄",
    gradient: "from-violet-500 to-purple-500",
    actions: [
      {
        label: "העלה תפריט",
        onClick: () => {},
        variant: "default"
      }
    ],
    highlight: true
  },
  {
    id: "menu-management",
    title: "ניהול תפריטים",
    description: "נהל את כל התפריטים במקום אחד - כללי או ספציפיים לליין",
    icon: "📚",
    gradient: "from-rose-500 to-pink-500"
  }
];

