import type { ServiceBindingFetcher } from "@/types/api-client/service-binding-fetcher.type";

const CLOUDFLARE_WORKERS_SPECIFIER = ["cloudflare", "workers"].join(":");

async function importCloudflareWorkers(): Promise<unknown> {
  return import(
    /* @vite-ignore */
    /* webpackIgnore: true */
    CLOUDFLARE_WORKERS_SPECIFIER
  );
}

function isServiceBindingFetcher(
  candidate: unknown,
): candidate is ServiceBindingFetcher {
  if (typeof candidate !== "object" || candidate === null) {
    return false;
  }

  const record = candidate as Record<string, unknown>;
  return typeof record["fetch"] === "function";
}

/**
 * Safely resolves a Cloudflare Worker Service Binding `fetch` function from
 * `cloudflare:workers` (`env[serviceBinding]`). Returns `undefined` when running
 * outside Workers or when the binding is missing, without breaking non-Worker bundlers.
 */
export async function resolveServiceBinding(
  serviceBindingName: string,
  loadWorkersModule: () => Promise<unknown> = importCloudflareWorkers,
): Promise<((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | undefined> {
  const trimmedName = serviceBindingName.trim();
  if (trimmedName.length === 0) {
    return undefined;
  }

  try {
    const workersModule = await loadWorkersModule();
    if (typeof workersModule !== "object" || workersModule === null) {
      return undefined;
    }

    const envValue = (workersModule as Record<string, unknown>)["env"];
    if (typeof envValue !== "object" || envValue === null) {
      return undefined;
    }

    const binding = (envValue as Record<string, unknown>)[trimmedName];
    if (!isServiceBindingFetcher(binding)) {
      return undefined;
    }

    // Preserve `this` on the Cloudflare Fetcher to avoid Illegal invocation in workerd.
    return (input: RequestInfo | URL, init?: RequestInit) =>
      binding.fetch(input, init);
  } catch {
    return undefined;
  }
}
