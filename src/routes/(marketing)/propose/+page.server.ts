import { fail } from "@sveltejs/kit"
import { leadFailure, submitLead } from "$lib/app_leads"
import { getClientIp, SMS_CONSENT_RECORD } from "$lib/sms_consent"
import {
  FUNDING_OPTIONS,
  TIMELINE_OPTIONS,
  type ProposalOption,
} from "./proposal_options"

// Optional answers sent as the lead's details. Empty -> null, so every pilot
// lead has the same keys; a picked option is sent as its label, as shown.
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
  submitProposal: async ({ request, getClientAddress }) => {
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

    const labelOf = (options: ProposalOption[], value: string) =>
      options.find((o) => o.value === value)?.label ?? value
    const details = Object.fromEntries(
      DETAIL_FIELDS.map((name) => {
        const value = field(name).trim()
        if (!value) return [name, null]
        if (name === "funding") return [name, labelOf(FUNDING_OPTIONS, value)]
        if (name === "timeline") return [name, labelOf(TIMELINE_OPTIONS, value)]
        return [name, value]
      }),
    )

    const result = await submitLead({
      kind: "pilot",
      first_name: firstName,
      last_name: lastName,
      email,
      organization: field("organization"),
      phone,
      message: problem,
      details,
      sms_consent: smsConsent,
      ...(smsConsent && { sms_consent_text: SMS_CONSENT_RECORD }),
      turnstile_token: field("cf-turnstile-response"),
      visitor_ip: getClientIp(request, getClientAddress),
      visitor_user_agent: request.headers.get("user-agent"),
    })

    if (!result.ok) {
      return leadFailure(
        result,
        {
          first_name: "first_name",
          last_name: "last_name",
          email: "email",
          organization: "organization",
          phone: "phone",
          message: "problem",
        },
        "We couldn't save your proposal. Please email hello@buoy.fish instead.",
      )
    }
  },
}
