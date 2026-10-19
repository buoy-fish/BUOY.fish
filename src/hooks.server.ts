// src/hooks.server.ts
import { PUBLIC_SITE_ACCESS } from "$env/static/public"
import { redirect, type Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"
import { retiredRouteRedirect } from "$lib/retired_routes"

const SITE_PASSWORD = "BUOY" // Replace with your desired password

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

// Silently return 404 for Chrome DevTools probe requests
const ignoreBrowserProbes: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/.well-known/appspecific/")) {
    return new Response(null, { status: 404 })
  }
  return resolve(event)
}

// Permanent redirects for the template routes ADR-0039 removed ($lib/retired_routes).
const redirectRetiredRoutes: Handle = async ({ event, resolve }) => {
  const target = retiredRouteRedirect(event.url.pathname)
  if (target) redirect(301, target)
  return resolve(event)
}

export const handle: Handle = sequence(
  ignoreBrowserProbes,
  redirectRetiredRoutes,
  passwordProtect,
)
