#!/usr/bin/env bash
# Tests for scripts/check-migration-rollbacks.sh against throwaway supabase dirs.
# Run: bash scripts/test/check-migration-rollbacks.test.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
CHECK="$HERE/../check-migration-rollbacks.sh"
pass=0 fail=0

setup() {
  DIR="$(mktemp -d)"; mkdir -p "$DIR/migrations" "$DIR/rollbacks"
}
mig() { echo "select 1;" > "$DIR/migrations/$1.sql"; }
down() { echo "select 1;" > "$DIR/rollbacks/$1.down.sql"; }
run_check() { OUT="$(bash "$CHECK" "$DIR" 2>&1)"; RC=$?; }
expect() { # expect <name> <want_rc: 0|nonzero> [output-substring]
  local ok=1
  if [ "$2" = 0 ]; then [ "$RC" -eq 0 ] || ok=0; else [ "$RC" -ne 0 ] || ok=0; fi
  if [ -n "${3:-}" ] && ! grep -qF -- "$3" <<<"$OUT"; then ok=0; fi
  if [ $ok = 1 ]; then pass=$((pass+1)); echo "ok   - $1"
  else fail=$((fail+1)); echo "FAIL - $1 (rc=$RC)"; while IFS= read -r l; do echo "       $l"; done <<<"$OUT"; fi
}

setup; mig 20260722000000_add_sms; down 20260722000000_add_sms
run_check
expect "a migration with its rollback passes" 0

setup; mig 20261018000000_add_kind
run_check
expect "a migration without a rollback fails and names it" nonzero "20261018000000_add_kind"

setup; mig 20240730010101_initial; mig 20240731051052_add_unsubscribed
run_check
expect "migrations before the cutoff are grandfathered" 0

setup; mig 20260722000000_add_sms; down 20260722000000_add_sms; down 20261099000000_orphan
run_check
expect "a rollback with no migration fails and names it" nonzero "20261099000000_orphan"

setup; mig 20260722000000_add_sms; echo "" > "$DIR/rollbacks/20260722000000_add_sms.down.sql"
run_check
expect "an empty rollback fails" nonzero "20260722000000_add_sms"

echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
