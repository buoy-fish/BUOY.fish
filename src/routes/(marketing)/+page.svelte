<script lang="ts">
  import { fade } from "svelte/transition"
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import { onMount, onDestroy } from "svelte"
  import { deployments, mapLinks, stageMeta } from "$lib/data/deployments"
  import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel"
  import AutoScroll from "embla-carousel-auto-scroll"

  let videoElement: HTMLVideoElement
  let viewportEl: HTMLDivElement
  let embla: EmblaCarouselType | undefined

  // Partners carousel (Embla + AutoScroll): drifts left continuously and loops
  // forever. Embla moves the strip with a sub-pixel translate3d, which is what
  // keeps the drift smooth; driving scrollLeft instead rounds every frame to a
  // whole device pixel, and at a slow drift those steps show as visible hops.
  // It drifts only while canDrift(): no mouse over the strip or its arrows, no
  // drag in progress, no keyboard focus on an arrow, and prefers-reduced-motion
  // off. syncDrift() applies that rule and runs on every event that can change
  // it; play() waits RESUME_MS, so it resumes 2s after the visitor lets go.
  // The plugin's own hover and resume handling stays off on purpose
  // (stopOnMouseEnter false; stopOnInteraction true, which keeps only its stop
  // on pointerDown): it reads a tap's compatibility mouseenter as a hover,
  // freezing the strip on phones, and forgets the hover whenever Embla
  // re-inits on resize.
  // Ceiling: Embla only loops when the slides overflow the viewport, so the
  // logos render COPIES times (3 copies, ~4170px with six logos). On a
  // viewport wider than ~3,940 CSS px Embla turns the loop off, and the strip
  // then holds still (syncDrift won't run the plugin without a loop). If that
  // matters, derive the copy count from the viewport width.
  const COPIES = 3
  const copies = Array.from({ length: COPIES }, (_, i) => i)
  const DRIFT_PX_PER_S = 40
  const RESUME_MS = 2000
  let hovering = false
  let dragging = false
  let keyboardFocus = false
  let onScreen = false
  let reduceMotion: MediaQueryList | undefined

  function canDrift() {
    return (
      onScreen &&
      !hovering &&
      !dragging &&
      !keyboardFocus &&
      !reduceMotion?.matches
    )
  }
  function syncDrift() {
    if (!embla) return
    const autoScroll = embla.plugins().autoScroll
    // Without a loop the drift would hit the end, stop, settle and restart
    // forever. And once every logo fits there is a single snap, the plugin's
    // init returned early, and play() would leave Embla with no scroll body
    // (a TypeError every frame). stop() is a no-op on a plugin that never ran.
    if (!embla.internalEngine().options.loop) {
      autoScroll?.stop()
      return
    }
    if (canDrift()) autoScroll?.play()
    else autoScroll?.stop()
  }

  $effect(() => {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const api = EmblaCarousel(
      viewportEl,
      // Free momentum drag, except under reduced motion: no glide there.
      { loop: true, dragFree: !reduceMotion.matches, align: "start" },
      [
        AutoScroll({
          speed: DRIFT_PX_PER_S / 60, // the unit is px per 1/60 s step
          startDelay: RESUME_MS, // also the delay before every play()
          playOnInit: false, // syncDrift() starts it, here and after reInit
          stopOnInteraction: true,
          stopOnMouseEnter: false,
          stopOnFocusIn: false,
        }),
      ],
    )
    embla = api
    api
      .on("pointerDown", () => {
        dragging = true
        syncDrift()
      })
      .on("pointerUp", (api) => {
        dragging = false
        // A release that throws the strip glides and then fires "settle". One
        // that doesn't move it (a tap, a vertical page scroll starting here,
        // a drag held still) starts no animation and never fires "settle", so
        // resume now. scrollBody is Embla's internal engine; the version is
        // pinned and the AutoScroll plugin itself relies on it.
        if (api.internalEngine().scrollBody.settled()) syncDrift()
      })
      // A drag's glide and an arrow step end in "settle". The drift itself
      // never settles, since it never stops moving.
      .on("settle", syncDrift)
      .on("reInit", () => {
        // Re-init tears down Embla's drag listeners, so a drag in progress
        // never gets its pointerUp; don't let it hold the drift forever.
        dragging = false
        syncDrift() // re-init also re-runs the plugin's init
      })
    // reInit fires "reInit", which calls syncDrift.
    const motionChange = () => api.reInit({ dragFree: !reduceMotion?.matches })
    reduceMotion.addEventListener("change", motionChange)
    // Don't spend a 60Hz animation loop on a strip nobody can see. A fast
    // scroll can queue several entries; the last one is current.
    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting
      syncDrift()
    })
    visibility.observe(viewportEl)
    return () => {
      visibility.disconnect()
      reduceMotion?.removeEventListener("change", motionChange)
      api.destroy()
      embla = undefined
    }
  })

  // Pointer events report the real input type even for a tap's compatibility
  // mouse events, so only an actual mouse counts as hovering.
  function hoverChange(e: PointerEvent, entering: boolean) {
    if (e.pointerType !== "mouse") return
    hovering = entering
    syncDrift()
  }
  // A keyboard user holds it still by focusing an arrow. A mouse click also
  // focuses the button but isn't :focus-visible, so it doesn't count until a
  // key is pressed on it.
  function focusChange(e: FocusEvent, entering: boolean) {
    keyboardFocus = entering && (e.target as Element).matches(":focus-visible")
    syncDrift()
  }
  function keyPressed() {
    keyboardFocus = true
    syncDrift()
  }

  function rotate(direction: 1 | -1) {
    if (!embla) return
    embla.plugins().autoScroll?.stop() // the step's "settle" resumes it
    const jump = reduceMotion?.matches ?? false // step without animating
    if (direction === 1) embla.scrollNext(jump)
    else embla.scrollPrev(jump)
  }

  const partners = [
    {
      name: "GGGI",
      logo: "/images/partners/gggi.png",
      alt: "Global Ghost Gear Initiative",
      description:
        "Official GGGI member, committed to preventing ghost gear worldwide.",
      invert: false,
      darkBg: false,
    },
    {
      name: "Fedecoop",
      logo: "/images/partners/fedecoop.png",
      alt: "Fedecoop",
      description:
        "Deploying 130+ smart buoys in Baja California's spiny lobster fishery.",
      invert: true,
      darkBg: true,
    },
    {
      name: "Tidal Marine",
      logo: "/images/partners/tidal.png",
      alt: "Tidal Marine",
      description:
        "Buoy manufacturing partner for ruggedized commercial hardware.",
      invert: true,
      darkBg: true,
    },
    {
      name: "IRNAS",
      logo: "/images/partners/irnas.png",
      alt: "IRNAS",
      description: "Technology partner for BUOY's GPS/LoRaWAN hardware.",
      invert: true,
      darkBg: true,
    },
    {
      name: "SMTP",
      logo: "/images/partners/smtpv2.png",
      alt: "Schmidt Marine Technology Partners",
      description:
        "Funding partner through GGGI, with mentorship and a global ocean network.",
      invert: false,
      darkBg: false,
    },
    {
      name: "Alchemist",
      logo: "/images/partners/alchemist.png",
      alt: "Alchemist Accelerator",
      description:
        "Enterprise startup accelerator — BUOY joined as part of Class 40.",
      invert: true,
      darkBg: true,
    },
  ]
  let taglineEl: HTMLParagraphElement
  let taglineLeft = $state(0)
  let taglineHidden = $state(false) // stays true from HUD appearance until video loops
  let taglineOpacity = $derived(taglineHidden ? 0 : 1)
  let showSecondTagline = $state(false) // "One buoy at a time."

  // Typewriter effect — commented out, kept for future use
  // let showTypewriter = false
  // let text = ""
  // const staticWord = "BUOY.fish"
  // const typingText = "let's solve lost and abandoned fishing gear"

  // Inspector HUD state
  let showHud = $state(false)
  let hudLat = $state(26.7142)
  let hudLon = $state(-113.5721)
  let hudBatteryPct = $state(87)
  let hudBatteryV = $state(3.82)
  let hudTemp = $state(18.3)
  let hudRssi = $state(-92)
  let hudSnr = $state(7.2)
  let hudSeq = $state(4217)
  let hudLastPing = $state("just now")

  // Animation timing thresholds (seconds, synced to video currentTime)
  const TAGLINE_SWAP = 7 // swap to "One buoy at a time."
  const HUD_IN = 12 // HUD appears, second tagline fades out
  const ALL_OUT = 20

  // Track state to avoid re-triggering on every timeupdate
  let hudActive = false
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

  // Typewriter function — commented out, kept for future use
  // async function typeText() {
  //   for (let i = 0; i <= typingText.length; i++) {
  //     text = typingText.slice(0, i)
  //     await new Promise((resolve) => setTimeout(resolve, 112))
  //   }
  // }

  function handleTimeUpdate() {
    if (!videoElement) return
    const t = videoElement.currentTime

    // Reset everything when video loops (currentTime jumps back)
    if (t < TAGLINE_SWAP) {
      if (hudActive) {
        showHud = false
        hudActive = false
      }
      taglineHidden = false
      showSecondTagline = false
      return
    }

    // Swap tagline: fade out "Solving..." and fade in "One buoy at a time."
    if (t >= TAGLINE_SWAP && t < HUD_IN - 1.25 && !showSecondTagline) {
      taglineHidden = true
      showSecondTagline = true
    }

    // Fade out second tagline 1.25s before HUD
    if (t >= HUD_IN - 1.25 && showSecondTagline) {
      showSecondTagline = false
    }

    // Fade out zone
    if (t >= ALL_OUT) {
      showHud = false
      hudActive = false
      return
    }

    // HUD card appears
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
  }

  function updateTaglineLeft() {
    if (taglineEl) {
      taglineLeft = taglineEl.getBoundingClientRect().left
    }
  }

  onMount(() => {
    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate)
    }
    updateTaglineLeft()
    window.addEventListener("resize", updateTaglineLeft)
  })

  onDestroy(() => {
    if (videoElement) {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", updateTaglineLeft)
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
<div class="relative h-screen w-full overflow-hidden bg-neutral">
  <!-- Poster image shown while video loads (especially helpful on mobile/slow connections) -->
  <img
    src="/images/hero-poster.jpg"
    alt="BUOY.fish hero"
    class="absolute inset-0 w-full h-full object-cover"
  />
  <!-- The footage must stay SDR (BT.709). The original iPhone clip was
       HDR (HLG); on XDR displays it rendered brighter than white text and washed
       the tagline out. dynamic-range-limit caps any future HDR asset to SDR too
       (inline because svelte-check's CSS linter doesn't know the property yet). -->
  <video
    bind:this={videoElement}
    class="absolute inset-0 w-full h-full object-cover"
    style="dynamic-range-limit: standard"
    autoplay
    muted
    loop
    playsinline
    poster="/images/hero-poster.jpg"
  >
    <source src="/videos/hero-video-optimized.webm" type="video/webm" />
    <source src="/videos/hero-video-optimized.mp4" type="video/mp4" />
  </video>

  <!-- Tagline 1 — "Solving lost and abandoned fishing gear." -->
  <div
    class="absolute left-1/2 -translate-x-1/2 top-28 hidden md:block z-30 pointer-events-none"
    style="opacity: {taglineOpacity}; transition: opacity 1400ms ease"
  >
    <p
      bind:this={taglineEl}
      class="hero-tagline text-white text-4xl font-semibold tracking-wide whitespace-nowrap"
    >
      Solving lost and abandoned fishing gear.
    </p>
  </div>

  <!-- Tagline 2 — "One buoy at a time." -->
  <div
    class="absolute left-1/2 -translate-x-1/2 top-[10.5rem] hidden md:block z-30 pointer-events-none"
    style="opacity: {showSecondTagline
      ? 1
      : 0}; transition: opacity 1400ms ease 250ms"
  >
    <p
      class="hero-tagline text-white text-4xl font-semibold tracking-wide whitespace-nowrap"
    >
      One buoy at a time.
    </p>
  </div>

  <!-- Inspector HUD Overlay — Desktop: floating card, Mobile: compact top bar -->
  {#if showHud}
    <!-- Desktop HUD card -->
    <div
      class="hidden md:block absolute top-[20%] z-20 w-[320px]"
      style="left: {taglineLeft}px"
      transition:fade={{ duration: 920, delay: 250 }}
    >
      <div class="hud-panel rounded-xl p-4 font-mono text-sm">
        <!-- Header -->
        <div
          class="flex items-center justify-between mb-3 pb-2 border-b border-white/10"
        >
          <div>
            <div class="text-white font-bold text-base tracking-wide">
              Abreojos-042
            </div>
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
            <div class="hud-value">
              {hudBatteryPct}%
              <span class="text-white/40 text-xs ml-1"
                >{hudBatteryV.toFixed(2)}v</span
              >
            </div>
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
            <div class="hud-value">
              {hudTemp.toFixed(1)}&deg;C
              <span class="text-white/40 text-xs ml-1"
                >{((hudTemp * 9) / 5 + 32).toFixed(1)}&deg;F</span
              >
            </div>
          </div>
        </div>

        <!-- Signal & Seq -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div class="hud-label">RSSI / SNR</div>
            <div class="hud-value text-xs">
              {hudRssi} dBm / {hudSnr.toFixed(1)}
            </div>
          </div>
          <div>
            <div class="hud-label">SEQ</div>
            <div class="hud-value">#{hudSeq}</div>
          </div>
        </div>

        <!-- Last Ping -->
        <div
          class="flex items-center justify-between pt-2 border-t border-white/10"
        >
          <div class="hud-label">LAST PING</div>
          <div class="text-green-400 text-xs font-semibold">{hudLastPing}</div>
        </div>
      </div>
    </div>

    <!-- Mobile HUD bar — compact strip below logo + nav links -->
    <div
      class="md:hidden absolute top-[120px] left-0 right-0 z-20 px-2"
      transition:fade={{ duration: 920, delay: 250 }}
    >
      <div class="hud-panel rounded-lg px-3 py-2 font-mono text-xs">
        <!-- Top row: name + live indicator -->
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <span class="text-white font-bold text-sm">Abreojos-042</span>
            <div class="flex items-center gap-1">
              <div
                class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"
              ></div>
              <span class="text-green-400 text-[10px] font-semibold">LIVE</span>
            </div>
          </div>
          <span class="text-green-400 text-[10px] font-semibold"
            >{hudLastPing}</span
          >
        </div>
        <!-- Data row -->
        <div class="flex items-center justify-between text-[11px]">
          <div>
            <span class="hud-label">LAT</span>
            <span class="text-white/90 ml-1">{hudLat.toFixed(4)}&deg;</span>
          </div>
          <div>
            <span class="hud-label">LON</span>
            <span class="text-white/90 ml-1">{hudLon.toFixed(4)}&deg;</span>
          </div>
          <div>
            <span class="hud-label">BAT</span>
            <span class="text-white/90 ml-1">{hudBatteryPct}%</span>
          </div>
          <div>
            <span class="hud-label">TEMP</span>
            <span class="text-white/90 ml-1">{hudTemp.toFixed(1)}&deg;C</span>
          </div>
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
    <svg
      class="w-8 h-8 text-white/70"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
      />
    </svg>
  </div>
</div>

<!-- Mission Statement -->
<section class="py-20 px-6 bg-base-100">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-3xl md:text-5xl font-bold mb-6 text-primary">
      Know where your catch is.<br />Prevent ghost gear.
    </h2>
    <p class="text-lg md:text-xl text-base-content/80 mb-4">
      More than <strong
        >25 million pots and traps are lost to the ocean every year</strong
      >. Unlike other ocean debris, this "ghost gear" keeps fishing — trapping
      and killing marine life for years after it's abandoned. In the
      Mid-Atlantic alone, derelict crab pots kill an estimated 3.3 million blue
      crabs annually. Nearly 90% of endangered North Atlantic Right Whales have
      been entangled in fishing gear at least once.
    </p>
    <p class="text-lg md:text-xl text-base-content/80">
      BUOY.fish builds smart buoys that track fishing gear in real time over 40+
      miles of open ocean — at a fraction of the cost of satellite alternatives.
      Founded by commercial fishermen in San Francisco, we've deployed 130+
      connected buoys across Mexico and Canada, recording over 600,000 location
      payloads and proving this technology works at commercial scale.
    </p>
  </div>
</section>

<!-- How It Works -->
<section class="py-20 px-6 bg-base-200">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-primary">
      How It Works
    </h2>
    <div class="grid md:grid-cols-3 gap-10">
      <div class="text-center">
        <div class="text-5xl mb-6">
          <svg
            class="w-16 h-16 mx-auto text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-3">Ruggedized Smart Buoys</h3>
        <p class="text-base-content/70">
          GPS-enabled smart buoys built on proven blow-molded resin shells,
          fully potted with inductive charging — no ports, no seals to fail.
          Designed to last 10-15 years in commercial fishing conditions.
        </p>
      </div>
      <div class="text-center">
        <div class="text-5xl mb-6">
          <svg
            class="w-16 h-16 mx-auto text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-3">40+ Mile Range, Pennies per Ping</h3>
        <p class="text-base-content/70">
          LoRaWAN transmissions reach over 40 miles at a fraction of a cent per
          packet. No cellular plan, no satellite subscription. Satellite buoys
          cost $2,000+ with $30-100/month fees — our approach makes tracking
          economically viable for every fisherman.
        </p>
      </div>
      <div class="text-center">
        <div class="text-5xl mb-6">
          <svg
            class="w-16 h-16 mx-auto text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-3">Real-Time Tracking via App</h3>
        <p class="text-base-content/70">
          Know where your gear is from land or sea. Our app shows real-time GPS
          location, battery level, temperature, and deployment history for every
          piece of tracked equipment. Use it on your phone, tablet, or computer.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Deployments -->
<section class="py-20 px-6 bg-base-100">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
      Deployments
    </h2>
    <p class="text-center text-base-content/60 mb-16 max-w-2xl mx-auto">
      Partnering with GGGI, Pro Natura, Fedecoop, Ocean Conservancy, Go Deep
      International, and DFO Canada.
    </p>
    <div class="grid md:grid-cols-2 gap-8">
      {#each deployments as d (d.slug)}
        {@const map = mapLinks(d)}
        <!-- The title link stretches over the whole card (after:inset-0); the
             map link sits above it (z-10) so the two never nest. -->
        <div
          class="card relative bg-base-200 shadow-md hover:shadow-lg transition-shadow"
        >
          <div class="card-body">
            <div class="badge {stageMeta[d.stage].badgeClass} mb-2">
              {stageMeta[d.stage].label}
            </div>
            <h3 class="card-title">
              <a href={`/blog/${d.slug}`} class="after:absolute after:inset-0"
                >{d.title}</a
              >
            </h3>
            <p class="text-base-content/70">{d.blurb}</p>
            {#if map}
              <a
                href={map.timeline ?? map.coverage}
                class="link link-primary relative z-10 mt-2 w-fit text-sm font-semibold"
                >See it on the map</a
              >
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Partners -->
<section class="py-20 bg-base-200">
  <div class="mx-auto">
    <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">
      Partners
    </h2>
    <p class="text-center text-base-content/60 mb-16 max-w-2xl mx-auto px-6">
      Working with leading organizations to improve the lives of fishermen and
      protect the health of our oceans.
    </p>
    <div
      class="relative"
      role="region"
      aria-label="Partners"
      onpointerenter={(e) => hoverChange(e, true)}
      onpointerleave={(e) => hoverChange(e, false)}
      onfocusin={(e) => focusChange(e, true)}
      onfocusout={(e) => focusChange(e, false)}
    >
      <!-- Embla viewport > container > slides. The logos repeat COPIES times
           so there is always enough strip to loop. -->
      <div
        bind:this={viewportEl}
        class="overflow-hidden py-4 select-none cursor-grab active:cursor-grabbing"
      >
        <div class="flex touch-pan-y">
          {#each copies as copy}
            {#each partners as p}
              <!-- Embla sets a transform on this wrapper to loop it, so the
                   card's own hover lift lives on the inner element. -->
              <div
                class="flex-none pl-6"
                aria-hidden={copy > 0 ? "true" : undefined}
              >
                <div
                  class="group relative w-52 h-36 flex items-center justify-center p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 {p.darkBg
                    ? 'bg-base-100 group-hover:bg-[#1a3a5c]'
                    : 'bg-base-100'}"
                >
                  <img
                    src={p.logo}
                    draggable="false"
                    alt={p.alt}
                    class="h-16 md:h-20 object-contain transition-all duration-300 {p.invert
                      ? 'invert grayscale group-hover:invert-0 group-hover:grayscale-0'
                      : 'grayscale group-hover:grayscale-0'}"
                  />
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-primary/95 text-primary-content rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4"
                  >
                    <p class="text-sm text-center font-medium">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            {/each}
          {/each}
        </div>
      </div>
      <!-- Left/right scroll buttons -->
      <button
        class="absolute left-1 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm bg-base-100/90 border-none shadow-md hover:bg-base-100"
        onclick={() => rotate(-1)}
        onkeydown={keyPressed}
        aria-label="Scroll partners left"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          /></svg
        >
      </button>
      <button
        class="absolute right-1 top-1/2 -translate-y-1/2 z-10 btn btn-circle btn-sm bg-base-100/90 border-none shadow-md hover:bg-base-100"
        onclick={() => rotate(1)}
        onkeydown={keyPressed}
        aria-label="Scroll partners right"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          /></svg
        >
      </button>
    </div>
  </div>
</section>

<!-- Live Demo CTA -->
<section class="py-20 px-6 bg-primary text-primary-content">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
    <p class="text-lg mb-8 opacity-90">
      Explore our live demo to see how BUOY.fish tracks fishing gear in real
      time.
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
    <svg
      class="w-12 h-12 mx-auto mb-6 text-primary/30"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z"
      />
    </svg>
    <blockquote class="text-xl md:text-2xl italic text-base-content/80 mb-6">
      "Ghost gear is a huge problem. Jameson and Tal appear to have an
      innovative approach to solving it."
    </blockquote>
    <p class="font-bold text-primary">Matt Juanes</p>
    <p class="text-base-content/60">
      Fishing Vessel Plumeria, San Francisco, CA
    </p>
  </div>
</section>

<style>
  .hero-tagline {
    text-shadow:
      0 1px 2px rgb(15 23 42 / 0.35),
      0 2px 18px rgb(15 23 42 / 0.3);
  }
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
