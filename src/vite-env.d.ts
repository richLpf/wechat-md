/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string
  readonly GITHUB_PAGES?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

