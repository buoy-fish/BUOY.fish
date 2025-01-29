import { PUBLIC_SITE_ACCESS } from "$env/static/public"

export const prerender = PUBLIC_SITE_ACCESS === 'public';
