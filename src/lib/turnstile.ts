// Shown in `errors._` when app.buoy.fish refuses the form's Turnstile token.
// The app verifies it (ADR-0039 D3); the site only renders the widget.
export const TURNSTILE_FAILED_MESSAGE =
  "We couldn't confirm you're not a bot. Reload the page and try again, or email hello@buoy.fish."
