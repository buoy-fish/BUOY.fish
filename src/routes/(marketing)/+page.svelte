<script lang="ts">
  import { fade } from "svelte/transition"
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import { onMount, onDestroy } from "svelte"

  let videoElement: HTMLVideoElement

  // Typewriter effect variables
  let showTypewriter = false
  let text = ""
  const staticWord = "BUOY.fish"
  const typingText = "let's solve lost and abandoned fishing gear"

  // Typewriter effect timing constants
  const TEXT_START_DELAY = 10000 // when text starts appearing (10s into video)
  const FADE_OUT_TIME = 20000 // when text starts fading out (20s into video)

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: WebsiteName,
    url: WebsiteBaseUrl,
  }
  const jsonldScript = `<script type="application/ld+json">${JSON.stringify(ldJson) + "<"}/script>`

  // Lock scrolling on mount, unlock on destroy
  onMount(() => {
    document.body.classList.add("no-scroll")
    startAnimationCycle()
  })

  onDestroy(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("no-scroll")
    }
  })

  async function typeText() {
    for (let i = 0; i <= typingText.length; i++) {
      text = typingText.slice(0, i)
      await new Promise((resolve) => setTimeout(resolve, 112))
    }
  }

  function startAnimationCycle() {
    // Start typing after 10 seconds
    setTimeout(() => {
      showTypewriter = true
      typeText()
    }, TEXT_START_DELAY)

    // Fade out after 20 seconds
    setTimeout(() => {
      showTypewriter = false
    }, FADE_OUT_TIME)
  }
</script>

<svelte:head>
  <title>{WebsiteName}</title>
  <meta name="description" content={WebsiteDescription} />
  {@html jsonldScript}
</svelte:head>

<div class="relative min-h-screen w-full">
  <video
    bind:this={videoElement}
    class="absolute inset-0 w-full h-full object-cover"
    autoplay
    muted
    loop
    playsinline
  >
    <source src="/videos/hero-video-optimized.webm" type="video/webm" />
    <source src="/videos/hero-video-optimized.mp4" type="video/mp4" />
  </video>

  <div
    class="relative z-10 flex flex-col items-center justify-center min-h-screen"
  >
    {#if showTypewriter}
      <div
        class="max-w-[800px] mx-auto text-left pl-16 text-[#4B6BDA] font-bold"
        transition:fade
      >
        <h1 class="text-4xl md:text-6xl mb-4">{staticWord}</h1>
        <p class="text-2xl md:text-4xl">{text}</p>
      </div>
    {/if}
  </div>
</div>
