import { vi } from "vitest"

export const APP_LEADS_URL = "https://app.buoy.fish/api/v1/site/leads"
export const TEST_SITE_LEADS_TOKEN = "test-site-leads-token"

// A fetch stand-in that behaves like app.buoy.fish's lead endpoint (ADR-0039):
// it only answers a POST to the real URL (anything else 404s, so a wrong
// endpoint fails the test), refuses a wrong bearer token with the app's 401,
// and records the JSON body of each lead it accepted.
export function stubAppLeads(
  body: unknown = { id: "lead-1", notified: true },
  status = 201,
  url = APP_LEADS_URL,
) {
  const leads: Record<string, unknown>[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      if (String(input) !== url || init?.method !== "POST") {
        return new Response("Not Found", { status: 404 })
      }
      const auth = new Headers(init.headers).get("authorization")
      if (auth !== `Bearer ${TEST_SITE_LEADS_TOKEN}`) {
        return Response.json({ error: "unauthorized" }, { status: 401 })
      }
      leads.push(JSON.parse(String(init.body)))
      return Response.json(body, { status })
    }),
  )
  return { leads }
}

// The app is unreachable: fetch rejects, as it does on a network failure.
export function stubAppDown() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("fetch failed")
    }),
  )
}
