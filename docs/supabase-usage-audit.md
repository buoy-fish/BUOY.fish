# BUOY.fish Marketing Website — Supabase Usage Audit

**Date:** 2026-03-20
**Purpose:** Reference for integrating this site's Supabase usage with the production Elixir app (`app.buoy.fish`)

---

## Tables Created by This Repo

| Table              | Operations                              | Access Method               |
| ------------------ | --------------------------------------- | --------------------------- |
| `profiles`         | SELECT, INSERT (trigger), UPDATE/UPSERT | User session + service role |
| `stripe_customers` | SELECT, INSERT                          | Service role only           |
| `contact_requests` | INSERT                                  | Service role only           |

All tables have RLS enabled. `profiles` has self-access-only policies. The other two have no user-facing policies (server-side only).

A trigger `on_auth_user_created` auto-creates a `profiles` row when a user signs up.

Migration: `supabase/migrations/20240730010101_initial.sql`

## Auth Operations

- **Sign up / Sign in / Sign out** — via `@supabase/auth-ui-svelte` (client-side)
- **Password reset** — client-side auth UI
- **Password change** — requires current password verification first
- **OAuth callback** — exchanges auth code for session at `/auth/callback`
- **Session validation** — `auth.getUser()` JWT verification in hooks
- **MFA** — checks assurance level, partial support
- **User deletion** — `auth.admin.deleteUser(id, true)` via service role (cascading), requires password verification

## Service Role Usage

The `PRIVATE_SUPABASE_SERVICE_ROLE` key is used in these server-side files:

1. `src/hooks.server.ts` — creates service role client per request
2. `src/routes/(marketing)/contact_us/+page.server.ts` — insert contact requests
3. `src/lib/mailer.ts` — admin auth ops (getUserById), read profile unsubscribe status
4. `src/routes/(admin)/account/subscription_helpers.server.ts` — Stripe customer lookup/create
5. `src/routes/(admin)/account/api/+page.server.ts` — **delete user** (cascading)

## Integration Considerations

When merging with the Elixir app's Supabase instance:

1. **Table name collisions** — check if Elixir app has `profiles`, `stripe_customers`, or `contact_requests` tables
2. **Shared auth.users** — users signing up on the marketing site will exist in the same auth pool as app users
3. **Cascading deletes** — `deleteUser(id, true)` will cascade to any FK-referenced data in the Elixir app
4. **Trigger side effects** — `on_auth_user_created` trigger creates a `profiles` row; the Elixir app may have its own user-creation hooks
5. **Stripe integration** — this site has its own `stripe_customers` mapping table; the Elixir app may handle Stripe differently
6. **RLS policies** — need to ensure Elixir app's service role access patterns don't conflict

## Env Vars Required

```
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
PRIVATE_SUPABASE_SERVICE_ROLE=eyJ...
```
