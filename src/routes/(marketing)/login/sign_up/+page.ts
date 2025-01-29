import { PUBLIC_SITE_ACCESS } from "$env/static/public"

// Only prerender in production
export const prerender = PUBLIC_SITE_ACCESS === 'public'; 