# Rental CRM Demo — Technical Design

**Status**: Draft
**PRD**: [2026-11-27-rental-crm-demo-prd.md](./2026-11-27-rental-crm-demo-prd.md)
**Created**: 2026-11-27

## Overview

A client-only single-page app: Vite + React + TypeScript, file-based routes with TanStack Router,
server state with TanStack Query over an in-browser fake API that persists to `localStorage`.
Three screens (dashboard, deal list, deal page), deployed to GitHub Pages, checked by Playwright
in CI.

The central design idea: **the URL and the query cache are the only sources of truth.**
List filters live in validated search params; deal data lives in the query cache; the form
holds only unsaved edits. There is no global client store.

## Current Architecture (verified)

- The repository has no commits and contains only the `tasks/` folder with this design and the
  PRD — verified via: `git status --short --branch`, 2026-11-27. PRD claim "empty repository"
  still holds.
- No existing patterns to follow; all conventions are set here.

### PRD assumptions resolved

- **Free static hosting** → GitHub Pages via GitHub Actions; Vite documents this path
  (`base: '/<repo>/'` and an Actions workflow) — verified via: Vite docs "Deploying a Static
  Site → GitHub Pages" (context7 `/websites/vite_dev`), 2026-11-27.
- **First screen within ~2 s** → feasible: static assets from a CDN, route-level code splitting
  by the router plugin, no network API. Measured once on the deployed URL (see Verification).
- **PRD constraint "only CV technologies"** → relaxed for the build tool only: Vite instead of
  Webpack, by the owner's decision (2026-11-27). Everything else stays within the CV list.

## Past Decisions (claude-mem)

- No past designs for this project. Owner's commercial experience: migrating a large app to
  file-based typed routes, and planning a move of server state to TanStack Query. This design
  uses the same pairing in its documented form (router loader + query cache).

## Proposed Design

### Layering

- **Routes** (`src/routes/`): URL contract — search schema, params, loader, error and
  not-found handling. Thin; render feature components.
- **Features** (`src/features/deals/`, `src/features/dashboard/`): screens and their
  components, query options, mutations, form schema.
- **Domain** (`src/domain/`): Zod schemas and inferred types for `Deal`, derived values
  (deal value, nights, monthly income). Pure functions, no React.
- **Fake API** (`src/api/`): async functions with artificial latency, optional failure, and
  persistence. The only module that touches `localStorage`.
- **UI kit** (`src/ui/`): small own components (button, field, select, table, dialog, badge)
  styled with CSS Modules and CSS custom properties for tokens.

### Routes

| File | URL | Responsibility |
|------|-----|----------------|
| `__root.tsx` | — | Layout and navigation; router context `{ queryClient }`; default not-found and error components |
| `index.tsx` | `/` | Dashboard |
| `deals/index.tsx` | `/deals` | Deal list; `validateSearch` with the list search schema; `loaderDeps` from search; loader ensures the list query |
| `deals/$dealId.tsx` | `/deals/:dealId` | Deal page; loader ensures the detail query and throws `notFound()` for an unknown id |

Router setup follows the documented TanStack Router + Query integration: `createRootRouteWithContext`
carries the `QueryClient`; loaders call `ensureQueryData(...)`; components read with
`useSuspenseQuery(...)` using the same `queryOptions` object — verified via: TanStack Router docs
"External data loading / TanStack Query integration" (context7 `/websites/tanstack_router`),
2026-11-27. The docs also show a newer `queryClient.query({ ..., staleTime: 'static' })` form;
the implementation uses whichever the installed Query version documents, `ensureQueryData` as
the default.

Vite plugin order: `tanstackRouter({ target: 'react', autoCodeSplitting: true })` before
`react()` — documented requirement.

### Data model (domain)

`Deal` is a Zod **discriminated union on `rentalType`**:

- **Common fields**: id, client name, client email, property address, city (fixed list of
  invented cities), stage, created and updated timestamps, closed timestamp (for closed stages).
- **Stage**: `inquiry → viewing → contract → won | lost`. `won` and `lost` are the two closed
  stages, so "closed this month" and "open deals" are both derivable without extra fields.
- **Long-term branch**: monthly rent, deposit, contract length in months, move-in date.
- **Short-term branch**: nightly rate, check-in date, check-out date, number of guests.

Derived (pure functions in `src/domain/`):

- **Deal value**: long-term = monthly rent × months; short-term = nightly rate × nights.
- **Expected income by month**: long-term spreads monthly rent across its contract months;
  short-term counts its value in the check-in month. Only `contract` and `won` deals count.

One schema module defines the stored shape; the form schema reuses its branches with
`.omit()` for server-owned fields (id, timestamps) and adds cross-field rules
(check-out after check-in, deposit not negative). Types come only from `z.infer`, never
written by hand.

### List search contract

