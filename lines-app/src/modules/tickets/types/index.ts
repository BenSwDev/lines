// Tickets Module Types (Placeholder)
// This module is a skeleton for future implementation

export interface Ticket {
  id: string;
  venueId: string;
  eventId?: string;
  lineId?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity?: number;
  soldCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  perks?: string[];
}

export interface TicketSale {
  id: string;
  ticketId: string;
  quantity: number;
  totalPrice: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  createdAt: Date;
}
