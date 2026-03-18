<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("home")
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-4">Welcome to your BUOY.fish account</h1>
<p class="text-base-content/70 max-w-lg mb-6">
  Manage your account settings and billing from the menu.
  To track your gear in real time, head to the main app.
</p>
<a href="https://app.buoy.fish" class="btn btn-primary">Go to Tracking App</a>
