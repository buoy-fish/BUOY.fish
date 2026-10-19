vi.mock("$env/dynamic/private")
vi.mock("$lib/mailer.js", () => ({
  sendAdminEmail: vi.fn().mockResolvedValue({ ok: true }),
}))

import { env } from "$env/dynamic/private"
import { sendAdminEmail } from "$lib/mailer.js"
import { SMS_CONSENT_RECORD } from "$lib/sms_consent"
import { TURNSTILE_FAILED_MESSAGE } from "$lib/turnstile"
import { stubSiteverify } from "$lib/turnstile_test_helpers"
import { actions } from "./+page.server"

function submit(fields: Record<string, string>) {
  const body = new FormData()
  for (const [k, v] of Object.entries(fields)) body.set(k, v)
  const insert = vi.fn().mockResolvedValue({ error: null })
  const event = {
    request: new Request("http://localhost/contact_us", {
      method: "POST",
      body,
      headers: { "user-agent": "test-agent" },
    }),
    getClientAddress: () => "1.2.3.4",
    locals: { supabaseServiceRole: { from: vi.fn(() => ({ insert })) } },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { result: actions.submitContactUs(event as any), insert }
}

const validContact = {
  first_name: "Ana",
  last_name: "Lopez",
  email: "ana@example.org",
  message: "Hello",
  "cf-turnstile-response": "token",
}

describe("submitContactUs", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    env.PRIVATE_TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
  })

  it("does not save or email a submission whose Turnstile token is refused", async () => {
    stubSiteverify({
      success: false,
      "error-codes": ["invalid-input-response"],
    })

    const { result, insert } = submit(validContact)

    expect(await result).toMatchObject({
      status: 403,
      data: { errors: { _: TURNSTILE_FAILED_MESSAGE } },
    })
    expect(insert).not.toHaveBeenCalled()
    expect(sendAdminEmail).not.toHaveBeenCalled()
  })

  it("saves and emails a submission whose Turnstile token passes", async () => {
    stubSiteverify({ success: true, "error-codes": [] })

    const { result, insert } = submit(validContact)

    expect(await result).toBeUndefined()
    expect(insert).toHaveBeenCalledOnce()
    expect(sendAdminEmail).toHaveBeenCalledOnce()
  })

  it("records an auditable SMS opt-in when the box is checked", async () => {
    stubSiteverify({ success: true, "error-codes": [] })

    const { result, insert } = submit({
      ...validContact,
      phone: "+1 555 0100",
      sms_consent: "on",
    })
    await result

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sms_consent: true,
        sms_consent_at: expect.any(String),
        sms_consent_text: SMS_CONSENT_RECORD,
        sms_consent_ip: "1.2.3.4",
        sms_consent_user_agent: "test-agent",
      }),
    )
  })
})
