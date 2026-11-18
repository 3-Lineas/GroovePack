/**
 * Options for the `@3lineas/groovepack/vite` plugin.
 */
export interface GroovepackVitePluginOptions {
  /** Custom Shadcn UI directory (defaults to env vars or `"/src/components/ui"`). */
  shadcnPath?: string;
}

export interface GroovepackViteResolvedConfig {
  root?: string;
}

export interface GroovepackVitePlugin {
  name: string;
  enforce?: "pre" | "post";
  config?: () => {
    optimizeDeps?: {
      exclude?: string[];
    };
  };
  configResolved?: (config: GroovepackViteResolvedConfig) => void;
  resolveId?: (source: string) => string | undefined;
  load?: (id: string) => string | undefined;
  transform?: (
    code: string,
    id: string,
  ) => { code: string; map: null } | undefined;
}
