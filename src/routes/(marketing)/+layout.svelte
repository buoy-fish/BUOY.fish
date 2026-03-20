<script lang="ts">
  import { page } from "$app/stores"
  import { WebsiteName } from "./../../config"
  import "../../app.css"

  $: isHome = $page.url.pathname === "/"
</script>

<div class="relative">
  <slot />

  <!-- Navbar overlaid on top -->
  <div class="absolute top-8 left-0 right-0 z-50">
    <div class="navbar bg-transparent w-full px-4">
      <div class="flex-1 flex items-center">
        <a class="relative group inline-flex ml-6" href="/">
          <img
            src="/images/buoy_logo_white_bg.png"
            alt={WebsiteName}
            class="h-12 md:h-16 rounded-lg transition-opacity duration-300 ease-in-out group-hover:opacity-0"
          />
          <img
            src="/images/buoy_logo_blue_bg.png"
            alt={WebsiteName}
            class="h-12 md:h-16 rounded-lg absolute inset-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
          />
          <span class="sr-only">{WebsiteName}</span>
        </a>
        <!-- Mobile nav links — right-justified -->
        <div class="sm:hidden flex items-center gap-1 ml-auto mr-2">
          <a
            href="https://app.buoy.fish/demo"
            class="hover:bg-secondary hover:text-white text-sm font-semibold px-3 py-2 rounded-md transition-colors duration-300 {isHome
              ? 'text-white drop-shadow-lg'
              : 'text-primary'}">Demo</a
          >
          <a
            href="https://app.buoy.fish"
            class="hover:bg-secondary hover:text-white text-sm font-semibold px-3 py-2 rounded-md transition-colors duration-300 {isHome
              ? 'text-white drop-shadow-lg'
              : 'text-primary'}">App</a
          >
          <a
            href="/contact_us"
            class="hover:bg-secondary hover:text-white text-sm font-semibold px-3 py-2 rounded-md transition-colors duration-300 {isHome
              ? 'text-white drop-shadow-lg'
              : 'text-primary'}">Contact</a
          >
        </div>
      </div>

      <!-- Centered tagline — homepage only, positioned below navbar -->
      {#if isHome}
        <div
          class="fixed left-1/2 -translate-x-1/2 top-28 hidden md:block z-50"
        >
          <p
            class="text-white text-4xl font-semibold tracking-wide drop-shadow-lg"
          >
            Solving lost and abandoned fishing gear.
          </p>
        </div>
      {/if}

      <div class="flex-none mr-4">
        <ul
          class="menu menu-horizontal hidden sm:flex font-extrabold text-xl gap-10"
        >
          <li>
            <a
              href="/blog"
              class="hover:bg-secondary hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl {isHome
                ? 'text-white drop-shadow-lg'
                : 'text-primary'}">Blog</a
            >
          </li>
          <li>
            <a
              href="/contact_us"
              class="hover:bg-secondary hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl {isHome
                ? 'text-white drop-shadow-lg'
                : 'text-primary'}">Contact Us</a
            >
          </li>
          <li>
            <a
              href="https://app.buoy.fish/demo"
              class="hover:bg-secondary hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl {isHome
                ? 'text-white drop-shadow-lg'
                : 'text-primary'}">Live Demo</a
            >
          </li>
          <li>
            <a
              href="https://app.buoy.fish"
              class="hover:bg-secondary hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl {isHome
                ? 'text-white drop-shadow-lg'
                : 'text-primary'}">App</a
            >
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="mt-auto">
    <div class="border-t max-w-[1000px] mx-auto"></div>
    <footer
      class="footer p-10 gap-x-48 lg:gap-x-64 xl:gap-x-96 place-content-center text-base"
    >
      <nav>
        <span class="footer-title opacity-80">Explore</span>
        <a class="link link-hover mb-1" href="/">Home</a>
        <a class="link link-hover my-1" href="/blog">Blog</a>
        <a class="link link-hover my-1" href="/contact_us">Contact Us</a>
      </nav>
      <aside>
        <span class="footer-title opacity-80">Connect</span>
        <a class="link link-hover my-1" href="https://app.buoy.fish/demo"
          >Live Demo</a
        >
        <a class="link link-hover my-1" href="https://app.buoy.fish">App</a>
        <a class="link link-hover my-1" href="mailto:hello@buoy.fish"
          >hello@buoy.fish</a
        >
      </aside>
    </footer>
  </div>
</div>
