<script lang="ts">
  import { fade } from "svelte/transition"
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import { onMount, onDestroy } from "svelte"

  let videoElement: HTMLVideoElement

  // Typewriter effect
  let showTypewriter = false
  let text = ""
  const staticWord = "BUOY.fish"
  const typingText = "let's solve lost and abandoned fishing gear"

  // Inspector HUD state
  let showHud = false
  let hudLat = 26.7142
  let hudLon = -113.5721
  let hudBatteryPct = 87
  let hudBatteryV = 3.82
  let hudTemp = 18.3
  let hudRssi = -92
  let hudSnr = 7.2
  let hudSeq = 4217
  let hudLastPing = "just now"

  // Animation timing thresholds (seconds, synced to video currentTime)
  const HUD_IN = 2.5
  const TEXT_IN = 10
  const ALL_OUT = 20

  // Track state to avoid re-triggering on every timeupdate
  let hudActive = false
  let typewriterStarted = false
  let lastDataUpdate = 0
  let lastCoordUpdate = 0
  let pingStart = 0

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: WebsiteName,
    url: WebsiteBaseUrl,
  }
  const jsonldScript = `<script type="application/ld+json">${JSON.stringify(ldJson) + "<"}/script>`

  function drift(base: number, range: number): number {
    return base + (Math.random() - 0.5) * range
  }

  function resetHudValues() {
    hudLat = 26.7142
    hudLon = -113.5721
    hudBatteryPct = 87
    hudBatteryV = 3.82
    hudTemp = 18.3
    hudRssi = -92
    hudSnr = 7.2
    hudSeq = 4217
    hudLastPing = "just now"
    lastDataUpdate = 0
    lastCoordUpdate = 0
    pingStart = 0
  }

  function updateHudData(t: number) {
    // Coordinate drift every ~2s
    if (t - lastCoordUpdate >= 2) {
      hudLat = drift(hudLat, 0.0003)
      hudLon = drift(hudLon, 0.0003)
      lastCoordUpdate = t
    }

    // Data tick every ~3s
    if (t - lastDataUpdate >= 3) {
      hudSeq += 1
      hudTemp = drift(18.3, 0.4)
      hudBatteryV = drift(3.82, 0.02)
      hudBatteryPct = Math.round(drift(87, 1))
      hudRssi = Math.round(drift(-92, 3))
      hudSnr = drift(7.2, 0.5)
      lastDataUpdate = t
    }

    // Last ping counter
    const elapsed = Math.floor(t - pingStart)
    if (elapsed < 3) hudLastPing = "just now"
    else if (elapsed < 60) hudLastPing = `${elapsed}s ago`
    else hudLastPing = `${Math.floor(elapsed / 60)}m ago`
  }

  async function typeText() {
    for (let i = 0; i <= typingText.length; i++) {
      text = typingText.slice(0, i)
      await new Promise((resolve) => setTimeout(resolve, 112))
    }
  }

  function handleTimeUpdate() {
    if (!videoElement) return
    const t = videoElement.currentTime

    // Reset everything when video loops (currentTime jumps back)
    if (t < HUD_IN) {
      if (hudActive) {
        showHud = false
        showTypewriter = false
        hudActive = false
        typewriterStarted = false
      }
      return
    }

    // Fade out zone
    if (t >= ALL_OUT) {
      showHud = false
      showTypewriter = false
      hudActive = false
      typewriterStarted = false
      return
    }

    // HUD active zone
    if (t >= HUD_IN && !hudActive) {
      resetHudValues()
      pingStart = t
      lastCoordUpdate = t
      lastDataUpdate = t
      showHud = true
      hudActive = true
    }

    if (hudActive) {
      updateHudData(t)
    }

    // Typewriter
    if (t >= TEXT_IN && !typewriterStarted) {
      typewriterStarted = true
      showTypewriter = true
      typeText()
    }
  }

  onMount(() => {
    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate)
    }
  })

  onDestroy(() => {
    if (videoElement) {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
    }
  })
