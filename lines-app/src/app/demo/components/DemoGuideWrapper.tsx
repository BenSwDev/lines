"use client";

import { useMemo } from "react";
import { DemoGuide } from "./DemoGuide";
import { loadDemoFlow } from "../utils/loadDemoFlow";

/**
 * Client wrapper component that loads demo flow data
 * Separates data loading from presentation
 */
export function DemoGuideWrapper() {
  const flow = useMemo(() => {
    try {
      return loadDemoFlow();
    } catch (error) {
      console.error("Failed to load demo flow:", error);
      return null;
    }
  }, []);

  if (!flow) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">Failed to load demo guide</p>
          <p className="mt-2 text-sm text-white/60">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return <DemoGuide flow={flow} />;
}

