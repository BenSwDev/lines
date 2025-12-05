# Menus Module

Module for managing venue menus (file uploads).

## Structure

- `ui/MenusSection.tsx` - Menus management component
- `index.ts` - Public exports

## Usage

```tsx
import { MenusSection } from "@/modules/menus";

<MenusSection venueId={venueId} menus={menus} onRefresh={loadMenus} />;
```
