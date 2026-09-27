#!/usr/bin/env bash
# Post-deploy health check for buoy.fish (buoy-fish/monitoring#42).
#
# Compares what the site serves against the build this job just uploaded
# (--build-dir, i.e. .svelte-kit/cloudflare), so it passes only when the NEW
# deploy is live:
#   1. GET <base>/_app/version.json -> 200, application/json, .version equal to
#      the local build's _app/version.json (SvelteKit stamps a fresh value on
#      every build).
#   2. GET <base>/ -> 200 text/html containing the site title marker and a
#      reference to the local build's /_app/immutable/entry/start.<hash>.js.
#      This proves the home page (served by the Pages worker) is the new build,
#      not an old one, a different site, or a login page.
#
# Retries until --timeout (Pages takes a few seconds to promote a deploy).
#
# Usage: scripts/post-deploy-check.sh --base-url https://buoy.fish \
#          --build-dir .svelte-kit/cloudflare [--timeout SECS]
set -uo pipefail

BASE_URL="" BUILD_DIR="" TIMEOUT=120
INTERVAL="${POST_DEPLOY_CHECK_INTERVAL:-5}"
SITE_MARKER='<title>buoy.fish |'

usage() { echo "usage: $0 --base-url URL --build-dir DIR [--timeout SECS]" >&2; exit 2; }
while [ $# -gt 0 ]; do
  case "$1" in
    --base-url) BASE_URL="${2:-}"; shift 2 ;;
    --build-dir) BUILD_DIR="${2:-}"; shift 2 ;;
    --timeout) TIMEOUT="${2:-}"; shift 2 ;;
    *) usage ;;
  esac
done
[ -n "$BASE_URL" ] && [ -n "$BUILD_DIR" ] || usage
BASE_URL="${BASE_URL%/}"

EXPECTED_VERSION="$(jq -r '.version // empty' "$BUILD_DIR/_app/version.json" 2>/dev/null)"
if [ -z "$EXPECTED_VERSION" ]; then
  echo "FAILED: no .version in $BUILD_DIR/_app/version.json (did the build run?)" >&2; exit 1
fi
START_JS="$(find "$BUILD_DIR/_app/immutable/entry" -maxdepth 1 -name 'start.*.js' -exec basename {} \; 2>/dev/null | head -n 1)"
if [ -z "$START_JS" ]; then
  echo "FAILED: no start.*.js in $BUILD_DIR/_app/immutable/entry (did the build run?)" >&2; exit 1
fi

BODY="$(mktemp)"; trap 'rm -f "$BODY"' EXIT
STATUS="" CTYPE=""
fetch() { # fetch URL -> STATUS, CTYPE, body in $BODY (cache-busted)
  local w
  w="$(curl -sS --max-time 15 -H 'Cache-Control: no-cache' -o "$BODY" -w '%{http_code} %{content_type}' "$1?post_deploy_check=$RANDOM$RANDOM" 2>/dev/null)"
  STATUS="${w%% *}"; CTYPE="${w#* }"; [ "$CTYPE" = "$w" ] && CTYPE=""
  return 0
}

REASON=""
check_version_json() {
  local url="$BASE_URL/_app/version.json" got
  fetch "$url"
  [ "$STATUS" = 200 ] || { REASON="$url: HTTP $STATUS (want 200)"; return 1; }
  case "$CTYPE" in application/json*) ;; *) REASON="$url: content-type '$CTYPE' (want application/json; HTML means an error or login page)"; return 1 ;; esac
  got="$(jq -r '.version // empty' "$BODY" 2>/dev/null)"
  [ "$got" = "$EXPECTED_VERSION" ] || { REASON="$url: version '${got:-<none>}' (want $EXPECTED_VERSION from this build; previous deploy still served?)"; return 1; }
}
check_home() {
  local url="$BASE_URL/"
  fetch "$url"
  [ "$STATUS" = 200 ] || { REASON="$url: HTTP $STATUS (want 200)"; return 1; }
  case "$CTYPE" in text/html*) ;; *) REASON="$url: content-type '$CTYPE' (want text/html)"; return 1 ;; esac
  grep -qF "$SITE_MARKER" "$BODY" || { REASON="$url: missing site marker '$SITE_MARKER' (wrong site or a login page)"; return 1; }
  grep -qF "/_app/immutable/entry/$START_JS" "$BODY" || { REASON="$url: home page does not reference this build's /_app/immutable/entry/$START_JS"; return 1; }
}

deadline=$(( $(date +%s) + TIMEOUT )); attempt=0
while :; do
  attempt=$((attempt + 1))
  if check_version_json && check_home; then
    echo "✓ post-deploy check passed on attempt $attempt: $BASE_URL serves build $EXPECTED_VERSION ($START_JS)"
    exit 0
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "FAILED: post-deploy check did not pass within ${TIMEOUT}s ($attempt attempts). Last error: $REASON" >&2
    exit 1
  fi
  echo "  waiting ($attempt): $REASON"
  sleep "$INTERVAL"
done
