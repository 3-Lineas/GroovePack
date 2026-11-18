interface ImportMetaEnv {
  readonly DEV?: boolean;
  readonly GROOVEPACK_LOCALE?: string;
  readonly NEXT_PUBLIC_GROOVEPACK_LOCALE?: string;
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
