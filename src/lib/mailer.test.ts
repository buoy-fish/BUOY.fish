vi.mock("@supabase/supabase-js")
vi.mock("$env/dynamic/private")
vi.mock("resend")

import { createClient, type User } from "@supabase/supabase-js"
import { Resend } from "resend"
import * as mailer from "./mailer"

describe("mailer", () => {
  const mockSend = vi.fn().mockResolvedValue({ id: "mock-email-id" })

  const mockSupabaseClient = {
    auth: {
      admin: {
        getUserById: vi.fn(),
      },
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const { env } = await import("$env/dynamic/private")
    env.PRIVATE_RESEND_API_KEY = "mock_resend_api_key"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(createClient as any).mockReturnValue(mockSupabaseClient)

    vi.mocked(Resend).mockImplementation(
      () =>
        ({
          emails: {
            send: mockSend,
          },
        }) as unknown as Resend,
    )
  })

  describe("sendUserEmail", () => {
    const mockUser = { id: "user123", email: "user@example.com" }

    it("sends welcome email", async () => {
      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: { email_confirmed_at: new Date().toISOString() } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { unsubscribed: false },
        error: null,
      })

      await mailer.sendUserEmail({
        user: mockUser as User,
        subject: "Test",
        from_email: "test@example.com",
        template_name: "welcome_email",
        template_properties: {
          companyName: "Test Company",
          WebsiteBaseUrl: "https://test.com",
        },
      })

      expect(mockSend).toHaveBeenCalled()
      const email = mockSend.mock.calls[0][0]
      expect(email.to).toEqual(["user@example.com"])
    })

    it("should not send email if user is unsubscribed", async () => {
      const originalConsoleLog = console.log
      console.log = vi.fn()

      mockSupabaseClient.auth.admin.getUserById.mockResolvedValue({
        data: { user: { email_confirmed_at: new Date().toISOString() } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { unsubscribed: true },
        error: null,
      })

      await mailer.sendUserEmail({
        user: mockUser as User,
        subject: "Test",
        from_email: "test@example.com",
        template_name: "welcome_email",
        template_properties: {},
      })

      expect(mockSend).not.toHaveBeenCalled()

      expect(console.log).toHaveBeenCalledWith(
        "User unsubscribed. Aborting email. ",
        mockUser.id,
        mockUser.email,
      )

      console.log = originalConsoleLog
    })
  })

  describe("sendAdminEmail", () => {
    beforeEach(async () => {
      const { env } = await import("$env/dynamic/private")
      env.PRIVATE_ADMIN_EMAIL = "admin@example.com"
      env.PRIVATE_FROM_ADMIN_EMAIL = "site@example.com"
    })

    it("sends to the admin address and reports success", async () => {
      mockSend.mockResolvedValueOnce({ data: { id: "e1" }, error: null })

      const result = await mailer.sendAdminEmail({ subject: "Hi", body: "B" })

      expect(result).toEqual({ ok: true })
      const email = mockSend.mock.calls[0][0]
      expect(email.to).toEqual(["admin@example.com"])
      expect(email.from).toEqual("site@example.com")
    })

    // Production ran for months with no admin email configured and every
    // contact request silently went nowhere. Unconfigured must be loud.
    it("reports and logs an error when the admin email is not configured", async () => {
      const { env } = await import("$env/dynamic/private")
      env.PRIVATE_ADMIN_EMAIL = ""
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const result = await mailer.sendAdminEmail({ subject: "Hi", body: "B" })

      expect(result).toEqual({ ok: false, reason: "not_configured" })
      expect(mockSend).not.toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it("reports and logs an error when the API key is missing", async () => {
      const { env } = await import("$env/dynamic/private")
      env.PRIVATE_RESEND_API_KEY = ""
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const result = await mailer.sendAdminEmail({ subject: "Hi", body: "B" })

      expect(result).toEqual({ ok: false, reason: "not_configured" })
      expect(mockSend).not.toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it("reports a send failure returned by Resend", async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { name: "validation_error", message: "domain not verified" },
      })
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const result = await mailer.sendAdminEmail({ subject: "Hi", body: "B" })

      expect(result).toEqual({ ok: false, reason: "send_failed" })
      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })

    it("reports a send failure when Resend throws", async () => {
      mockSend.mockRejectedValueOnce(new Error("network down"))
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const result = await mailer.sendAdminEmail({ subject: "Hi", body: "B" })

      expect(result).toEqual({ ok: false, reason: "send_failed" })
      consoleError.mockRestore()
    })
  })

  describe("sendTemplatedEmail", () => {
    it("sends templated email", async () => {
      await mailer.sendTemplatedEmail({
        subject: "Test subject",
        from_email: "from@example.com",
        to_emails: ["to@example.com"],
        template_name: "welcome_email",
        template_properties: {
          companyName: "Test Company",
          WebsiteBaseUrl: "https://test.com",
        },
      })

      expect(mockSend).toHaveBeenCalled()
      const email = mockSend.mock.calls[0][0]
      expect(email.from).toEqual("from@example.com")
      expect(email.to).toEqual(["to@example.com"])
      expect(email.subject).toEqual("Test subject")
      expect(email.text).toContain("This is a quick sample of a welcome email")
      expect(email.html).toContain("This is a quick sample of a welcome email")
      expect(email.html).toContain("<html")
      expect(email.html).toContain("https://test.com")
      expect(email.html).toContain("Test Company")
      expect(email.text).toContain("https://test.com")
      expect(email.text).toContain("Test Company")
    })
  })
})
