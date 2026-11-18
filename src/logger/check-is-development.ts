/**
 * Safely checks whether the current Vinext / Cloudflare Workers runtime is in
 * development or test mode using static `import.meta.env.DEV` access compatible
 * with Vite 8's `ModuleRunner`.
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

  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}
