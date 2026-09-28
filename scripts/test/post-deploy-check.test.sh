#!/usr/bin/env bash
# Tests for scripts/post-deploy-check.sh, with curl replaced by a fixture stub.
# Run: bash scripts/test/post-deploy-check.test.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
CHECK="$HERE/../post-deploy-check.sh"
STUB_BIN="$(mktemp -d)"; cp "$HERE/stub-curl" "$STUB_BIN/curl"; chmod +x "$STUB_BIN/curl"
export POST_DEPLOY_CHECK_INTERVAL=0
pass=0 fail=0

VERSION=1787615210389
START=start.D2E4PD3k.js
page() { printf '<html><head><title>buoy.fish | Let'"'"'s solve lost and abandoned fishing gear.</title><link rel="modulepreload" href="/_app/immutable/entry/%s"></head></html>' "$1"; }

setup() {
  export CURL_STUB_DIR; CURL_STUB_DIR="$(mktemp -d)"
  BUILD="$CURL_STUB_DIR/build"; mkdir -p "$BUILD/_app/immutable/entry"
  printf '{"version":"%s"}' "$VERSION" > "$BUILD/_app/version.json"
  : > "$BUILD/_app/immutable/entry/$START"; : > "$BUILD/_app/immutable/entry/app.CkK5xoCg.js"
}
serve() { # serve <key> <status> <ctype> <body> [ready_after]
  mkdir -p "$CURL_STUB_DIR/$1"
  printf '%s' "$2" > "$CURL_STUB_DIR/$1/status"
  printf '%s' "$3" > "$CURL_STUB_DIR/$1/ctype"
  printf '%s' "$4" > "$CURL_STUB_DIR/$1/body"
  [ -n "${5:-}" ] && printf '%s' "$5" > "$CURL_STUB_DIR/$1/ready_after"
  return 0
}
run_check() { OUT="$(PATH="$STUB_BIN:$PATH" bash "$CHECK" --base-url https://buoy.fish "$@" 2>&1)"; RC=$?; }
expect() { # expect <name> <want_rc: 0|nonzero> [output-substring]
  local ok=1
  if [ "$2" = 0 ]; then [ "$RC" -eq 0 ] || ok=0; else [ "$RC" -ne 0 ] || ok=0; fi
  if [ -n "${3:-}" ] && ! grep -qF -- "$3" <<<"$OUT"; then ok=0; fi
  if [ $ok = 1 ]; then pass=$((pass+1)); echo "ok   - $1"
  else fail=$((fail+1)); echo "FAIL - $1 (rc=$RC)"; while IFS= read -r l; do echo "       $l"; done <<<"$OUT"; fi
}

setup; serve _app_version.json 200 application/json "{\"version\":\"$VERSION\"}"; serve root 200 text/html "$(page $START)"
run_check --build-dir "$BUILD" --timeout 5
expect "new build live passes" 0 "post-deploy check passed"

setup; serve _app_version.json 200 application/json '{"version":"1784757368316"}'; serve root 200 text/html "$(page $START)"
run_check --build-dir "$BUILD" --timeout 1
expect "previous build's version.json fails" 1 "want $VERSION"

setup; serve _app_version.json 200 'text/html; charset=utf-8' '<!DOCTYPE html><html>not found</html>'; serve root 200 text/html "$(page $START)"
run_check --build-dir "$BUILD" --timeout 1
expect "HTML for version.json fails" 1 "content-type"

setup; serve _app_version.json 200 application/json "{\"version\":\"$VERSION\"}"; serve root 200 text/html "$(page start.OLDHASH1.js)"
run_check --build-dir "$BUILD" --timeout 1
expect "home page from a previous build fails" 1 "$START"

setup; serve _app_version.json 200 application/json "{\"version\":\"$VERSION\"}"; serve root 200 text/html "<html><title>Sign in ・ Cloudflare Access</title>/_app/immutable/entry/$START</html>"
run_check --build-dir "$BUILD" --timeout 1
expect "page without the site marker fails" 1 "site marker"

setup; serve _app_version.json 200 application/json "{\"version\":\"$VERSION\"}" 2; serve root 200 text/html "$(page $START)"
run_check --build-dir "$BUILD" --timeout 30
expect "deploy that propagates after retries passes" 0 "post-deploy check passed"

setup
run_check --build-dir "$BUILD" --timeout 1
expect "site unreachable fails with a clear message" 1 "FAILED"

setup; rm "$BUILD/_app/version.json"
serve _app_version.json 200 application/json "{\"version\":\"$VERSION\"}"; serve root 200 text/html "$(page $START)"
run_check --build-dir "$BUILD" --timeout 1
expect "missing local build output is an error" 1 "version.json"

setup
run_check --timeout 1
expect "--build-dir is required" 1 "usage"

echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
