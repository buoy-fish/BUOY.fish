#!/usr/bin/env bash
# Every migration needs a rollback: supabase/migrations/<v>_<name>.sql pairs with
# supabase/rollbacks/<v>_<name>.down.sql (non-empty), and no rollback may be
# orphaned. Supabase CLI has no down migrations, so this pairing is ours; the
# roundtrip test (scripts/migration-roundtrip.sh) proves each down file works.
#
# Migrations before ROLLBACK_CUTOFF are grandfathered: they predate this rule
# and the initial schema has no sensible "down".
# Usage: check-migration-rollbacks.sh [supabase-dir]   (default: supabase)
set -u
DIR="${1:-supabase}"
ROLLBACK_CUTOFF=20260722000000
status=0

for m in "$DIR"/migrations/*.sql; do
  [ -e "$m" ] || continue
  name="$(basename "$m" .sql)"
  [ "${name%%_*}" -lt "$ROLLBACK_CUTOFF" ] && continue
  down="$DIR/rollbacks/$name.down.sql"
  if [ ! -f "$down" ]; then
    echo "missing rollback: supabase/rollbacks/$name.down.sql"; status=1
  elif ! grep -q '[^[:space:]]' "$down"; then
    echo "empty rollback: supabase/rollbacks/$name.down.sql"; status=1
  fi
done

for d in "$DIR"/rollbacks/*.down.sql; do
  [ -e "$d" ] || continue
  name="$(basename "$d" .down.sql)"
  [ -f "$DIR/migrations/$name.sql" ] || { echo "orphaned rollback (no migration): $name"; status=1; }
done

[ $status -eq 0 ] && echo "every migration since $ROLLBACK_CUTOFF has a rollback"
exit $status
