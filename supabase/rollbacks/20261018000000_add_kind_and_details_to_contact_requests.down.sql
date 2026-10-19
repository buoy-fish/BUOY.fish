-- Rollback of 20261018000000_add_kind_and_details_to_contact_requests.sql.
-- DESTRUCTIVE: proposals lose their kind and answers. Export rows where
-- kind = 'proposal' first if they must be kept.
ALTER TABLE contact_requests
  DROP COLUMN IF EXISTS details,
  DROP COLUMN IF EXISTS kind;
