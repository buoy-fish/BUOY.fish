import { retiredRouteRedirect } from "./retired_routes"

// The template's /login, /account and demo /pricing pages were live and in the
// sitemap before ADR-0039 removed them, so search results and bookmarks still
// point at them. Each gets a permanent redirect to where its visitor belongs.
describe("retiredRouteRedirect", () => {
  it.each([
    ["/login", "https://app.buoy.fish/"],
    ["/login/sign_in", "https://app.buoy.fish/"],
    ["/login/sign_up", "https://app.buoy.fish/"],
    ["/account", "https://app.buoy.fish/"],
    ["/account/billing", "https://app.buoy.fish/"],
    ["/auth/callback", "https://app.buoy.fish/"],
    ["/pricing", "/contact_us"],
    ["/pricing/", "/contact_us"],
  ])("sends %s to %s", (path, target) => {
    expect(retiredRouteRedirect(path)).toBe(target)
  })

  it.each([
    "/",
    "/contact_us",
    "/propose",
    "/blog/login-tips",
    "/loginx",
    "/accounts",
  ])("leaves %s alone", (path) => {
    expect(retiredRouteRedirect(path)).toBeNull()
  })
})
