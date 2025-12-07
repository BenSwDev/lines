import demoFlowData from "../data/demoFlow.json";
import { validateDemoFlow, type DemoFlow } from "./demoSchema";

/**
 * Load and validate demo flow data
 * Returns validated DemoFlow object or throws error
 */
export function loadDemoFlow(): DemoFlow {
  try {
    return validateDemoFlow(demoFlowData);
  } catch (error) {
    console.error("Failed to load demo flow:", error);
    throw new Error("Invalid demo flow data");
  }
}

/**
 * Async version for loading demo flow (for future API integration)
 */
export async function loadDemoFlowAsync(): Promise<DemoFlow> {
  // In the future, this could fetch from an API
  return Promise.resolve(loadDemoFlow());
}