Search schema (Zod v4, passed directly to `validateSearch`, no adapter — documented for Zod v4):

- `type`: `long | short`, optional
- `stage`: one stage, optional
- `city`: one city, optional
- `minValue`, `maxValue`: non-negative numbers, optional; compared with the deal value,
  because monthly rent and nightly rate are not comparable
- `q`: free text, optional
- `sort`: `createdAt | value | stage`, default `createdAt`
- `order`: `asc | desc`, default `desc`
- `page`: integer ≥ 1, default 1

Every field uses `.catch(...)` so an invalid value falls back to its default instead of
throwing — this is how PRD story 1 "invalid URL values fall back" is met. Changing any filter
resets `page` to 1. Text search updates the URL with a short debounce and `replace: true`
so typing does not fill the history.

### Fake API contract

```ts
listDeals(params: DealListParams): Promise<{ items: Deal[]; total: number }>
getDeal(id: string): Promise<Deal | null>
updateDeal(id: string, input: DealFormOutput): Promise<Deal>
listAllDeals(): Promise<Deal[]>        // dashboard aggregates
resetDemoData(): Promise<void>
```

- Filtering, sorting and paging run inside `listDeals`, so the client behaves as it would with
  a real paginated backend.
- Latency: a random delay in a fixed range on every call.
- Failure mode: when the URL contains a debug flag (documented in the README), calls reject
  with an error. Used to demo and test error states.
- Persistence: one versioned `localStorage` key. On first load or version mismatch the store
  is filled from the seed generator. Storage access is wrapped so the app still runs (in
  memory) if storage is unavailable.
- Seed: a deterministic generator with a fixed random seed produces 80 deals across both
  rental types, all stages and several cities, with dates relative to a fixed anchor date.
  Fixed seed + fixed anchor = stable data for screenshots and Playwright.
- Demo clock: the app's "today" is a constant (2026-11-27). Seed dates, "closed this month"
  and the `closedAt` set on edit all use it, so the dashboard does not drift to zeros after
  publishing. The dashboard states the date the data is shown for.
- Every value returned is parsed with the `Deal` schema, so corrupted storage surfaces as an
  error, not as broken UI.

### Query layer

- Query key factory: `['deals']` root; `['deals', 'list', params]`, `['deals', 'detail', id]`,
  `['deals', 'all']`. One invalidation of `['deals']` refreshes list, detail and dashboard.
- `queryOptions` objects are shared by loaders and components.
- `updateDeal` mutation: on success, write the returned deal into the detail cache, then
  invalidate `['deals']`. No optimistic update — the form shows a saving state; simpler and
  enough for a 300–600 ms delay.
- Default `staleTime` is a few tens of seconds so moving between screens does not refetch.

### Deal form

- React Hook Form + `zodResolver` with the Zod v4 form schema; input and output types are
  inferred by the resolver — verified via: `@hookform/resolvers` docs (context7
  `/react-hook-form/resolvers`), 2026-11-27.
- Rental type is a field. Switching it swaps the visible branch; `shouldUnregister: true`
  drops the hidden branch's values so validation only checks the visible branch.
- Cross-field rule (check-out after check-in) is a `.superRefine()` on the whole union with
  `path: ['checkOut']`, so the error lands on the check-out field. Zod v4 docs document this
  form; refinements on individual union options are not documented.
- Unsaved changes: `useBlocker({ shouldBlockFn: () => isDirty, withResolver: true,
  enableBeforeUnload: () => isDirty })` with an own confirmation dialog — verified via:
  TanStack Router `useBlocker` docs, 2026-11-27. After a successful save the form is reset to
  the saved deal, so `isDirty` is false and navigation is not blocked.

### Dashboard

- Reads `['deals', 'all']` and computes aggregates with domain functions.
- Charts (Recharts): stacked bar of deals by stage split by rental type; bar or line of
  expected income by month; three summary numbers.
- Clicking a stage bar navigates with a typed `navigate({ to: '/deals', search: { stage } })`.

### Error handling

- **Fetch failure** in a loader → route `errorComponent` with a retry button that resets the
  query error and calls `router.invalidate()`.
- **Unknown deal id** → `notFound()` from the loader → route not-found component with a link
  back to the list.
- **Save failure** → inline error above the form; form keeps its values and stays dirty.
- **Invalid search params** → silently replaced by defaults (see search contract).
- **Corrupted storage** → schema parse error → error component offers "Reset demo data".

### GitHub Pages specifics

- Vite `base` and router `basepath` both come from one value (`import.meta.env.BASE_URL`), so
  links and assets work under `https://<user>.github.io/<repo>/`.
- Direct links to inner pages: GitHub Pages has no SPA rewrite, so the build copies
  `index.html` to `404.html`. The router then reads the real URL. Covered by an e2e check
  against the production build.

