// src/hooks.server.ts
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
  PUBLIC_SITE_ACCESS,
} from "$env/static/public"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

const SITE_PASSWORD = "BUOY" // Replace with your desired password

export const supabase: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" })
          })
        },
      },
    },
  )

  event.locals.supabaseServiceRole = createClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } },
  )

  // https://github.com/supabase/auth-js/issues/888#issuecomment-2189298518
  if ("suppressGetSessionWarning" in event.locals.supabase.auth) {
    // @ts-expect-error - suppressGetSessionWarning is not part of the official API
    event.locals.supabase.auth.suppressGetSessionWarning = true
  } else {
    console.warn(
      "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/auth-js/issues/888.",
    )
  }

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    if (!session) {
      return { session: null, user: null, amr: null }
    }

    const {
      data: { user },
      error: userError,
    } = await event.locals.supabase.auth.getUser()
    if (userError) {
      // JWT validation has failed
      return { session: null, user: null, amr: null }
    }

    const { data: aal, error: amrError } =
      await event.locals.supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (amrError) {
      return { session, user, amr: null }
    }

    return { session, user, amr: aal.currentAuthenticationMethods }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version"
    },
  })
}

// Not called for prerendered marketing pages so generally okay to call on ever server request
// Next-page CSR will mean relatively minimal calls to this hook
const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession()
  event.locals.session = session
  event.locals.user = user

  return resolve(event)
}

// Simplified password protection
const passwordProtect: Handle = async ({ event, resolve }) => {
  // If site is public, skip password protection
  if (PUBLIC_SITE_ACCESS === "public") {
    return resolve(event)
  }

  // Skip auth for static assets
  if (
    event.url.pathname.startsWith("/videos") ||
    event.url.pathname.startsWith("/images") ||
    event.url.pathname.startsWith("/_app")
  ) {
    return resolve(event)
  }

  // If already authorized with cookie, proceed
  const authorized = event.cookies.get("authorized")
  if (authorized === "true") {
    return resolve(event)
  }

  // Check if password was submitted
  const password = event.url.searchParams.get("password")

  if (password === SITE_PASSWORD) {
    // Set cookie via SvelteKit's cookies API so it persists across requests
    event.cookies.set("authorized", "true", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })
    // Redirect to the same page without the password in the URL
    return new Response(null, {
      status: 302,
      headers: { location: event.url.pathname },
    })
  }

  // Show password page if not authorized
  return new Response(
    `<!DOCTYPE html>
        <html>
            <head>
                <title>Buoy Staging - Password Required</title>
                <style>
                    body { 
                        font-family: system-ui; 
                        max-width: 600px; 
                        margin: 50px auto; 
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .logo {
                        width: 120px;
                        margin-bottom: 30px;
                    }
                    .container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }
                    input, button { 
                        padding: 12px 20px; 
                        margin: 10px 0;
                        border-radius: 6px;
                        border: 1px solid #ddd;
                        font-size: 16px;
                    }
                    button {
                        background: #1556ac;
                        color: white;
                        border: none;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    button:hover {
                        background: #3b82f6;
                    }
                    .exit-button {
                        background: #f0f0f0;
                        color: #333;
                        text-decoration: none;
                        display: inline-block;
                        margin-top: 20px;
                    }
                    .exit-button:hover {
                        background: #e0e0e0;
                    }
                    form {
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <a href="https://buoy.fish">
                        <img src="/images/buoy_logo.svg" alt="Buoy Logo" class="logo">
                    </a>
                    <h1>Welcome to Buoy Staging</h1>
                    <p>This is the staging site for buoy.fish's next website. If you have been given a password to access this page, please enter it below.</p>
                    <form>
                        <input type="password" name="password" placeholder="Enter password" required>
                        <button type="submit">Access Staging Site</button>
                    </form>
                    <a href="https://buoy.fish" class="button exit-button">Return to buoy.fish</a>
                </div>
            </body>
        </html>`,
    {
      headers: {
        "content-type": "text/html",
      },
    },
  )
}

export const handle: Handle = sequence(passwordProtect, supabase, authGuard)
