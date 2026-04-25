# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. Think Before Coding
   Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
   Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
   Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
   Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
   Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
## Commands

```bash
pnpm start          # dev server → http://localhost:4200
pnpm build          # production build
pnpm watch          # dev build with watch mode
```

No linter or test runner is configured. Schematics have `skipTests: true` — do not generate spec files.

## Architecture Overview

Angular 21 standalone-component app consuming the Reflexa Node.js REST API at `http://localhost:3000/api`.

### Folder layout

```
src/app/
├── core/
│   ├── api/           # One ApiService per backend module
│   ├── auth/          # AuthSessionStore, AuthTokenStore
│   ├── config/        # APP_CONFIG injection token (apiBaseUrl)
│   ├── errors/        # 403 / 404 pages + ApiClientError class
│   ├── guards/        # authGuard, guestGuard, organizationSelectedGuard, permissionGuard
│   ├── interceptors/  # authInterceptor (attach token + 401 → refresh → retry)
│   ├── layout/        # AuthLayoutComponent, AppLayoutComponent, Sidebar, Topbar
│   └── models/        # All domain interfaces (api, auth, organization, device, …)
├── features/          # Lazy-loaded feature areas (auth, dashboard, devices, organizations,
│                      #   presets, sessions, teams, viewer-scopes)
└── shared/            # Shared utilities and type aliases
```

### State management

No NgRx. State lives in injectable signal-based stores (`*.store.ts`):

- **`AuthSessionStore`** — raw `TokenPair`, refresh-in-progress flag  
- **`AuthTokenStore`** — aggregates session store + `SafeUser` profile  
- **Feature stores** (`AuthStore`, `OrganizationsStore`, `DevicesStore`, `SessionsStore`, `PresetsStore`, `TeamsStore`, `ViewerScopesStore`) — private `signal()` fields, readonly projections via `.asReadonly()`, derived state via `computed()`

### HTTP layer

`ApiClientService` wraps `HttpClient` and handles the response envelope:

```typescript
// Success envelope
{ success: true; data: T; message?: string }

// Validation error (400)
{ success: false; message: "Validation failed"; errors: Record<string, string[]> }
```

All responses are unwrapped to typed values; all errors become `ApiClientError` instances with convenience getters (`isUnauthorized`, `isValidationError`, `isForbidden`, etc.). Methods return `Promise<T>` via `firstValueFrom()`.

Domain-specific API services (`AuthApiService`, `OrganizationsApiService`, etc.) wrap `ApiClientService` — one service per backend module.

### Auth flow

- JWT Bearer token in `Authorization: Bearer <accessToken>` header  
- Access token: 15-minute lifetime, stored **in-memory only** (never `localStorage`)  
- Refresh token: in-memory or HttpOnly cookie  
- `authInterceptor` attaches the token, catches 401, calls `POST /auth/refresh-token` once, retries, redirects to `/login` on failure  
- Proactive refresh: decode JWT `exp` client-side and refresh ~60 s before expiry

### Routing

`app.routes.ts` uses lazy `loadComponent()` throughout:

- Public (`/login`, `/register`, `/verify-email`) — wrapped in `AuthLayoutComponent` + `guestGuard`  
- Authenticated — wrapped in `AppLayoutComponent` + `authGuard`; most sub-routes additionally require `organizationSelectedGuard` and/or `permissionGuard` (permission code passed via route `data`)

### UI

PrimeNG 21 component library with PrimeIcons. Global toast and confirm-dialog are mounted in `AppLayoutComponent`. All components use `ChangeDetectionStrategy.OnPush`.

### Code style

Prettier: 100-char line width, single quotes. No comments unless the *why* is non-obvious.

## Backend API quick reference

See `.github/copilot-instructions.md` for the full endpoint reference, role/permission codes, and shared TypeScript interfaces.

**Dev email verification** — email delivery is not implemented. Retrieve the token from the database:

```sql
SELECT token FROM app.email_verification_tokens
WHERE user_id = '<userId>' AND used_at IS NULL
ORDER BY created_at DESC;
```

Then `POST /auth/verify-email` with `{ token }`.

Reflexa.NodeJs project is backend project foldor using node.js but with typescript ! there is api-integrations folder where you can see all api integration instructions and also in copilot/skill -s folder is where our backend application architecture descriptino is stored ! 
