import { vi } from "vitest"

// A fetch stand-in that behaves like the real siteverify endpoint: it only
// answers POSTs to the real URL (anything else 404s, so a wrong endpoint
// fails the test) and records each form it received.
export function stubSiteverify(body: unknown, status = 200) {
  const forms: Record<string, string>[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (
        String(url) !==
          "https://challenges.cloudflare.com/turnstile/v0/siteverify" ||
        init?.method !== "POST"
      ) {
        return new Response("not found", { status: 404 })
      }
      forms.push(
        Object.fromEntries(new URLSearchParams(String(init.body)).entries()),
      )
      return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      })
    }),
  )
  return { forms }
}
