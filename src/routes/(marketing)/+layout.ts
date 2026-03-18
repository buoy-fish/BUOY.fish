// Disable prerendering - serve pages via SSR on Cloudflare
// Prerendering was causing pages to be missing when env vars aren't set at build time
export const prerender = false; 