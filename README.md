# buoy.fish

The public marketing site for BUOY.fish: GPS trackers that help fishermen find
their deployed set-gear and keep it from becoming ghost gear. The product itself
is https://app.buoy.fish (a separate repo).

SvelteKit 5 on Cloudflare Pages, styled with Tailwind and DaisyUI. The site has
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

Before pushing: `npm run check`, `npm run lint`, `npm run test_run`, and
`npm run format_check`.

## Deploy

Merging to `main` deploys to Cloudflare Pages (`buoy-production-website`) via
the Test & Deploy workflow. Runtime secrets are Pages secrets; their source of
truth is OpenBao `secret/BUOY.fish/deploy`.

More detail for contributors and agents: `CLAUDE.md`.
