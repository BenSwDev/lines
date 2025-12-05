# Zones Module

Module for managing venue seating zones and tables.

## Structure

- `ui/ZonesSection.tsx` - Zones and tables management component
- `index.ts` - Public exports

## Usage

```tsx
import { ZonesSection } from "@/modules/zones";

<ZonesSection venueId={venueId} zones={zones} onRefresh={loadZones} />;
```