## Verification Approach

| Requirement | Method | Scope | Expected Evidence |
|-------------|--------|-------|-------------------|
| FR-1: three screens + layout | `e2e` | Playwright | navigation spec passes |
| FR-2: typed URL search, fallback on bad values | `e2e` + `code-only` | Playwright, `tsc` | spec opens bad URLs and sees defaults; `tsc --noEmit` clean |
| FR-3: fake API, caching, invalidation | `e2e` | Playwright | edit a deal → list and dashboard show new value without reload |
| FR-3: error state | `e2e` | Playwright | failure flag shows error component; retry recovers |
| FR-4: discriminated form, cross-field rule, blocker | `e2e` | Playwright | type switch changes fields; invalid dates show error; dirty leave shows dialog |
| FR-5: dashboard and drill-down | `e2e` | Playwright | click stage → list URL has `stage` and rows match |
| FR-6: deterministic seed | `e2e` | Playwright | fixed counts on first load; reset restores them |
| Story 4: deployed, deep links | `manual-run-claude` | deployed URL | open `/deals/<id>` directly → deal page renders |
| NFR-1: strict TS, lint | `auto-test` | CI | `tsc --noEmit` and ESLint exit 0 |
| NFR-3: mobile width | `e2e` | Playwright mobile viewport | list and form usable at 375 px |
| NFR-4: first screen ≤ ~2 s | `observation` | deployed URL | one Lighthouse or DevTools run noted in README |

Unit tests: none. The CV lists Playwright only; schema and aggregate logic are covered through
the e2e specs above. Rejected alternative: adding Vitest for domain functions — better
isolation, but adds a tool outside the CV list.

## Trade-offs

1. **Fake API module vs. mock-service library (MSW)** — chosen: own module. Fewer
   dependencies, no service worker on GitHub Pages; cost: not real `fetch` calls, so network
   tab shows nothing.
2. **Filtering in the fake API vs. in the component** — chosen: in the API. Matches how a
   real backend works and makes query keys meaningful; cost: slightly more API code.
3. **Pessimistic vs. optimistic save** — chosen: pessimistic. Simpler and correct with
   invalidation; optimistic update is listed as a possible improvement.
4. **GitHub Pages vs. Netlify/Cloudflare** — chosen: GitHub Pages (owner's decision). One
   account; cost: `404.html` copy for deep links.
5. **Vite vs. Webpack** — chosen: Vite (owner's decision). Documented first-class path for the
   router plugin, minimal config.

## Dependencies

Latest versions on npm, checked 2026-11-27 with `npm view`. Exact pins happen at install.

- **react / react-dom**: 19.3.x
- **@tanstack/react-router** 1.170.x, **@tanstack/router-plugin** (same release line)
- **@tanstack/react-query**: 5.108.x
- **zod**: 4.6.x
- **react-hook-form** 7.92.x, **@hookform/resolvers** 7.0.x
- **recharts**: 3.11.x
- **vite**: 8.4.x, **@vitejs/plugin-react**
- **typescript: 6.0.x — not 7.x.** npm `latest` is 7.0.2, but typescript-eslint 8.74.0
  requires `typescript >=4.8.4 <6.1.0` — verified via: `npm view typescript-eslint
  peerDependencies`, 2026-11-27.
- **eslint** + **typescript-eslint**, **@playwright/test** 1.65.x
- Devtools for Router and Query in development builds only.

## Files to Create

- `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `playwright.config.ts`, `index.html`
- `src/main.tsx`, `src/router.tsx`, `src/routes/**`
- `src/domain/deal.ts`, `src/domain/aggregates.ts`
- `src/api/deals.ts`, `src/api/storage.ts`, `src/api/seed.ts`
- `src/features/deals/**`, `src/features/dashboard/**`
- `src/ui/**`, `src/styles/tokens.css`
- `e2e/*.spec.ts`
- `.github/workflows/ci.yml` (lint, typecheck, build, e2e) and `deploy.yml` (Pages, runs
  after CI passes on `main`)
- `README.md` with demo link, screenshots, architecture summary, links to the three documents

## Security Considerations

- No backend, no secrets, no real personal data: seed names and emails are generated and use
  reserved example domains (RFC 2606).
- User-entered text is rendered as text by React; no `dangerouslySetInnerHTML`.

## Performance Considerations

- Route-level code splitting from the router plugin keeps the chart library out of the list
  and deal bundles.
- ~80 deals: no virtualization needed; paging at 20 rows.

## Rollback Plan

- Static deploy: re-run the deploy workflow on the previous commit, or revert the commit on
  `main`.
- Demo data: "Reset demo data" button restores the seed; a storage version bump forces a reset
  for all visitors after a schema change.

---

**Next Steps**:
1. Review and approve design.
2. Run `/embo:tasks` for task breakdown.
