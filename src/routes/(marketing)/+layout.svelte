<script lang="ts">
  import { WebsiteName } from "./../../config"
  import "../../app.css"
</script>

<div class="relative">
  <slot />

  <!-- Navbar overlaid on top -->
  <div class="absolute top-8 left-0 right-0 z-50">
    <div class="navbar bg-transparent w-full px-4">
      <div class="flex-1">
        <a class="relative group inline-flex ml-6" href="/">
          <img
            src="/images/buoy_logo.svg"
            alt={WebsiteName}
            class="h-12 md:h-16 transition-opacity duration-400 ease-in-out group-hover:opacity-0"
          />
          <img
            src="/images/buoy_logo_dark.png"
            alt={WebsiteName}
            class="h-15 md:h-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-400 ease-in-out opacity-0 group-hover:opacity-90"
          />
          <span class="sr-only">{WebsiteName}</span>
        </a>
      </div>

      <div class="flex-none mr-4">
        <ul
          class="menu menu-horizontal hidden sm:flex font-extrabold text-xl text-[#1E3A8A] gap-10"
        >
          <li>
            <a
              href="/blog"
              class="hover:bg-[#00A7E1] hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl text-[#1E3A8A]"
              >Blog</a
            >
          </li>
          <li>
            <a
              href="/pricing"
              class="hover:bg-[#00A7E1] hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl text-[#1E3A8A]"
              >Pricing</a
            >
          </li>
          <li>
            <a
              href="app.buoy.fish"
              class="hover:bg-[#00A7E1] hover:text-white px-6 py-3 rounded-lg transition-colors duration-300 text-xl text-[#1E3A8A]"
              >App</a
            >
          </li>
          <li>
            <a
              href="/search"
              aria-label="Search"
              class="hover:bg-[#00A7E1] hover:text-white p-3 rounded-lg transition-colors duration-300 text-[#1E3A8A]"
            >
              <svg
                fill="currentColor"
                class="w-7 h-7"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211zM4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474z"
                />
              </svg>
            </a>
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
        <a class="link link-hover mb-1" href="/">Overview</a>
        <a class="link link-hover my-1" href="/pricing">Pricing</a>
        <a class="link link-hover my-1" href="/blog">Blog</a>
        <a class="link link-hover my-1" href="/contact_us">Contact Us</a>
        <a
          class="link link-hover my-1"
          href="https://github.com/CriticalMoments/CMSaasStarter">Github</a
        >
      </nav>
      <aside>
        <span class="footer-title opacity-80">Sponsor</span>
        <a class="max-w-[260px]" href="https://getkiln.ai">
          <div class="font-bold text-3xl mb-1">Kiln AI</div>
          <div class="font-medium mb-3">Build High Quality AI Products</div>
          <div class="font-light">
            Use advanced AI tactics, and collaborate with your team. Free apps
            for Mac and Windows.
          </div>
          <div class="link text-sm font-bold mt-2">Learn More</div>
        </a>
      </aside>
    </footer>
  </div>
</div>