</script>

<svelte:head>
  <title>{WebsiteName}</title>
  <meta name="description" content={WebsiteDescription} />
  <!-- Open Graph -->
  <meta property="og:title" content={WebsiteName} />
  <meta property="og:description" content={WebsiteDescription} />
  <meta property="og:image" content="{WebsiteBaseUrl}/images/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content={WebsiteBaseUrl} />
  <meta property="og:type" content="website" />
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={WebsiteName} />
  <meta name="twitter:description" content={WebsiteDescription} />
  <meta name="twitter:image" content="{WebsiteBaseUrl}/images/og-image.jpg" />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonldScript}
</svelte:head>

<!-- Hero Video Section -->
<div class="relative h-screen w-full overflow-hidden">
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

  <!-- Inspector HUD Overlay -->
  {#if showHud}
    <div
      class="absolute top-[20%] left-6 md:left-[12%] z-20 w-[280px] md:w-[320px]"
      transition:fade={{ duration: 800 }}
    >
      <div class="hud-panel rounded-xl p-4 font-mono text-sm">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
          <div>
            <div class="text-white font-bold text-base tracking-wide">Abreojos-042</div>
            <div class="text-white/50 text-xs">Smart Buoy</div>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span class="text-green-400 text-xs font-semibold">LIVE</span>
          </div>
        </div>

        <!-- Coordinates -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div class="hud-label">LAT</div>
            <div class="hud-value">{hudLat.toFixed(4)}&deg;</div>
          </div>
          <div>
            <div class="hud-label">LON</div>
            <div class="hud-value">{hudLon.toFixed(4)}&deg;</div>
          </div>
        </div>

        <!-- Battery & Temp -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div class="hud-label">BATTERY</div>
            <div class="hud-value">{hudBatteryPct}%
              <span class="text-white/40 text-xs ml-1">{hudBatteryV.toFixed(2)}v</span>
            </div>
            <!-- Battery bar -->
            <div class="w-full h-1.5 bg-white/10 rounded-full mt-1">
              <div
                class="h-full rounded-full transition-all duration-1000"
                class:bg-green-400={hudBatteryPct > 50}
                class:bg-yellow-400={hudBatteryPct <= 50 && hudBatteryPct > 20}
                class:bg-red-400={hudBatteryPct <= 20}
                style="width: {hudBatteryPct}%"
              ></div>
            </div>
          </div>
          <div>
            <div class="hud-label">TEMP</div>
            <div class="hud-value">{hudTemp.toFixed(1)}&deg;C
              <span class="text-white/40 text-xs ml-1">{(hudTemp * 9/5 + 32).toFixed(1)}&deg;F</span>
            </div>
          </div>
        </div>

        <!-- Signal & Seq -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div class="hud-label">RSSI / SNR</div>
            <div class="hud-value text-xs">{hudRssi} dBm / {hudSnr.toFixed(1)}</div>
          </div>
          <div>
            <div class="hud-label">SEQ</div>
            <div class="hud-value">#{hudSeq}</div>
          </div>
        </div>

        <!-- Last Ping -->
        <div class="flex items-center justify-between pt-2 border-t border-white/10">
          <div class="hud-label">LAST PING</div>
          <div class="text-green-400 text-xs font-semibold">{hudLastPing}</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Typewriter overlay — hidden for now; HUD panel is sufficient. Uncomment to restore. -->
  <!--
  <div
    class="relative z-10 flex flex-col items-center justify-center h-full"
  >
    {#if showTypewriter}
      <div
        class="max-w-[800px] mx-auto text-left pl-8 md:pl-16 text-secondary font-bold"
        transition:fade
      >
        <h1 class="text-4xl md:text-6xl mb-4">{staticWord}</h1>
        <p class="text-2xl md:text-4xl">{text}</p>
      </div>
    {/if}
  </div>
  -->

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

<style>
  .hud-panel {
    background: rgba(10, 20, 40, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .hud-label {
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    font-weight: 600;
  }

  .hud-value {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
</style>
