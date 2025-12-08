// Team Management Module Types (Placeholder)
// This module is a skeleton for future implementation

export interface TeamMember {
  id: string;
  venueId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  type: "employee" | "promoter" | "pr";
  roleId?: string;
  commissionRate?: number;
  status: "active" | "inactive";
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Promoter {
  id: string;
  venueId: string;
  name: string;
  email?: string;
  phone?: string;
  commissionType: "fixed" | "percentage" | "per_guest";
  commissionRate: number;
  totalGuests: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestListEntry {
  id: string;
  eventId: string;
  promoterId: string;
  guestName: string;
  guestCount: number;
  status: "pending" | "confirmed" | "arrived" | "no_show";
  notes?: string;
  arrivedAt?: Date;
  createdAt: Date;
}

export interface Commission {
  id: string;
  promoterId: string;
  eventId: string;
  amount: number;
  guestCount: number;
  status: "pending" | "approved" | "paid";
  paidAt?: Date;
  createdAt: Date;
}
