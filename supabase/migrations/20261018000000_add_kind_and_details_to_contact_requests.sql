-- Pilot proposals (/propose) share the contact_requests table with the contact
-- form. `kind` tells them apart; `details` holds the proposal-only answers
-- (role, region, gear type, fleet size, funding, timeline, referral) so new
-- questions don't need a migration each.
ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'contact'
    CHECK (kind IN ('contact', 'proposal')),
  ADD COLUMN IF NOT EXISTS details jsonb;
