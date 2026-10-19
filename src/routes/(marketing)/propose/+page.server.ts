import { fail } from "@sveltejs/kit"
import { sendAdminEmail } from "$lib/mailer.js"
import { getClientIp, smsConsentColumns } from "$lib/sms_consent"
import { TURNSTILE_FAILED_MESSAGE, verifyTurnstile } from "$lib/turnstile"
import {
  FUNDING_OPTIONS,
  TIMELINE_OPTIONS,
  type ProposalOption,
} from "./proposal_options"

// Optional answers stored in contact_requests.details (jsonb). Empty -> null,
// so every proposal row has the same keys.
const DETAIL_FIELDS = [
  "role",
  "region",
  "gear_type",
  "fleet_size",
  "funding",
  "timeline",
  "referral",
] as const

/** @type {import('./$types').Actions} */
export const actions = {
  submitProposal: async ({
    request,
    getClientAddress,
    locals: { supabaseServiceRole },
  }) => {
    const formData = await request.formData()
    const errors: { [fieldName: string]: string } = {}
    const field = (name: string) => formData.get(name)?.toString() ?? ""

    const firstName = field("first_name")
    if (firstName.length < 2) {
      errors["first_name"] = "First name is required"
    }
    const lastName = field("last_name")
    if (lastName.length < 2) {
      errors["last_name"] = "Last name is required"
    }

    const email = field("email")
    if (email.length < 6) {
      errors["email"] = "Email is required"
    } else if (!email.includes("@") || !email.includes(".")) {
      errors["email"] = "Invalid email"
    }

    const problem = field("problem")
    if (problem.trim().length === 0) {
      errors["problem"] = "Tell us what you're trying to solve"
    } else if (problem.length > 4000) {
      errors["problem"] = `Too long (${problem.length} of 4000)`
    }

    for (const name of [
      "first_name",
      "last_name",
      "email",
      "organization",
      "phone",
      ...DETAIL_FIELDS,
    ]) {
      if (field(name).length > 500) errors[name] = "Too long"
    }

    for (const [name, options] of [
      ["funding", FUNDING_OPTIONS],
      ["timeline", TIMELINE_OPTIONS],
    ] as const) {
      const value = field(name)
      if (value && !options.some((o) => o.value === value)) {
        errors[name] = "Choose an option from the list"
      }
    }

    // SMS consent is optional and never required to submit the form, but
    // consenting only makes sense with a number to text.
    const phone = field("phone")
    const smsConsent = formData.get("sms_consent") != null
    if (smsConsent && phone.trim().length === 0) {
      errors["phone"] = "Enter a mobile number or uncheck the SMS consent box"
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors })
    }

    const clientIp = getClientIp(request, getClientAddress)
    const turnstile = await verifyTurnstile(
      formData.get("cf-turnstile-response")?.toString(),
      clientIp,
    )
    if (!turnstile.ok) {
      return fail(403, { errors: { _: TURNSTILE_FAILED_MESSAGE } })
    }

    const details = Object.fromEntries(
      DETAIL_FIELDS.map((name) => [name, field(name).trim() || null]),
    )
    const organization = field("organization")

    const { error: insertError } = await supabaseServiceRole
      .from("contact_requests")
      .insert({
        kind: "proposal",
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: organization,
        phone,
        message_body: problem,
        details,
        updated_at: new Date(),
        ...smsConsentColumns(smsConsent, request, clientIp),
      })

    if (insertError) {
      console.error("Error saving pilot proposal", insertError)
      return fail(500, {
        errors: {
          _: "We couldn't save your proposal. Please email hello@buoy.fish instead.",
        },
      })
    }

    const labelOf = (options: ProposalOption[], value: string | null) =>
      options.find((o) => o.value === value)?.label ?? ""

    await sendAdminEmail({
      subject: "New pilot proposal",
      body: [
        `New pilot proposal from ${firstName} ${lastName}.`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `SMS consent: ${smsConsent ? "YES" : "no"}`,
        `Organization: ${organization}`,
        `Role: ${details.role ?? ""}`,
        `Region / fishery: ${details.region ?? ""}`,
        `Gear type: ${details.gear_type ?? ""}`,
        `Fleet size: ${details.fleet_size ?? ""}`,
        `Funding: ${labelOf(FUNDING_OPTIONS, details.funding)}`,
        `Timeline: ${labelOf(TIMELINE_OPTIONS, details.timeline)}`,
        `How they heard of us: ${details.referral ?? ""}`,
        `Problem to solve:\n${problem}`,
      ].join("\n\n"),
    })
  },
}
