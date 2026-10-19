// The exact SMS consent disclosure shown next to the phone field on the
// contact form. The server action stores this same string with each consent
// event so we have an auditable record of the precise language the user
// agreed to (TCPA / carrier toll-free verification requirement).
//
// If you change this text, the stored consent records for new submissions
// change with it — never edit retroactively.
export const SMS_CONSENT_TEXT: string =
  "By checking this box, I agree to receive text messages from Buoy-Fish, Inc. " +
  "at the mobile number provided, including replies to my inquiry, account and " +
  "service notifications, and login verification codes (e.g., “Your " +
  "Buoy.Fish verification code is 482913”). Consent is not a condition of " +
  "purchase. Message frequency varies. Message and data rates may apply. Reply " +
  "STOP to opt out or HELP for help. See our SMS Terms (https://buoy.fish/sms-terms) " +
  "and Privacy Policy (https://buoy.fish/privacy)."

// The short label shown beside the checkbox. The full disclosure above sits one
// click away under "Details" on the same form, so the stored record carries both.
export const SMS_CONSENT_LABEL: string =
  "Text me about my inquiry. Message frequency varies; message and data rates " +
  "may apply. Reply STOP to opt out or HELP for help."

// What the server stores with each consent event: exactly what the form showed.
export const SMS_CONSENT_RECORD: string = `${SMS_CONSENT_LABEL}\n\n${SMS_CONSENT_TEXT}`

// The submitting client's IP, forwarded to the app for the consent record and
// Turnstile's `remoteip`. Cloudflare's header first; null if the platform can't tell us.
export const getClientIp = (
  request: Request,
  getClientAddress: () => string,
): string | null => {
  try {
    return request.headers.get("cf-connecting-ip") ?? getClientAddress()
  } catch {
    return null
  }
}
