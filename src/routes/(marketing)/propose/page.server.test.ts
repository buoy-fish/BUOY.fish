vi.mock("$env/dynamic/private")
vi.mock("$lib/mailer.js", () => ({
  sendAdminEmail: vi.fn().mockResolvedValue({ ok: true }),
}))

import { env } from "$env/dynamic/private"
import { sendAdminEmail } from "$lib/mailer.js"
import { TURNSTILE_FAILED_MESSAGE } from "$lib/turnstile"
import { stubSiteverify } from "$lib/turnstile_test_helpers"
import { actions } from "./+page.server"

function submit(fields: Record<string, string>) {
  const body = new FormData()
  for (const [k, v] of Object.entries(fields)) body.set(k, v)
  const insert = vi.fn().mockResolvedValue({ error: null })
  const from = vi.fn(() => ({ insert }))
  const event = {
    request: new Request("http://localhost/propose", {
      method: "POST",
      body,
      headers: { "user-agent": "test-agent" },
    }),
    getClientAddress: () => "1.2.3.4",
    locals: { supabaseServiceRole: { from } },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { result: actions.submitProposal(event as any), insert, from }
}

describe("submitProposal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    env.PRIVATE_TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
  })

  it("requires name, email and the problem, and saves nothing", async () => {
    const siteverify = stubSiteverify({ success: true })

    const { result, insert } = submit({ "cf-turnstile-response": "token" })

    expect(await result).toMatchObject({
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
    expect(insert).not.toHaveBeenCalled()
    expect(siteverify.forms).toEqual([])
  })

  it("rejects malformed answers field by field", async () => {
    stubSiteverify({ success: true })

    const { result, insert } = submit({
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
    expect(insert).not.toHaveBeenCalled()
  })

  it("shows a fallback message when the proposal can't be saved", async () => {
    stubSiteverify({ success: true })
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { result, insert } = submit(validProposal)
    insert.mockResolvedValueOnce({ error: { message: "db down" } })

    expect(await result).toMatchObject({
      status: 500,
      data: {
        errors: {
          _: "We couldn't save your proposal. Please email hello@buoy.fish instead.",
        },
      },
    })
    expect(sendAdminEmail).not.toHaveBeenCalled()
  })

  it("saves a proposal with core fields in columns and the rest in details", async () => {
    stubSiteverify({ success: true, "error-codes": [] })

    const { result, insert, from } = submit({
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
    expect(from).toHaveBeenCalledWith("contact_requests")
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "proposal",
        first_name: "Ana",
        last_name: "Lopez",
        email: "ana@example.org",
        company_name: "Pescadores Unidos",
        phone: "",
        message_body: "Longlines get cut by trawlers and we lose them.",
        sms_consent: false,
        details: {
          role: "Cooperative manager",
          region: "Gulf of Nicoya, Costa Rica",
          gear_type: "Bottom longlines",
          fleet_size: "14 pangas",
          funding: "applying",
          timeline: "3_6_months",
          referral: "Your blog",
        },
      }),
    )
  })

  it("does not save or email a proposal whose Turnstile token is refused", async () => {
    stubSiteverify({
      success: false,
      "error-codes": ["invalid-input-response"],
    })

    const { result, insert } = submit(validProposal)

    expect(await result).toMatchObject({
      status: 403,
      data: { errors: { _: TURNSTILE_FAILED_MESSAGE } },
    })
    expect(insert).not.toHaveBeenCalled()
    expect(sendAdminEmail).not.toHaveBeenCalled()
  })

  it("rejects every proposal when the Turnstile secret is missing", async () => {
    env.PRIVATE_TURNSTILE_SECRET_KEY = ""
    stubSiteverify({ success: true })
    vi.spyOn(console, "error").mockImplementation(() => {})

    const { result, insert } = submit(validProposal)

    expect(await result).toMatchObject({
      status: 403,
      data: { errors: { _: TURNSTILE_FAILED_MESSAGE } },
    })
    expect(insert).not.toHaveBeenCalled()
  })

  it("emails the team a pilot proposal with every answer", async () => {
    stubSiteverify({ success: true, "error-codes": [] })

    const { result } = submit({
      ...validProposal,
      region: "Gulf of Nicoya, Costa Rica",
      funding: "applying",
      timeline: "3_6_months",
    })
    await result

    expect(sendAdminEmail).toHaveBeenCalledOnce()
    const { subject, body } = vi.mocked(sendAdminEmail).mock.calls[0][0]
    expect(subject).toBe("New pilot proposal")
    expect(body).toContain("ana@example.org")
    expect(body).toContain("Longlines get cut by trawlers and we lose them.")
    expect(body).toContain("Gulf of Nicoya, Costa Rica")
    expect(body).toContain("Applying for a grant or program")
    expect(body).toContain("In 3 to 6 months")
  })

  it("stores optional details left blank as null", async () => {
    stubSiteverify({ success: true, "error-codes": [] })

    const { result, insert } = submit(validProposal)

    expect(await result).toBeUndefined()
    expect(insert.mock.calls[0][0].details).toEqual({
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
