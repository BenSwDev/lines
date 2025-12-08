/**
 * Demo System Types
 * Public demo system - NO real authentication
 */

export type DemoBusinessType = 
  | "restaurant" 
  | "bar" 
  | "event-hall" 
  | "cafe" 
  | "hotel" 
  | "club";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  businessType: DemoBusinessType;
  venueId: string;
  venueName: string;
};

export type PageHero = {
  title: string;
  purpose: string; // מטרת העמוד בשורה אחת
  whatYouCanDo: string; // מה אפשר לעשות בשורה אחת
  keyIdeas: string[]; // רעיונות עיקריים
  keyMessage: string; // משפט מפתח שמחזק את המוצר
};

export type DemoPageConfig = {
  pageId: string;
  hero: PageHero;
  features: string[];
  cta?: {
    label: string;
    message: string;
  };
};

