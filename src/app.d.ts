/// <reference types="vite/client" />
/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  // ... existing env vars ...
  readonly PUBLIC_SITE_ACCESS: string
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Locals {}
    // interface PageData {}
    interface Platform {}
    // interface Error {}
    // interface Platform {}
  }

  // Cloudflare Turnstile's browser API (src/lib/Turnstile.svelte), present
  // once challenges.cloudflare.com/turnstile/v0/api.js has loaded.
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        options: Record<string, unknown>,
      ): string | undefined
      reset(widgetId: string): void
      remove(widgetId: string): void
    }
  }

  // Add environment variable type
  namespace NodeJS {
    interface ProcessEnv {
      PUBLIC_SITE_ACCESS: "public" | "protected"
    }
  }
}

export {}
