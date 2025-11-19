/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_APP_GIT_HASH: string;
    readonly VITE_APP_GIT_BRANCH: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
