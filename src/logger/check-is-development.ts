/**
 * Safely checks whether the current runtime is in development or test mode
 * without assuming `@types/node` or Vite ambient types.
 */
export function checkIsDevelopment(): boolean {
  const globalRecord = globalThis as Record<string, unknown>;
  const processValue = globalRecord["process"];
  if (typeof processValue === "object" && processValue !== null) {
    const envValue = (processValue as Record<string, unknown>)["env"];
    if (typeof envValue === "object" && envValue !== null) {
      const nodeEnv = (envValue as Record<string, unknown>)["NODE_ENV"];
      if (nodeEnv === "development" || nodeEnv === "test") {
        return true;
      }
      if (nodeEnv === "production") {
        return false;
      }
    }
  }

  const metaValue = import.meta as unknown as Record<string, unknown> | undefined;
  if (typeof metaValue === "object" && metaValue !== null) {
    const envValue = metaValue["env"];
    if (typeof envValue === "object" && envValue !== null) {
      return (envValue as Record<string, unknown>)["DEV"] === true;
    }
  }

  return false;
}
