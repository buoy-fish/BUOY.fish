import { fail } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"

// Contact and pilot submissions live in app.buoy.fish (ADR-0039). This server
// action client is the only way a lead leaves the site: the app verifies
// Turnstile, stores the lead with its SMS-consent evidence, and emails hello@.
// PRIVATE_APP_URL points local dev at a local app (http://localhost:4000).
const leadsUrl = () =>
  `${env.PRIVATE_APP_URL || "https://app.buoy.fish"}/api/v1/site/leads`

// The app stores the lead and then emails hello@ inside the same request, so a
// short timeout here could abort after the row is saved and send the visitor
// to resubmit. Deliberate ceiling: 30s covers the app's own bounded calls
// (bao, siteverify, Resend); a slower app still produces a duplicate.
const TIMEOUT_MS = 30_000

// Shown in `errors._` when the app refuses the form's Turnstile token.
export const TURNSTILE_FAILED_MESSAGE =
  "We couldn't confirm you're not a bot. Reload the page and try again, or email hello@buoy.fish."

export type Lead = {
  kind: "contact" | "pilot"
  first_name: string
  last_name: string
  email: string
  organization: string
  phone: string
  message: string
  details?: Record<string, string | null>
  sms_consent: boolean
  sms_consent_text?: string
  turnstile_token: string
  visitor_ip: string | null
  visitor_user_agent: string | null
}

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; errors: Record<string, string> }
  | { ok: false; reason: "turnstile" | "rate_limited" | "unavailable" }

// Never throws. Every failure is logged here, so a lead never disappears
// quietly (the silent-failure bug that hid contact requests for months).
export const submitLead = async (lead: Lead): Promise<LeadResult> => {
  if (!env.PRIVATE_SITE_LEADS_TOKEN) {
    console.error(
      "Lead not sent: PRIVATE_SITE_LEADS_TOKEN must be set as a Cloudflare Pages secret.",
    )
    return { ok: false, reason: "unavailable" }
  }
  // The app rate-limits by it and keeps it as SMS-consent evidence, so it
  // refuses a lead without one. Missing means this platform isn't telling us.
  if (!lead.visitor_ip) {
    console.error(
      "Lead not sent: no visitor IP (cf-connecting-ip absent and getClientAddress failed).",
    )
    return { ok: false, reason: "unavailable" }
  }

  let resp: Response
  try {
    resp = await fetch(leadsUrl(), {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.PRIVATE_SITE_LEADS_TOKEN}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    console.error("Lead not sent: app.buoy.fish unreachable", e)
    return { ok: false, reason: "unavailable" }
  }

  const body = await resp.json().catch(() => null)

  if (resp.status === 201) {
    if (body?.notified === false) {
      console.error(
        `Lead ${body?.id} saved in app.buoy.fish, but its hello@ email failed`,
      )
    }
    return { ok: true }
  }

  const errors = firstMessages(body?.errors)
  if (resp.status === 422 && Object.keys(errors).length > 0) {
    return { ok: false, reason: "invalid", errors }
  }
  if (resp.status === 403) return { ok: false, reason: "turnstile" }
  if (resp.status === 429) return { ok: false, reason: "rate_limited" }

  console.error(`Lead refused by app.buoy.fish: HTTP ${resp.status}`, body)
  return { ok: false, reason: "unavailable" }
}

// The app answers `{field: ["message", ...]}`; a form shows one line per field.
const firstMessages = (errors: unknown): Record<string, string> => {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => {
      const first = String(
        (Array.isArray(messages) && messages[0]) || "is invalid",
      )
      return [field, first.charAt(0).toUpperCase() + first.slice(1)]
    }),
  )
}

// What a failed submission shows. `formFields` maps the app's lead fields to
// this form's input names; an error on anything else (the lead kind, details)
// is the site's bug, not the visitor's, so it gets the fallback.
export const leadFailure = (
  result: Exclude<LeadResult, { ok: true }>,
  formFields: Record<string, string>,
  fallback: string,
) => {
  switch (result.reason) {
    case "invalid": {
      const errors: Record<string, string> = {}
      for (const [field, message] of Object.entries(result.errors)) {
        if (formFields[field]) errors[formFields[field]] = message
        else {
          console.error(
            `Lead refused for a field the form doesn't show: ${field}: ${message}`,
          )
          errors._ = fallback
        }
      }
      return fail(400, { errors })
    }
    case "turnstile":
      return fail(403, { errors: { _: TURNSTILE_FAILED_MESSAGE } })
    case "rate_limited":
      return fail(429, {
        errors: {
          _: "Too many submissions from your connection. Please try again later, or email hello@buoy.fish.",
        },
      })
    default:
      return fail(500, { errors: { _: fallback } })
  }
}
