<script lang="ts" module>
  // The Turnstile script is loaded once per page and shared by every widget.
  // Explicit rendering (not the `cf-turnstile` class) so the widget also
  // appears after client-side navigation, when the script is already loaded.
  const SCRIPT_URL =
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
  let scriptLoad: Promise<NonNullable<Window["turnstile"]>> | undefined

  function loadTurnstile() {
    scriptLoad ??= new Promise((resolve, reject) => {
      if (window.turnstile) return resolve(window.turnstile)
      const script = document.createElement("script")
      script.src = SCRIPT_URL
      script.async = true
      script.onload = () =>
        window.turnstile
          ? resolve(window.turnstile)
          : reject(new Error("Turnstile script loaded without its API"))
      script.onerror = () => {
        scriptLoad = undefined // let a later mount retry
        reject(new Error("Turnstile script failed to load"))
      }
      document.head.appendChild(script)
    })
    return scriptLoad
  }
</script>

<script lang="ts">
  import { onMount } from "svelte"
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public"

  // Renders the Cloudflare Turnstile widget inside a <form>. The widget adds a
  // hidden `cf-turnstile-response` input that the server action verifies with
  // verifyTurnstile() ($lib/turnstile.ts).
  let { action }: { action: string } = $props()

  let container: HTMLDivElement
  let widgetId: string | undefined
  let loadFailed = $state(false)

  // Tokens are single-use: call after every submission that leaves the form
  // on screen (validation error, server error) so the visitor gets a new one.
  export function reset() {
    if (widgetId !== undefined) window.turnstile?.reset(widgetId)
  }

  onMount(() => {
    let destroyed = false
    loadTurnstile()
      .then((turnstile) => {
        if (destroyed) return
        widgetId = turnstile.render(container, {
          sitekey: PUBLIC_TURNSTILE_SITE_KEY,
          action,
          theme: "light",
          size: "flexible",
        })
      })
      .catch((e) => {
        console.error(e)
        loadFailed = true
      })
    return () => {
      destroyed = true
      if (widgetId !== undefined) window.turnstile?.remove(widgetId)
    }
  })
</script>

<div bind:this={container} class="min-h-[65px] mb-3"></div>
{#if loadFailed}
  <p class="text-red-600 text-sm mb-3">
    The spam check didn't load. Allow challenges.cloudflare.com in your content
    blocker and reload, or email hello@buoy.fish.
  </p>
{/if}
