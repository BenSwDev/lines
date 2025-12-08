# Inventory Module

## Status: 🚧 Skeleton (Coming Soon)

This module will provide inventory and stock management functionality for venues.

## Planned Features

1. **Stock Tracking**
   - Real-time inventory levels
   - Multiple units of measurement
   - Category organization

2. **Low Stock Alerts**
   - Configurable minimum stock thresholds
   - Automatic notifications
   - Reorder suggestions

3. **Order History**
   - Track all stock movements
   - Supplier management
   - Cost tracking

4. **Reports**
   - Stock valuation
   - Consumption patterns
   - Waste tracking

## Data Model (Planned)

```prisma
model InventoryItem {
  id           String   @id @default(cuid())
  venueId      String
  name         String
  category     String
  unit         String
  currentStock Decimal
  minStock     Decimal
  maxStock     Decimal?
  costPerUnit  Decimal?
  supplierId   String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model StockMovement {
  id          String   @id @default(cuid())
  itemId      String
  type        String   // in, out, adjustment
  quantity    Decimal
  reason      String?
  performedBy String?
  createdAt   DateTime @default(now())
}

model Supplier {
  id          String   @id @default(cuid())
  venueId     String
  name        String
  contactName String?
  email       String?
  phone       String?
  isActive    Boolean  @default(true)
}
```

## Estimated Release

Q3 2025
