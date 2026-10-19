<script lang="ts">
  import { enhance, applyAction } from "$app/forms"
  import type { SubmitFunction } from "@sveltejs/kit"
  import type { FullAutoFill } from "svelte/elements"
  import SmsConsentField from "$lib/SmsConsentField.svelte"
  import Turnstile from "$lib/Turnstile.svelte"
  import {
    FUNDING_OPTIONS,
    TIMELINE_OPTIONS,
    type ProposalOption,
  } from "./proposal_options"

  let errors: { [fieldName: string]: string } = $state({})
  let loading = $state(false)
  let showSuccess = $state(false)
  let turnstile: Turnstile | undefined = $state()

  interface FormField {
    id: string
    label: string
    inputType: "text" | "email" | "tel" | "textarea" | "select"
    autocomplete?: FullAutoFill
    placeholder?: string
    options?: ProposalOption[]
    half?: boolean
  }

  const aboutYou: FormField[] = [
    {
      id: "first_name",
      label: "First Name *",
      inputType: "text",
      autocomplete: "given-name",
      half: true,
    },
    {
      id: "last_name",
      label: "Last Name *",
      inputType: "text",
      autocomplete: "family-name",
      half: true,
    },
    {
      id: "email",
      label: "Email *",
      inputType: "email",
      autocomplete: "email",
    },
    {
      id: "phone",
      label: "Phone Number",
      inputType: "tel",
      autocomplete: "tel",
    },
    {
      id: "organization",
      label: "Organization",
      inputType: "text",
      autocomplete: "organization",
      placeholder: "Cooperative, NGO, agency, or lab",
    },
    {
      id: "role",
      label: "Your Role",
      inputType: "text",
      autocomplete: "organization-title",
    },
  ]

  const aboutProject: FormField[] = [
    {
      id: "region",
      label: "Region or Fishery",
      inputType: "text",
      placeholder: "e.g. spiny lobster, Baja California",
    },
    {
      id: "gear_type",
      label: "Gear Type",
      inputType: "text",
      placeholder: "e.g. traps, bottom longlines, gillnets",
    },
    {
      id: "fleet_size",
      label: "Fleet Size",
      inputType: "text",
      placeholder: "e.g. 14 boats, about 300 traps",
    },
    {
      id: "problem",
      label: "What are you trying to solve? *",
      inputType: "textarea",
      placeholder:
        "What goes wrong today, and what would you want a pilot to show?",
    },
    {
      id: "funding",
      label: "Funding",
      inputType: "select",
      options: FUNDING_OPTIONS,
    },
    {
      id: "timeline",
      label: "Timeline",
      inputType: "select",
      options: TIMELINE_OPTIONS,
    },
    {
      id: "referral",
      label: "How did you hear about us?",
      inputType: "text",
    },
  ]

  const handleSubmit: SubmitFunction = () => {
    loading = true
    errors = {}
    return async ({ update, result }) => {
      await update({ reset: false })
      await applyAction(result)
      loading = false
      if (result.type === "success") {
        showSuccess = true
        return
      }
      turnstile?.reset()
      if (result.type === "failure") {
        errors = result.data?.errors ?? {}
      } else if (result.type === "error") {
        errors = {
          _: "Something went wrong sending your proposal. Email hello@buoy.fish instead.",
        }
      }
    }
  }
</script>

<svelte:head>
  <title>Propose a Pilot Project</title>
  <meta
    name="description"
    content="Tell BUOY.fish about your fishery, gear, and funding to propose a gear-tracking pilot project."
  />
</svelte:head>

