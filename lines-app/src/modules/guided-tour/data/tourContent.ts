/**
 * Guided Tour Content
 * 
 * All tour steps and pages configuration
 */

import type { TourStep, TourPage } from "../types";

/**
 * Tour Steps - Short, clear, focused explanations for each page
 */
export const tourSteps: TourStep[] = [
  // ===== LINES PAGE =====
  {
    id: "lines-intro",
    pageId: "lines",
    title: "ליינים - שעות העבודה הקבועות שלך",
    description:
      "כאן מגדירים את הליינים - אירועים חוזרים שהמערכת יוצרת אוטומטית. זה הבסיס של כל העבודה שלך.",
    position: "center",
    nextStepId: "lines-create-button",
    skipable: true
  },
  {
    id: "lines-create-button",
    pageId: "lines",
    title: "צור ליין חדש",
    description:
      "לחץ כאן כדי ליצור ליין חדש. תגדיר ימים, שעות, ותדירות - והמערכת תיצור את כל האירועים אוטומטית.",
    targetSelector: '[data-tour="lines-create-button"]',
    position: "bottom",
    nextStepId: "lines-empty-state",
    prevStepId: "lines-intro",
    skipable: true
  },
  {
    id: "lines-empty-state",
    pageId: "lines",
    title: "אין ליינים עדיין",
    description:
      "אם אין לך ליינים, תראה כאן הודעה עם כפתור ליצירת הליין הראשון. אחרי שתצור ליין, הוא יופיע כאן.",
    targetSelector: '[data-tour="lines-empty-state"]',
    position: "center",
    prevStepId: "lines-create-button",
    skipable: true
  },
  {
    id: "lines-card",
    pageId: "lines",
    title: "כרטיס ליין",
    description:
      "כל ליין מוצג כאן עם כל הפרטים: ימים, שעות, צבע, וכמה אירועים נוצרו. תוכל לערוך או לראות פרטים.",
    targetSelector: '[data-tour="lines-card"]',
    position: "top",
    skipable: true
  },

  // ===== ROLES PAGE =====
  {
    id: "roles-intro",
    pageId: "roles",
    title: "תפקידים - ארגון הצוות",
    description:
      "כאן מגדירים את כל התפקידים במקום. תפקידים קבועים לכולם - כל הליינים משתמשים באותם תפקידים.",
    position: "center",
    nextStepId: "roles-departments",
    skipable: true
  },
  {
    id: "roles-departments",
    pageId: "roles",
    title: "מחלקות",
    description:
      "מחלקות מארגנות את התפקידים - מטבח, בר, שירות, ניהול. כל מחלקה יכולה להכיל תפקידים.",
    targetSelector: '[data-tour="roles-departments"]',
    position: "top",
    nextStepId: "roles-hierarchy",
    prevStepId: "roles-intro",
    skipable: true
  },
  {
    id: "roles-hierarchy",
    pageId: "roles",
    title: "היררכיה",
    description:
      "תפקידים יכולים להיות מאורגנים בהיררכיה - תפקיד ניהולי יכול לנהל תפקידים אחרים. זה עוזר לארגן את הצוות.",
    targetSelector: '[data-tour="roles-hierarchy"]',
    position: "top",
    prevStepId: "roles-departments",
    skipable: true
  },

  // ===== MAP PAGE =====
  {
    id: "map-intro",
    pageId: "map",
    title: "מפת המקום - ארגון ויזואלי",
    description:
      "כאן יוצרים את המפה של המקום. אפשר ליצור מפה כללית או מפות ספציפיות לכל ליין.",
    position: "center",
    nextStepId: "map-zones",
    skipable: true
  },
  {
    id: "map-zones",
    pageId: "map",
    title: "אזורים",
    description:
      "אזורים מחלקים את המקום לחלקים - למשל חלל פנימי, חלל חיצוני, בר. כל אזור יכול להכיל שולחנות.",
    targetSelector: '[data-tour="map-zones"]',
    position: "top",
    nextStepId: "map-tables",
    prevStepId: "map-intro",
    skipable: true
  },
  {
    id: "map-tables",
    pageId: "map",
    title: "שולחנות",
    description:
      "שולחנות יכולים להיות כללים (לכל הליינים) או ספציפיים לליין מסוים. כל שולחן יכול להיות באזור מסוים.",
    targetSelector: '[data-tour="map-tables"]',
    position: "top",
    prevStepId: "map-zones",
    skipable: true
  },

  // ===== MENUS PAGE =====
  {
    id: "menus-intro",
    pageId: "menus",
    title: "תפריטים - ניהול מסמכים",
    description:
      "כאן מעלים תפריטים ומסמכים. כל תפריט יכול להיות כללי או ספציפי לליין מסוים.",
    position: "center",
    nextStepId: "menus-upload",
    skipable: true
  },
  {
    id: "menus-upload",
    pageId: "menus",
    title: "העלאת תפריט",
    description:
      "לחץ כאן כדי להעלות תפריט חדש. אפשר להעלות PDF או תמונות. תבחר אם התפריט לכל הליינים או לליין ספציפי.",
    targetSelector: '[data-tour="menus-upload"]',
    position: "bottom",
    nextStepId: "menus-list",
    prevStepId: "menus-intro",
    skipable: true
  },
  {
    id: "menus-list",
    pageId: "menus",
    title: "רשימת תפריטים",
    description:
      "כאן תראה את כל התפריטים שהעלית. כל תפריט יכול להיות משויך לליין מסוים או להיות כללי.",
    targetSelector: '[data-tour="menus-list"]',
    position: "top",
    prevStepId: "menus-upload",
    skipable: true
  }
];

/**
 * Tour Pages - Order and structure
 */
export const tourPages: TourPage[] = [
  {
    id: "lines",
    title: "ליינים",
    description: "שעות העבודה הקבועות - הבסיס של הכל",
    steps: ["lines-intro", "lines-create-button", "lines-empty-state", "lines-card"],
    order: 1
  },
  {
    id: "roles",
    title: "תפקידים",
    description: "ארגון הצוות והמבנה הארגוני",
    steps: ["roles-intro", "roles-departments", "roles-hierarchy"],
    order: 2
  },
  {
    id: "map",
    title: "מפת המקום",
    description: "ארגון ויזואלי של המקום - אזורים ושולחנות",
    steps: ["map-intro", "map-zones", "map-tables"],
    order: 3
  },
  {
    id: "menus",
    title: "תפריטים",
    description: "ניהול תפריטים ומסמכים",
    steps: ["menus-intro", "menus-upload", "menus-list"],
    order: 4
  }
];

/**
 * Get step by ID
 */
export function getStepById(stepId: string): TourStep | undefined {
  return tourSteps.find((s) => s.id === stepId);
}

/**
 * Get steps for a page
 */
export function getStepsForPage(pageId: string): TourStep[] {
  return tourSteps.filter((s) => s.pageId === pageId);
}

/**
 * Get page by ID
 */
export function getPageById(pageId: string): TourPage | undefined {
  return tourPages.find((p) => p.id === pageId);
}

/**
 * Get all step IDs in order
 */
export function getAllStepIds(): string[] {
  const ordered: string[] = [];
  tourPages
    .sort((a, b) => a.order - b.order)
    .forEach((page) => {
      page.steps.forEach((stepId) => {
        if (!ordered.includes(stepId)) {
          ordered.push(stepId);
        }
      });
    });
  return ordered;
}

