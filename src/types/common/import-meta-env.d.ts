interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly GROOVEPACK_LOCALE?: string;
  readonly NEXT_PUBLIC_GROOVEPACK_LOCALE?: string;
  readonly GROOVEPACK_SHADCN_PATH?: string;
  readonly NEXT_PUBLIC_GROOVEPACK_SHADCN_PATH?: string;
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