{#snippet fieldInput(field: FormField)}
  <label for={field.id} class={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
    <div class="flex flex-row">
      <div class="text-base font-bold">{field.label}</div>
      {#if errors[field.id]}
        <div class="text-red-600 flex-grow text-sm ml-2 text-right">
          {errors[field.id]}
        </div>
      {/if}
    </div>
    {#if field.inputType === "textarea"}
      <textarea
        id={field.id}
        name={field.id}
        rows={5}
        placeholder={field.placeholder}
        class="{errors[field.id]
          ? 'textarea-error'
          : ''} textarea textarea-bordered mt-1 w-full mb-3 text-base"
      ></textarea>
    {:else if field.inputType === "select"}
      <select
        id={field.id}
        name={field.id}
        class="{errors[field.id]
          ? 'select-error'
          : ''} select select-bordered select-sm mt-1 w-full mb-3 text-base font-normal"
      >
        <option value="">Choose one</option>
        {#each field.options ?? [] as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {:else}
      <input
        id={field.id}
        name={field.id}
        type={field.inputType}
        autocomplete={field.autocomplete}
        placeholder={field.placeholder}
        class="{errors[field.id]
          ? 'input-error'
          : ''} input-sm mt-1 input input-bordered w-full mb-3 text-base py-4"
      />
    {/if}
  </label>
{/snippet}

<div
  class="flex flex-col lg:flex-row mx-auto my-4 min-h-[70vh] place-items-center lg:place-items-start place-content-center"
>
  <div
    class="max-w-[400px] lg:max-w-[460px] flex flex-col p-4 lg:mr-8 lg:mt-6 lg:sticky lg:top-8"
  >
    <div class="px-6">
      <h1 class="text-2xl lg:text-4xl font-bold mb-4">
        Propose a Pilot Project
      </h1>
      <p class="text-lg">
        We run pilot projects with fishing cooperatives, NGOs, researchers, and
        fishery managers who want to track set gear for a season and see what
        changes.
      </p>
      <p class="mt-4">Useful to include:</p>
      <ul class="list-disc list-outside pl-6 py-2 space-y-1">
        <li>Where you fish and what gear you set</li>
        <li>How many boats and how much gear is in the water</li>
        <li>What goes wrong today: lost gear, theft, gear conflicts</li>
        <li>Whether you have funding or a grant application in progress</li>
      </ul>
      <p class="mt-2">
        Rough answers are fine. We'll reply by email to talk through what a
        pilot could look like. You can read about our current trials on the <a
          href="/blog"
          class="link">blog</a
        >.
      </p>
      <p class="text-sm pt-8">
        Or email us directly at <a href="mailto:hello@buoy.fish" class="link"
          >hello@buoy.fish</a
        >
      </p>
    </div>
  </div>

  <div
    class="flex flex-col flex-grow m-4 lg:ml-10 min-w-[300px] stdphone:min-w-[360px] sm:w-full max-w-[400px] sm:max-w-[520px]"
  >
    {#if showSuccess}
      <div class="flex flex-col place-content-center lg:min-h-[70vh]">
        <div
          class="card card-bordered shadow-lg py-6 px-6 mx-2 lg:mx-0 lg:p-6 mb-10"
        >
          <div class="text-2xl font-bold mb-4">Thank you!</div>
          <p class="">
            We've received your proposal and will reply by email soon.
          </p>
        </div>
      </div>
    {:else}
      <div class="card card-bordered shadow-lg p-4 pt-6 mx-2 lg:mx-0 lg:p-6">
        <form
          class="form-widget flex flex-col"
          method="POST"
          action="?/submitProposal"
          use:enhance={handleSubmit}
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
            {#each aboutYou as field}
              {@render fieldInput(field)}
            {/each}
          </div>

          <h2 class="text-lg font-bold mt-2 mb-3 pt-4 border-t border-base-300">
            About the project
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
            {#each aboutProject as field}
              {@render fieldInput(field)}
            {/each}
          </div>

          <Turnstile action="proposal" bind:this={turnstile} />

          <SmsConsentField />

          {#if errors._}
            <p class="text-red-600 text-sm mb-2">{errors._}</p>
          {:else if Object.keys(errors).length > 0}
            <p class="text-red-600 text-sm mb-2">
              Please resolve above issues.
            </p>
          {/if}

          <button class="btn btn-primary {loading ? 'btn-disabled' : ''}"
            >{loading ? "Submitting" : "Submit proposal"}</button
          >
        </form>
      </div>
    {/if}
  </div>
</div>
