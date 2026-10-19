import type { SupabaseClient, Session, AMREntry } from "@supabase/supabase-js"
import { Database } from "./DatabaseDefinitions"

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
    interface Locals {
      supabase: SupabaseClient
      supabaseServiceRole: SupabaseClient
      safeGetSession: () => Promise<{
        session: Session | null
        user: User | null
        amr: AMREntry[] | null
      }>
      session: Session | null
      user: User | null
    }
    interface PageData {
      session: Session | null
    }
    interface Platform {}
    interface Supabase {
      Database: Database
      SchemaName: "public"
    }
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
