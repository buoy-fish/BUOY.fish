import { env } from "$env/dynamic/private"

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// Shown in `errors._` whenever verification does not pass.
export const TURNSTILE_FAILED_MESSAGE =
  "We couldn't confirm you're not a bot. Reload the page and try again, or email hello@buoy.fish."

export type TurnstileResult =
  | { ok: true }
  | {
      ok: false
      reason: "not_configured" | "missing_token" | "rejected" | "unavailable"
    }

// Checks a Cloudflare Turnstile token (the form's `cf-turnstile-response`
// field) with siteverify. Fails closed: a missing secret, a missing token, a
// refused token and an unreachable siteverify all return ok:false. Never throws.
//
// Only `success` is checked. Deliberate ceiling: a token solved on any
// hostname listed on the widget is accepted, so keep localhost off the
// production widget (local dev uses Cloudflare's test keys). Upgrade path:
// also compare `result.hostname` and `result.action` to the expected values
// (test keys return hostname "example.com" and no action).
export const verifyTurnstile = async (
  token: string | null | undefined,
  remoteip: string | null,
): Promise<TurnstileResult> => {
  if (!env.PRIVATE_TURNSTILE_SECRET_KEY) {
    console.error(
      "Turnstile not verified: PRIVATE_TURNSTILE_SECRET_KEY must be set as a Cloudflare Pages secret. Rejecting the submission.",
    )
    return { ok: false, reason: "not_configured" }
  }
  if (!token) {
    return { ok: false, reason: "missing_token" }
  }

  const form = new URLSearchParams({
    secret: env.PRIVATE_TURNSTILE_SECRET_KEY,
    response: token,
  })
  if (remoteip) form.set("remoteip", remoteip)

  let result: { success?: unknown }
  try {
    const resp = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(10_000),
    })
    if (!resp.ok) throw new Error(`siteverify HTTP ${resp.status}`)
    result = await resp.json()
  } catch (e) {
    console.error("Turnstile siteverify failed, rejecting submission:", e)
    return { ok: false, reason: "unavailable" }
  }

  return result.success === true
    ? { ok: true }
    : { ok: false, reason: "rejected" }
}
