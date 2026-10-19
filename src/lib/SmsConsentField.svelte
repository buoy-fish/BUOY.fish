<script lang="ts">
  import { SMS_CONSENT_LABEL, SMS_CONSENT_TEXT } from "$lib/sms_consent"
</script>

<!-- SMS consent (TCPA / toll-free verification): optional, never
     pre-checked, and never required to submit. The label and the
     Details text come from $lib/sms_consent, which the server stores
     with each opt-in (sent to app.buoy.fish as sms_consent_text). -->
<div class="flex flex-row items-start gap-3 mt-1 mb-4">
  <input
    id="sms_consent"
    name="sms_consent"
    type="checkbox"
    class="checkbox checkbox-sm mt-0.5 flex-shrink-0"
  />
  <div class="text-xs leading-snug text-base-content/70">
    <label for="sms_consent" class="cursor-pointer">
      {SMS_CONSENT_LABEL}
    </label>
    <a href="/sms-terms" class="link">SMS Terms</a>,
    <a href="/privacy" class="link">Privacy</a>.
    <details class="mt-1">
      <summary class="cursor-pointer link link-hover w-fit"> Details </summary>
      <p class="mt-1">{SMS_CONSENT_TEXT}</p>
    </details>
  </div>
</div>
