// Inventory Module Types (Placeholder)
// This module is a skeleton for future implementation

export interface InventoryItem {
  id: string;
  venueId: string;
  name: string;
  description?: string;
  category: string;
  unit: string; // bottles, kg, liters, etc.
  currentStock: number;
  minStock: number;
  maxStock?: number;
  costPerUnit?: number;
  supplier?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryCategory {
  id: string;
  venueId: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  performedBy?: string;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  venueId: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}

