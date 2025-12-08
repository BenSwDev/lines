# Team Management Module

## Status: 🚧 Skeleton (Coming Soon)

This module will provide team, PR, and promoter management functionality.

## Planned Features

1. **Staff Management**
   - Employee profiles
   - Role assignment
   - Schedule management
   - Contact information

2. **PR & Promoters**
   - Promoter profiles
   - Personal invite links
   - Guest list management
   - Performance tracking

3. **Commission Tracking**
   - Configurable commission rates
   - Automatic calculations
   - Payment tracking
   - Reports

4. **Guest Lists**
   - PR personal guest lists
   - Guest arrival tracking
   - QR code check-in
   - Real-time updates

5. **Performance Reports**
   - Individual performance metrics
   - Comparison reports
   - Revenue attribution
   - Trend analysis

## Data Model (Planned)

```prisma
model TeamMember {
  id             String   @id @default(cuid())
  venueId        String
  userId         String?
  name           String
  email          String?
  phone          String?
  type           String   // employee, promoter, pr
  roleId         String?
  commissionRate Decimal?
  status         String   @default("active")
  startDate      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Promoter {
  id             String   @id @default(cuid())
  venueId        String
  name           String
  email          String?
  phone          String?
  commissionType String
  commissionRate Decimal
  totalGuests    Int      @default(0)
  totalEarnings  Decimal  @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
}

model GuestListEntry {
  id          String   @id @default(cuid())
  eventId     String
  promoterId  String
  guestName   String
  guestCount  Int      @default(1)
  status      String   @default("pending")
  arrivedAt   DateTime?
  createdAt   DateTime @default(now())
}

model Commission {
  id         String   @id @default(cuid())
  promoterId String
  eventId    String
  amount     Decimal
  guestCount Int
  status     String   @default("pending")
  paidAt     DateTime?
  createdAt  DateTime @default(now())
}
```

## Estimated Release

Q2 2025
