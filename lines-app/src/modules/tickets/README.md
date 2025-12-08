# Tickets Module

## Status: 🚧 Skeleton (Coming Soon)

This module will provide ticket management functionality for venues.

## Planned Features

1. **Ticket Types**
   - Create different ticket tiers (VIP, Regular, Early Bird)
   - Set capacity limits per ticket type
   - Configure perks and benefits

2. **Dynamic Pricing**
   - Set base prices per ticket type
   - Override prices per event or line
   - Time-based pricing (early bird discounts)

3. **Sales Tracking**
   - Real-time sales dashboard
   - Revenue reports
   - Buyer management

4. **Integration**
   - Link tickets to specific events (LineOccurrence)
   - Link tickets to lines for recurring events
   - QR code generation for entry

## Data Model (Planned)

```prisma
model Ticket {
  id          String   @id @default(cuid())
  venueId     String
  lineId      String?
  name        String
  description String?
  price       Decimal
  currency    String   @default("ILS")
  quantity    Int?
  soldCount   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TicketSale {
  id         String   @id @default(cuid())
  ticketId   String
  quantity   Int
  totalPrice Decimal
  buyerName  String?
  buyerEmail String?
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}
```

## Estimated Release

Q2 2025

