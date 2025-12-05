import type { Venue } from "@prisma/client";

export type { Venue };

export type WorkspaceLayoutProps = {
  venue: Venue;
  children: React.ReactNode;
};
