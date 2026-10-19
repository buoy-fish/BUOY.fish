-- Rollback of 20260722000000_add_sms_consent_to_contact_requests.sql.
-- DESTRUCTIVE: drops the recorded SMS opt-in evidence. Export the rows first
-- if any consent records must be kept for TCPA audit purposes.
ALTER TABLE contact_requests
  DROP COLUMN IF EXISTS sms_consent_user_agent,
  DROP COLUMN IF EXISTS sms_consent_ip,
  DROP COLUMN IF EXISTS sms_consent_text,
  DROP COLUMN IF EXISTS sms_consent_at,
  DROP COLUMN IF EXISTS sms_consent;
