import { PUBLIC_SITE_ACCESS } from "$env/static/public"

export function load() {
  return {
    siteAccess: PUBLIC_SITE_ACCESS,
  }
}
