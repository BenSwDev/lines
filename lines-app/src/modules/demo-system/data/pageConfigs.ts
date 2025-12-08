/**
 * Page Configurations
 * Hero sections, purposes, and key messages for each page
 */

import type { DemoPageConfig } from "../types";

export const linesPageConfig: DemoPageConfig = {
  pageId: "lines",
  hero: {
    title: "ליינים - שעות העבודה הקבועות",
    purpose: "ניהול אירועים חוזרים עם לוחות זמנים אוטומטיים",
    whatYouCanDo: "צור ליינים, הגדר ימים ושעות, והמערכת תיצור את כל האירועים אוטומטית",
    keyIdeas: [
      "יצירת אירועים חוזרים אוטומטית",
      "15 צבעים ייחודיים לזיהוי מהיר",
      "לוח שנה אינטואיטיבי עם כל האירועים",
      "גמישות מלאה - שבועי, חודשי, או מותאם אישית"
    ],
    keyMessage: "חסכו שעות של עבודה ידנית - המערכת עושה את זה בשבילכם"
  },
  features: ["צור ליין חדש", "קידוד צבעים", "יצירת אירועים אוטומטית", "תצוגת לוח שנה"],
  cta: {
    label: "התחל לנהל את הליינים שלך",
    message: "הרשם עכשיו וקבל גישה מלאה לכל התכונות"
  }
};

export const rolesPageConfig: DemoPageConfig = {
  pageId: "roles",
  hero: {
    title: "תפקידים והיררכיה",
    purpose: "ארגון הצוות והמבנה הארגוני במקום אחד",
    whatYouCanDo: "הגדר תפקידים, מחלקות, והיררכיה - כל הליינים משתמשים באותם תפקידים",
    keyIdeas: [
      "ניהול תפקידים ומחלקות",
      "היררכיה ארגונית ויזואלית",
      "תפקידים קבועים לכל הליינים",
      "ארגון יעיל של הצוות"
    ],
    keyMessage: "ארגן את הצוות שלך בצורה מקצועית - הכל במקום אחד"
  },
  features: ["ניהול תפקידים", "היררכיה ארגונית", "מחלקות"],
  cta: {
    label: "התחל לארגן את הצוות",
    message: "הרשם עכשיו וקבל כלים מקצועיים לניהול צוות"
  }
};

export const mapPageConfig: DemoPageConfig = {
  pageId: "map",
  hero: {
    title: "מפת המקום",
    purpose: "יצירת מפה ויזואלית של המקום עם אזורים ושולחנות",
    whatYouCanDo: "צור מפה, הוסף אזורים ושולחנות - כללי או ספציפיים לליין",
    keyIdeas: [
      "מפה ויזואלית אינטראקטיבית",
      "אזורים ושולחנות",
      "מפות כלליות או ספציפיות לליין",
      "ניהול קיבולת וישיבה"
    ],
    keyMessage: "ראה את המקום שלך במבט אחד - ניהול ויזואלי ופשוט"
  },
  features: ["מפה ויזואלית", "אזורים", "שולחנות"],
  cta: {
    label: "צור את המפה הראשונה שלך",
    message: "הרשם עכשיו וקבל כלים מקצועיים לניהול מפות"
  }
};

export const menusPageConfig: DemoPageConfig = {
  pageId: "menus",
  hero: {
    title: "תפריטים ומסמכים",
    purpose: "ניהול תפריטים ומסמכים במקום אחד",
    whatYouCanDo: "העלה תפריטים, נהל מסמכים - כללי או ספציפיים לליין",
    keyIdeas: [
      "העלאת תפריטים ומסמכים",
      "ניהול מרכזי של כל התפריטים",
      "תפריטים כלליים או ספציפיים לליין",
      "גישה מהירה ונוחה"
    ],
    keyMessage: "כל התפריטים שלך במקום אחד - נוח, מהיר, ומאורגן"
  },
  features: ["העלאת תפריטים", "ניהול תפריטים"],
  cta: {
    label: "התחל לנהל את התפריטים",
    message: "הרשם עכשיו וקבל כלים מקצועיים לניהול תפריטים"
  }
};

export const pageConfigs: Record<string, DemoPageConfig> = {
  lines: linesPageConfig,
  roles: rolesPageConfig,
  map: mapPageConfig,
  menus: menusPageConfig
};

export function getPageConfig(pageId: string): DemoPageConfig | undefined {
  return pageConfigs[pageId];
}
