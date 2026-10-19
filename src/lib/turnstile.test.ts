vi.mock("$env/dynamic/private")

import { env } from "$env/dynamic/private"
import { verifyTurnstile } from "./turnstile"
import { stubSiteverify } from "./turnstile_test_helpers"

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    env.PRIVATE_TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
  })

  it("rejects and logs an error when the secret is not configured", async () => {
    env.PRIVATE_TURNSTILE_SECRET_KEY = ""
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await verifyTurnstile("some-token", "1.2.3.4")

    expect(result).toEqual({ ok: false, reason: "not_configured" })
    expect(consoleError).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects a missing token without calling siteverify", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    expect(await verifyTurnstile(null, "1.2.3.4")).toEqual({
      ok: false,
      reason: "missing_token",
    })
    expect(await verifyTurnstile("", "1.2.3.4")).toEqual({
      ok: false,
      reason: "missing_token",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("accepts a token that siteverify confirms", async () => {
    const siteverify = stubSiteverify({
      success: true,
      "error-codes": [],
      hostname: "buoy.fish",
    })

    const result = await verifyTurnstile("good-token", "1.2.3.4")

    expect(result).toEqual({ ok: true })
    expect(siteverify.forms).toEqual([
      {
        secret: "1x0000000000000000000000000000000AA",
        response: "good-token",
        remoteip: "1.2.3.4",
      },
    ])
  })

  it("rejects a token that siteverify refuses", async () => {
    // Shape of the real response for a bad / replayed token.
    stubSiteverify({
      success: false,
      "error-codes": ["invalid-input-response"],
      messages: [],
    })

    expect(await verifyTurnstile("bad-token", "1.2.3.4")).toEqual({
      ok: false,
      reason: "rejected",
    })
  })

  it("fails closed and logs when siteverify is unreachable", async () => {
    // A real fetch rejects with a TypeError on DNS / connection failure.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed")),
    )
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(await verifyTurnstile("good-token", "1.2.3.4")).toEqual({
      ok: false,
      reason: "unavailable",
    })
    expect(consoleError).toHaveBeenCalled()
  })

  it("fails closed when siteverify answers with a non-JSON error page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<!DOCTYPE html>", { status: 502 })),
    )
    vi.spyOn(console, "error").mockImplementation(() => {})

    expect(await verifyTurnstile("good-token", "1.2.3.4")).toEqual({
      ok: false,
      reason: "unavailable",
    })
  })
})
