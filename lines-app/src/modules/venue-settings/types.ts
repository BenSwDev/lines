import type { Menu, Zone, Table } from "@prisma/client";

export type { Menu, Zone, Table };

export type ZoneWithTables = Zone & {
  tables: Table[];
};
