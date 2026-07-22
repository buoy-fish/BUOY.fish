-- SMS opt-in consent record for the contact form (TCPA / Twilio toll-free
-- verification). Stores when consent was given, the exact disclosure text
-- shown to the user, and the submitting client's IP / user agent so the
-- opt-in is auditable.
ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS sms_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_consent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS sms_consent_text text,
  ADD COLUMN IF NOT EXISTS sms_consent_ip text,
  ADD COLUMN IF NOT EXISTS sms_consent_user_agent text;
