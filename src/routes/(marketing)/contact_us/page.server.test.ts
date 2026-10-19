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
    request: new Request("http://localhost/contact_us", {
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
  return actions.submitContactUs(event as any)
}

const validContact = {
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.org",
  company: "Cooperativa",
  phone: "",
  message: "Hello",
  "cf-turnstile-response": "token",
}

describe("submitContactUs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    env.PRIVATE_SITE_LEADS_TOKEN = TEST_SITE_LEADS_TOKEN
  })

  it("sends the lead to the app with the visitor's IP, user agent and Turnstile token", async () => {
    const app = stubAppLeads()

    expect(await submit(validContact)).toBeUndefined()

    expect(app.leads).toEqual([
      {
        kind: "contact",
        first_name: "Ana",
        last_name: "Lopez",
        email: "ana@example.org",
        organization: "Cooperativa",
        phone: "",
        message: "Hello",
        sms_consent: false,
        turnstile_token: "token",
        visitor_ip: "203.0.113.7",
        visitor_user_agent: "test-agent",
      },
    ])
  })

  it("sends an SMS opt-in with the exact consent record shown", async () => {
    const app = stubAppLeads()

    await submit({ ...validContact, phone: "+1 555 0100", sms_consent: "on" })

    expect(app.leads[0]).toMatchObject({
      sms_consent: true,
      sms_consent_text: SMS_CONSENT_RECORD,
    })
  })

  it("shows the Turnstile message when the app refuses the token", async () => {
    stubAppLeads({ error: "turnstile_failed" }, 403)

    expect(await submit(validContact)).toMatchObject({
      status: 403,
      data: { errors: { _: TURNSTILE_FAILED_MESSAGE } },
    })
  })

  it("puts the app's field errors on the form's own fields", async () => {
    stubAppLeads(
      {
        errors: {
          email: ["has invalid format"],
          organization: ["should be at most 500 character(s)"],
          visitor_ip: ["must be the visitor's IP address"],
        },
      },
      422,
    )

    expect(await submit(validContact)).toMatchObject({
      status: 400,
      data: {
        errors: {
          email: "Has invalid format",
          company: "Should be at most 500 character(s)",
          _: "We couldn't save your message. Please email hello@buoy.fish instead.",
        },
      },
    })
  })

  it("asks the visitor to wait when the app rate-limits them", async () => {
    stubAppLeads({ error: "rate_limited", retry_after_seconds: 1800 }, 429)

    expect(await submit(validContact)).toMatchObject({
      status: 429,
      data: { errors: { _: expect.stringContaining("hello@buoy.fish") } },
    })
  })

  it("falls back to email when the app is down, and says so in the log", async () => {
    stubAppDown()
    const log = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(await submit(validContact)).toMatchObject({
      status: 500,
      data: { errors: { _: expect.stringContaining("hello@buoy.fish") } },
    })
    expect(log).toHaveBeenCalled()
  })

  it("never calls the app without a token, and fails loudly", async () => {
    const app = stubAppLeads()
    env.PRIVATE_SITE_LEADS_TOKEN = ""
    const log = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(await submit(validContact)).toMatchObject({ status: 500 })
    expect(app.leads).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalled()
  })
})
