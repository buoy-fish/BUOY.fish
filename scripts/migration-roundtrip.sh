#!/usr/bin/env bash
# Proves every rollback works against a real Supabase Postgres:
#   1. apply all migrations, snapshot the public schema (A)
#   2. run each rollback newest-first (back to the cutoff), marking it reverted
#      in the migration history exactly as the Rollback workflow does in prod;
#      each one must change the schema (an empty-in-effect down file fails)
#   3. re-apply with `supabase migration up` and require the schema == A
# Needs a running local stack: `supabase db start` (config: supabase/config.toml).
# Usage: scripts/migration-roundtrip.sh
set -euo pipefail
cd "$(dirname "$0")/.."
SUPABASE="${SUPABASE:-npx --yes supabase}"
DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54422/postgres}"
ROLLBACK_CUTOFF=20260722000000
WORK="$(mktemp -d)"

snapshot() { # schema-only dump of public (version-matched pg_dump in Docker),
  # without comment lines, which carry timestamps
  $SUPABASE db dump --local --schema public -f "$1.raw" >/dev/null 2>&1
  grep -v '^--' "$1.raw" | sed '/^$/d' > "$1"
}

$SUPABASE db reset --local --no-seed >/dev/null
snapshot "$WORK/A.sql"

prev="$WORK/A.sql"
for m in $(ls -r supabase/migrations/*.sql); do
  name="$(basename "$m" .sql)"; v="${name%%_*}"
  [ "$v" -lt "$ROLLBACK_CUTOFF" ] && break
  psql "$DB_URL" -v ON_ERROR_STOP=1 -q -f "supabase/rollbacks/$name.down.sql"
  $SUPABASE migration repair "$v" --status reverted --local >/dev/null
  snapshot "$WORK/$v.sql"
  if cmp -s "$prev" "$WORK/$v.sql"; then
    echo "FAIL: rollback for $name did not change the schema"; exit 1
  fi
  echo "rolled back $name"
  prev="$WORK/$v.sql"
done

$SUPABASE migration up --local >/dev/null
snapshot "$WORK/B.sql"
if ! diff -u "$WORK/A.sql" "$WORK/B.sql"; then
  echo "FAIL: schema after down+up differs from the original (diff above)"; exit 1
fi
echo "roundtrip ok: every rollback reverses its migration and re-applies cleanly"
