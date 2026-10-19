# buoy.fish

The public marketing site for BUOY.fish: GPS trackers that help fishermen find
their deployed set-gear and keep it from becoming ghost gear. The product itself
is https://app.buoy.fish (a separate repo).

SvelteKit 2 (Svelte 5) on Cloudflare Pages, styled with Tailwind and DaisyUI. The site has
no backend of its own: the contact and pilot-proposal forms post to
app.buoy.fish, which stores the lead and emails hello@ (ADR-0039 in the app repo).
It started from the [CMSaasStarter](https://github.com/CriticalMoments/CMSaasStarter)
template (MIT, see `LICENSE`); the template's auth, billing and Supabase are gone.

## Develop

```bash
cp .env.example .env.local   # then fill in what you need
npm install
npm run dev
```

Before pushing, run `./checks.sh` (spelling, format, lint, type check, tests,
as CI does). The spell check needs
[misspell](https://github.com/client9/misspell) installed.

`PUBLIC_SITE_ACCESS` must be `public`. Any other value puts the whole site
behind the template's password page (`src/hooks.server.ts`).

## Deploy

Merging to `main` deploys to Cloudflare Pages (`buoy-production-website`) via
the Test & Deploy workflow (`deploy/prod.sh` is the manual fallback). Runtime
secrets are Pages secrets whose source of truth is OpenBao
`secret/BUOY.fish/deploy`. The deploy's own Cloudflare token is still a GitHub
repo secret.

More detail for contributors and agents: `CLAUDE.md`.
