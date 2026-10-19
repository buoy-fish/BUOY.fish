// Routes the CMSaasStarter template served until ADR-0039 removed them. They
// were live and in the sitemap, so search results and bookmarks still reach
// them: sign-in moved to the product itself, and the demo /pricing page's
// visitor is someone asking what Buoy costs.
const RETIRED: [prefix: string, target: string][] = [
  ["/login", "https://app.buoy.fish/"],
  ["/account", "https://app.buoy.fish/"],
  ["/auth", "https://app.buoy.fish/"],
  ["/pricing", "/contact_us"],
]

// The redirect target for a retired path, or null. Matches whole segments, so
// /loginx and /accounts are left alone.
export const retiredRouteRedirect = (pathname: string): string | null => {
  for (const [prefix, target] of RETIRED) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return target
  }
  return null
}
