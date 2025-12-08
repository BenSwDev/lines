/**
 * Demo Users Data
 * Public demo accounts - NO real authentication
 */

import type { DemoUser, DemoBusinessType } from "../types";

export const demoUsers: Record<DemoBusinessType, DemoUser> = {
  restaurant: {
    id: "demo-restaurant",
    name: "מסעדת הדגים",
    email: "demo@restaurant.com",
    businessType: "restaurant",
    venueId: "demo-venue-restaurant",
    venueName: "מסעדת הדגים"
  },
  bar: {
    id: "demo-bar",
    name: "הבר של יוסי",
    email: "demo@bar.com",
    businessType: "bar",
    venueId: "demo-venue-bar",
    venueName: "הבר של יוסי"
  },
  "event-hall": {
    id: "demo-event-hall",
    name: "אולם האירועים הגדול",
    email: "demo@events.com",
    businessType: "event-hall",
    venueId: "demo-venue-events",
    venueName: "אולם האירועים הגדול"
  },
  cafe: {
    id: "demo-cafe",
    name: "קפה בוקר",
    email: "demo@cafe.com",
    businessType: "cafe",
    venueId: "demo-venue-cafe",
    venueName: "קפה בוקר"
  },
  hotel: {
    id: "demo-hotel",
    name: "מלון החוף",
    email: "demo@hotel.com",
    businessType: "hotel",
    venueId: "demo-venue-hotel",
    venueName: "מלון החוף"
  },
  club: {
    id: "demo-club",
    name: "מועדון הלילה",
    email: "demo@club.com",
    businessType: "club",
    venueId: "demo-venue-club",
    venueName: "מועדון הלילה"
  }
};

export function getDemoUser(businessType: DemoBusinessType): DemoUser {
  return demoUsers[businessType];
}

export function getAllDemoUsers(): DemoUser[] {
  return Object.values(demoUsers);
}

