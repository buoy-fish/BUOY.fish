<script lang="ts">
  import { fade } from "svelte/transition"
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import { onMount } from "svelte"

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

  onMount(() => {
    startAnimationCycle()
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

<!-- Hero Video Section -->
<div class="relative h-screen w-full">
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
    class="relative z-10 flex flex-col items-center justify-center h-full"
  >
    {#if showTypewriter}
      <div
        class="max-w-[800px] mx-auto text-left pl-16 text-secondary font-bold"
        transition:fade
      >
        <h1 class="text-4xl md:text-6xl mb-4">{staticWord}</h1>
        <p class="text-2xl md:text-4xl">{text}</p>
      </div>
    {/if}
  </div>

  <!-- Scroll indicator -->
  <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
    <svg class="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  </div>
</div>

<!-- Mission Statement -->
<section class="py-20 px-6 bg-base-100">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-3xl md:text-5xl font-bold mb-6 text-primary">
      Know where your catch is. Prevent ghost gear.
    </h2>
    <p class="text-lg md:text-xl text-base-content/80 mb-4">
      More than <strong>25 million pots and traps are lost to the ocean every year</strong>.
      Unlike other ocean debris, this "ghost gear" keeps fishing — trapping and killing marine
      life for years after it's abandoned. In the Mid-Atlantic alone, derelict crab pots kill
      an estimated 3.3 million blue crabs annually. Nearly 90% of endangered North Atlantic
      Right Whales have been entangled in fishing gear at least once.
    </p>
    <p class="text-lg md:text-xl text-base-content/80">
      BUOY.fish builds smart buoys that track fishing gear in real time over 40+ miles of open
      ocean — at a fraction of the cost of satellite alternatives. Founded by commercial fishermen
      in San Francisco, we've deployed 80+ connected buoys across Mexico and Canada, recording
      over 160,000 location payloads and proving this technology works at commercial scale.
    </p>
  </div>
</section>

<!-- How It Works -->
<section class="py-20 px-6 bg-base-200">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-primary">How It Works</h2>
    <div class="grid md:grid-cols-3 gap-10">
      <div class="text-center">
        <div class="text-5xl mb-6">
          <svg class="w-16 h-16 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-3">Ruggedized Smart Buoys</h3>
        <p class="text-base-content/70">
          GPS-enabled smart buoys built on proven blow-molded resin shells, fully potted with
          inductive charging — no ports, no seals to fail. Designed to last 10-15 years in
          commercial fishing conditions.
        </p>
      </div>
      <div class="text-center">
        <div class="text-5xl mb-6">
          <svg class="w-16 h-16 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-3">40+ Mile Range, Pennies per Ping</h3>
        <p class="text-base-content/70">
          LoRaWAN transmissions reach over 40 miles at a fraction of a cent per packet. No
          cellular plan, no satellite subscription. Satellite buoys cost $2,000+ with $30-100/month
          fees — our approach makes tracking economically viable for every fisherman.
        </p>
      </div>
      <div class="text-center">
        <div class="text-5xl mb-6">
          <svg class="w-16 h-16 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-3">Real-Time Tracking via App</h3>
        <p class="text-base-content/70">
          Know where your gear is from land or sea. Our app shows real-time GPS location,
          battery level, temperature, and deployment history for every piece of tracked equipment.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Deployments -->
<section class="py-20 px-6 bg-base-100">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">Deployments</h2>
    <p class="text-center text-base-content/60 mb-16 max-w-2xl mx-auto">
      Partnering with GGGI, Pro Natura, Fedecoop, Ocean Conservancy, Go Deep International, and DFO Canada.
    </p>
    <div class="grid md:grid-cols-2 gap-8">
      <a href="/blog/punta-abreojos-deployment" class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="badge badge-success mb-2">Completed</div>
          <h3 class="card-title">Punta Abreojos, Mexico</h3>
          <p class="text-base-content/70">80 smart buoys deployed in the spiny lobster fishery with Fedecoop. 160,000+ location payloads recorded. The largest connected gear deployment in history.</p>
        </div>
      </a>
      <a href="/blog/nova-scotia-trial" class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="badge badge-primary mb-2">Deploying</div>
          <h3 class="card-title">Nova Scotia, Canada (LFA35)</h3>
          <p class="text-base-content/70">60 smart buoys with Go Deep International across 5 fishing vessels. Protecting endangered North Atlantic Right Whale habitat from ghost gear.</p>
        </div>
      </a>
      <a href="/blog/punta-eugenia-isla-natividad" class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="badge badge-secondary mb-2">Next Month</div>
          <h3 class="card-title">Punta Eugenia & Isla Natividad, Mexico</h3>
          <p class="text-base-content/70">Expanding in Baja California with upgraded inductive-charging buoys and hardened spindle designs refined from field feedback.</p>
        </div>
      </a>
      <a href="/blog/costa-rica-gulf-of-nicoya" class="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
        <div class="card-body">
          <div class="badge badge-secondary mb-2">Planned</div>
          <h3 class="card-title">Gulf of Nicoya, Costa Rica</h3>
          <p class="text-base-content/70">First Central American deployment. 5 gateways targeting 90% Gulf coverage, including vessel-based gateways and a lighthouse installation.</p>
        </div>
      </a>
    </div>
  </div>
</section>

<!-- Live Demo CTA -->
<section class="py-20 px-6 bg-primary text-primary-content">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
    <p class="text-lg mb-8 opacity-90">
      Explore our live demo to see how BUOY.fish tracks fishing gear in real time.
    </p>
    <a
      href="https://app.buoy.fish/demo"
      class="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none"
    >
      Launch Live Demo
    </a>
  </div>
</section>

<!-- Testimonial -->
<section class="py-20 px-6 bg-base-200">
  <div class="max-w-3xl mx-auto text-center">
    <svg class="w-12 h-12 mx-auto mb-6 text-primary/30" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
    </svg>
    <blockquote class="text-xl md:text-2xl italic text-base-content/80 mb-6">
      "Ghost gear is a huge problem. Jameson and Tal appear to have an innovative approach to solving it."
    </blockquote>
    <p class="font-bold text-primary">Matt Juanes</p>
    <p class="text-base-content/60">Fishing Vessel Plumeria, San Francisco, CA</p>
  </div>
</section>
