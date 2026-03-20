import adapter from "@sveltejs/adapter-cloudflare"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Use Cloudflare adapter
    adapter: adapter({
      // Disable runtime for better compatibility
      runtime: {
        mode: "off",
      },
    }),
    // Basic prerender config
    prerender: {
      entries: process.env.NODE_ENV === "production" ? [] : [],
      handleHttpError: "warn",
    },
    // allow up to 150kb of style to be inlined with the HTML
    // Faster FCP (First Contentful Paint) by reducing the number of requests
    inlineStyleThreshold: 150000,
  },
  preprocess: vitePreprocess(),
}

export default config
