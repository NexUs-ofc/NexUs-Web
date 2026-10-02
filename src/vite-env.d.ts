/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AUTH_API_BASE_URL?: string;
    readonly VITE_CORE_API_BASE_URL?: string;
    readonly VITE_AUTH_API_KEY?: string;
    readonly VITE_CORE_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
