vi.mock("$env/dynamic/private")

import { env } from "$env/dynamic/private"
import {
  stubAppDown,
  stubAppLeads,
  TEST_SITE_LEADS_TOKEN,
} from "$lib/app_leads_test_helpers"
import { SMS_CONSENT_RECORD } from "$lib/sms_consent"
import { TURNSTILE_FAILED_MESSAGE } from "$lib/turnstile"
import { actions } from "./+page.server"

function submit(fields: Record<string, string>) {
  const body = new FormData()
  for (const [k, v] of Object.entries(fields)) body.set(k, v)
  const event = {
    request: new Request("http://localhost/propose", {
      method: "POST",
      body,
      headers: {
        "user-agent": "test-agent",
        "cf-connecting-ip": "203.0.113.7",
      },
    }),
    getClientAddress: () => "10.0.0.1",
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return actions.submitProposal(event as any)
}

describe("submitProposal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    env.PRIVATE_SITE_LEADS_TOKEN = TEST_SITE_LEADS_TOKEN
  })

  it("requires name, email and the problem, and saves nothing", async () => {
    const app = stubAppLeads()

    expect(await submit({ "cf-turnstile-response": "token" })).toMatchObject({
      status: 400,
      data: {
        errors: {
          first_name: "First name is required",
          last_name: "Last name is required",
          email: "Email is required",
          problem: "Tell us what you're trying to solve",
        },
      },
    })
    expect(app.leads).toEqual([])
  })

  it("rejects malformed answers field by field", async () => {
    const app = stubAppLeads()

    const result = submit({
      ...validProposal,
      email: "not-an-email",
      problem: "x".repeat(4001),
      funding: "a-million-dollars",
      timeline: "yesterday",
      fleet_size: "x".repeat(501),
      sms_consent: "on",
    })

    expect(await result).toMatchObject({
      status: 400,
      data: {
        errors: {
          email: "Invalid email",
          problem: "Too long (4001 of 4000)",
          funding: "Choose an option from the list",
          timeline: "Choose an option from the list",
          fleet_size: "Too long",
          phone: "Enter a mobile number or uncheck the SMS consent box",
        },
      },
    })
    expect(app.leads).toEqual([])
  })

  it("shows a fallback message when the app is down", async () => {
    stubAppDown()
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(await submit(validProposal)).toMatchObject({
      status: 500,
      data: {
        errors: {
          _: "We couldn't save your proposal. Please email hello@buoy.fish instead.",
        },
      },
    })
  })

  it("sends a pilot lead with the core fields and the rest as shown in details", async () => {
    const app = stubAppLeads()

    const result = submit({
      ...validProposal,
      organization: "Pescadores Unidos",
      role: "Cooperative manager",
      region: "Gulf of Nicoya, Costa Rica",
      gear_type: "Bottom longlines",
      fleet_size: "14 pangas",
      funding: "applying",
      timeline: "3_6_months",
      referral: "Your blog",
    })

    expect(await result).toBeUndefined()
    expect(app.leads).toEqual([
      {
        kind: "pilot",
        first_name: "Ana",
        last_name: "Lopez",
        email: "ana@example.org",
        organization: "Pescadores Unidos",
        phone: "",
        message: "Longlines get cut by trawlers and we lose them.",
        sms_consent: false,
        // Labels, not option codes: the record and the hello@ email show
        // what the visitor picked, in their words.
        details: {
          role: "Cooperative manager",
          region: "Gulf of Nicoya, Costa Rica",
          gear_type: "Bottom longlines",
          fleet_size: "14 pangas",
          funding: "Applying for a grant or program",
          timeline: "In 3 to 6 months",
          referral: "Your blog",
        },
        turnstile_token: "token",
        visitor_ip: "203.0.113.7",
        visitor_user_agent: "test-agent",
      },
    ])
  })

  it("sends an SMS opt-in with the exact consent record shown", async () => {
    const app = stubAppLeads()

    await submit({
      ...validProposal,
      phone: "+506 8888 0000",
      sms_consent: "on",
    })

    expect(app.leads[0]).toMatchObject({
      sms_consent: true,
      sms_consent_text: SMS_CONSENT_RECORD,
    })
  })

  it("shows the Turnstile message when the app refuses the token", async () => {
    stubAppLeads({ error: "turnstile_failed" }, 403)

    expect(await submit(validProposal)).toMatchObject({
      status: 403,
      data: { errors: { _: TURNSTILE_FAILED_MESSAGE } },
    })
  })

  it("puts the app's errors on the pilot form's own fields", async () => {
    stubAppLeads(
      {
        errors: {
          message: ["should be at most 4000 character(s)"],
          organization: ["is invalid"],
        },
      },
      422,
    )

    expect(await submit(validProposal)).toMatchObject({
      status: 400,
      data: {
        errors: {
          problem: "Should be at most 4000 character(s)",
          organization: "Is invalid",
        },
      },
    })
  })

  it("sends optional answers left blank as null", async () => {
    const app = stubAppLeads()

    expect(await submit(validProposal)).toBeUndefined()
    expect(app.leads[0].details).toEqual({
      role: null,
      region: null,
      gear_type: null,
      fleet_size: null,
      funding: null,
      timeline: null,
      referral: null,
    })
  })
})

const validProposal = {
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.org",
  problem: "Longlines get cut by trawlers and we lose them.",
  "cf-turnstile-response": "token",
}
