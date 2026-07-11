<script lang="ts">
  import { onMount } from "svelte"
  import { env } from "$env/dynamic/public"

  // Chatwoot live-chat "message us" widget (chat.buoy.fish — see
  // buoy-services docs/adr/0013). Inert until BOTH public env vars are set, so
  // this can ship to prod before the Chatwoot inbox exists: no token → no
  // script load → no widget. Flip it on at cutover by setting the vars in the
  // Cloudflare Pages project (they're PUBLIC_ — safe to expose; the website
  // token is a client-side value by design).
  //
  //   PUBLIC_CHATWOOT_BASE_URL=https://chat.buoy.fish
  //   PUBLIC_CHATWOOT_TOKEN=<website inbox token from the Chatwoot dashboard>
  const baseUrl = env.PUBLIC_CHATWOOT_BASE_URL
  const websiteToken = env.PUBLIC_CHATWOOT_TOKEN

  onMount(() => {
    if (!baseUrl || !websiteToken) return
    if (document.getElementById("chatwoot-sdk")) return

    const g = document.createElement("script")
    g.id = "chatwoot-sdk"
    g.src = `${baseUrl}/packs/js/sdk.js`
    g.defer = true
    g.async = true
    g.onload = () => {
      // @ts-expect-error — chatwootSDK is injected by the loaded SDK
      window.chatwootSDK.run({ websiteToken, baseUrl })
    }
    document.head.appendChild(g)
  })
</script>
