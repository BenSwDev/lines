// Shared test utilities for unit and integration tests.

import type { ReactNode } from "react";

export function TestWrapper({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
