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
