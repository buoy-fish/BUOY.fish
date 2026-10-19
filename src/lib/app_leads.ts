import { fail } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { TURNSTILE_FAILED_MESSAGE } from "$lib/turnstile"

// Contact and pilot submissions live in app.buoy.fish (ADR-0039). This server
// action client is the only way a lead leaves the site: the app verifies
// Turnstile, stores the lead with its SMS-consent evidence, and emails hello@.
const APP_LEADS_URL = "https://app.buoy.fish/api/v1/site/leads"

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
  | { ok: true; notified: boolean }
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

  let resp: Response
  try {
    resp = await fetch(APP_LEADS_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.PRIVATE_SITE_LEADS_TOKEN}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(15_000),
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
    return { ok: true, notified: body?.notified !== false }
  }

  if (resp.status === 422 && body?.errors) {
    return { ok: false, reason: "invalid", errors: firstMessages(body.errors) }
  }
  if (resp.status === 403) return { ok: false, reason: "turnstile" }
  if (resp.status === 429) return { ok: false, reason: "rate_limited" }

  console.error(`Lead refused by app.buoy.fish: HTTP ${resp.status}`, body)
  return { ok: false, reason: "unavailable" }
}

// The app answers `{field: ["message", ...]}`; a form shows one line per field.
const firstMessages = (errors: Record<string, string[]>) =>
  Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => {
      const first = String(messages?.[0] ?? "is invalid")
      return [field, first.charAt(0).toUpperCase() + first.slice(1)]
    }),
  )

// What a failed submission shows. `formFields` maps the app's lead fields to
// this form's input names; an error on anything else (the visitor's IP, the
// lead kind) is the site's bug, not the visitor's, so it gets the fallback.
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
