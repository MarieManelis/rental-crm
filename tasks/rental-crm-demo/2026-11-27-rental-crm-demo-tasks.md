# rental-crm-demo - Task List

## Relevant Files
- [2026-11-27-rental-crm-demo-tech-design.md](2026-11-27-rental-crm-demo-tech-design.md)
  :: Rental CRM Demo - Technical Design
- [2026-11-27-rental-crm-demo-prd.md](2026-11-27-rental-crm-demo-prd.md)
  :: Rental CRM Demo - Product Requirements Document
- `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`
  :: Project and tool configuration.
- `playwright.config.ts` :: Runs specs against `vite preview` of the
  production build, desktop and mobile projects.
- `index.html`, `src/main.tsx`, `src/router.tsx` :: App entry, router with
  `{ queryClient }` context and `basepath` from `import.meta.env.BASE_URL`.
- `src/routes/__root.tsx` :: Layout, navigation, default error and
  not-found components.
- `src/routes/index.tsx` :: Dashboard route.
- `src/routes/deals/index.tsx` :: Deal list route, search schema, loader.
- `src/routes/deals/$dealId.tsx` :: Deal page route, loader, `notFound()`.
- `src/domain/deal.ts` :: Zod `Deal` discriminated union, stages, cities,
  form schema, inferred types.
- `src/domain/aggregates.ts` :: Deal value, nights, income by month, stage
  counts, summary numbers.
- `src/api/storage.ts` :: Versioned `localStorage` access with in-memory
  fallback.
- `src/api/seed.ts` :: Deterministic seed generator (fixed seed, fixed
  anchor date).
- `src/api/deals.ts` :: `listDeals`, `getDeal`, `updateDeal`,
  `listAllDeals`, `resetDemoData`; latency and failure flag.
- `src/features/deals/queries.ts` :: Query key factory, `queryOptions`,
  `useUpdateDeal` mutation.
- `src/features/deals/DealList*.tsx`, `DealFilters*.tsx` :: List screen.
- `src/features/deals/DealForm*.tsx`, `LeaveDialog.tsx` :: Deal form and
  unsaved-changes dialog.
- `src/features/dashboard/*.tsx` :: Charts and summary numbers.
- `src/ui/*` :: Own small components with CSS Modules.
- `src/styles/tokens.css` :: CSS custom properties (colours, spacing, type).
- `e2e/*.spec.ts` :: Playwright specs per story.
- `.github/workflows/ci.yml` :: Lint, type check, build, e2e.
- `.github/workflows/deploy.yml` :: GitHub Pages deploy after CI on `main`.
- `README.md` :: Demo link, screenshots, architecture, links to documents.

## Notes
- Deadline: 2026-12-04.
- GitHub repository name: `rental-crm` (local folder stays
  `tanstack-mini-crm`). Demo URL: `https://<user>.github.io/rental-crm/`.
- The repository stays private until story 7.0; making it public needs the
  owner's explicit confirmation at that step.
- Tests: Playwright only (no unit test runner, see tech design). TDD here
  means: write the Playwright spec for a behaviour first, see it fail, then
  implement. Run with `npx playwright test [path]`.
- Versions: install the latest releases listed in the tech design, but pin
  TypeScript to 6.0.x (typescript-eslint supports `<6.1.0`). Re-check each
  library API against official docs (context7) before using it.
- Public repository: no employer names, no personal data; seed data uses
  invented names and RFC 2606 example domains.
- Commits: English subject, short body, no AI co-author trailer.

## Tasks
- [ ] 1.0 **User Story:** As the owner, I want a running project skeleton
  with routing, query client, lint, type check, Playwright and CI, so that
  every later story lands on a checked base [7/8]
  - [X] 1.1 Create `package.json` with npm scripts `dev`, `build`
    (type check + Vite build), `preview`, `lint`, `typecheck`, `e2e`;
    install React, Vite, `@vitejs/plugin-react`, TanStack Router + router
    plugin + devtools, TanStack Query + devtools, TypeScript 6.0.x
    [verify: code-only]
    → installed: React 19.3.1, Router 1.170.46, Query 5.108.4, Vite 8.4.0,
      TypeScript 6.0.3; `npm ls` clean; `.gitignore` added (2026-11-27)
  - [X] 1.2 Configure `tsconfig.json` (strict, `noUncheckedIndexedAccess`)
    and `vite.config.ts` with `tanstackRouter({ target: 'react',
    autoCodeSplitting: true })` before `react()` and `base: '/rental-crm/'`
    [verify: code-only]
  - [X] 1.3 Create `src/main.tsx`, `src/router.tsx`, `__root.tsx` with
    layout and nav links (Dashboard, Deals), placeholder `index.tsx` and
    `deals/index.tsx`; router `basepath` from `import.meta.env.BASE_URL`;
    register router type for type-safe links [verify: manual-run-claude]
    → production build renders both screens under `/rental-crm/` in
      Chromium (smoke spec); devtools absent from the build [live]
      (2026-11-27)
  - [X] 1.4 Add `eslint.config.js` with typescript-eslint (type-aware) and
    React Hooks rules; `npm run lint` and `npm run typecheck` exit 0
    [verify: manual-run-claude]
    → lint and typecheck exit 0; a probe file triggered type-aware and
      hooks rules, so the config applies to TS files [live] (2026-11-27)
  - [X] 1.5 Write `e2e/smoke.spec.ts`: app opens at base path, nav links
    switch between Dashboard and Deals, page titles visible
    [verify: e2e]
  - [X] 1.6 Add `playwright.config.ts` (webServer = build + preview,
    Chromium desktop and a 375 px mobile project); smoke spec passes
    [verify: e2e]
    → 2 passed (desktop, mobile) [live] (2026-11-27)
  - [X] 1.7 Add `src/styles/tokens.css` and base layout styles with CSS
    Modules (header, content area) [verify: code-only]
  - [ ] 1.8 Add `.github/workflows/ci.yml` (npm ci, lint, typecheck, build,
    Playwright with browser install); create private GitHub repo
    `rental-crm`, push, confirm the CI run is green with `gh run list`
    [verify: manual-run-claude]
- [ ] 2.0 **User Story:** As an agent, I want deal data with both rental
  types served by a fake API with delay, failure mode and persistence, so
  that the screens behave like a real client of a real backend [0/7]
  - [ ] 2.1 Implement `src/domain/deal.ts`: stage and city enums, common
    fields, long-term and short-term branches, `Deal` discriminated union on
    `rentalType`, inferred types; form schema via `.omit()` of server-owned
    fields plus cross-field rules (check-out after check-in, deposit >= 0).
    Confirm in Zod v4 docs where the cross-field rule must sit
    [verify: code-only]
  - [ ] 2.2 Implement `src/domain/aggregates.ts`: deal value, nights,
    expected income by month (only `contract` and `won`), counts by stage
    and type, summary numbers (open deals, closed this month, average
    value) [verify: code-only]
  - [ ] 2.3 Implement `src/api/seed.ts`: seeded PRNG, ~80 deals across both
    types, all stages and several invented cities, dates relative to a fixed
    anchor date; output parses with the `Deal` schema [verify: code-only]
  - [ ] 2.4 Implement `src/api/storage.ts`: one versioned key, seed on first
    load or version mismatch, in-memory fallback when storage throws
    [verify: code-only]
  - [ ] 2.5 Implement `src/api/deals.ts`: `listDeals` (filter, sort, page,
    returns `{ items, total }`), `getDeal`, `updateDeal`, `listAllDeals`,
    `resetDemoData`; random delay in a fixed range; reject all calls when
    the failure flag is in the URL; parse every returned value with the
    schema [verify: code-only]
  - [ ] 2.6 Implement `src/features/deals/queries.ts`: key factory with root
    `['deals']`, `queryOptions` for list, detail and all; `useUpdateDeal`
    sets the detail cache then invalidates `['deals']`; QueryClient default
    `staleTime` set [verify: code-only]
  - [ ] 2.7 Make the placeholder Deals page show "N deals" from
    `listAllDeals`; write `e2e/data.spec.ts`: N equals the seed count on
    first load and after a reload; spec passes. Story 3 replaces the
    placeholder [verify: e2e]
- [ ] 3.0 **User Story:** As an agent, I want a deal list with filters,
  sorting and paging stored in the URL, so that I find deals quickly and can
  share or reload the exact view [0/7]
  - [ ] 3.1 Write `e2e/deal-list.spec.ts`: filter by type, stage, city,
    price range and text changes rows and URL; sorting by created date,
    value and stage; paging; reload keeps the view; changing a filter
    resets page to 1 [verify: e2e]
  - [ ] 3.2 Add to the same spec: bad URL values (`stage=foo`, `page=0`,
    `minPrice=-5`) render the default list without an error
    [verify: e2e]
  - [ ] 3.3 Implement the list search schema in `deals/index.tsx` with
    `.catch()` defaults, passed directly to `validateSearch`; `loaderDeps`
    from search; loader `ensureQueryData(listOptions(deps))`
    [verify: e2e]
  - [ ] 3.4 Implement `DealFilters` bound to the URL via typed `navigate`
    (`replace: true` and debounce for text search; page reset on change)
    [verify: e2e]
  - [ ] 3.5 Implement `DealList` table (client, address, city, type badge,
    stage badge, value, created date), sortable headers and pager; rows link
    to `/deals/$dealId` [verify: e2e]
  - [ ] 3.6 Loading (pending component), empty ("No deals match") and error
    states for the list [verify: e2e]
  - [ ] 3.7 All of `e2e/deal-list.spec.ts` passes on desktop and mobile
    projects [verify: e2e]
- [ ] 4.0 **User Story:** As an agent, I want a deal page with an edit form
  that adapts to the rental type and warns about unsaved changes, so that
  deal data stays correct [0/8]
  - [ ] 4.1 Write `e2e/deal-form.spec.ts`: open a deal by direct URL; edit
    and save; list and dashboard show the new value without reload
    [verify: e2e]
  - [ ] 4.2 Add to the spec: switching rental type swaps the type-specific
    fields; check-out before check-in shows an error on check-out; required
    field errors appear next to fields [verify: e2e]
  - [ ] 4.3 Add to the spec: leaving with unsaved changes shows the dialog;
    "Stay" keeps the edits, "Leave" navigates; after a save no dialog
    [verify: e2e]
  - [ ] 4.4 Implement `deals/$dealId.tsx`: loader ensures detail query and
    throws `notFound()` when `getDeal` returns null; component reads with
    `useSuspenseQuery` [verify: e2e]
  - [ ] 4.5 Implement `DealForm` with React Hook Form + `zodResolver`,
    `shouldUnregister: true`, own field components from `src/ui`
    [verify: e2e]
  - [ ] 4.6 Wire save through `useUpdateDeal`: saving state on the button,
    inline error on failure (form keeps values), `reset(savedDeal)` on
    success [verify: e2e]
  - [ ] 4.7 Implement `LeaveDialog` with `useBlocker({ shouldBlockFn,
    withResolver: true, enableBeforeUnload })` bound to `isDirty`
    [verify: e2e]
  - [ ] 4.8 All of `e2e/deal-form.spec.ts` passes on desktop and mobile
    [verify: e2e]
- [ ] 5.0 **User Story:** As an agent, I want a dashboard with pipeline and
  income charts that link into the filtered list, so that I see what needs
  attention at a glance [0/5]
  - [ ] 5.1 Write `e2e/dashboard.spec.ts`: summary numbers match the seed;
    both charts render; clicking a stage bar opens `/deals?stage=...` and
    every row has that stage [verify: e2e]
  - [ ] 5.2 Install Recharts; implement summary number tiles from
    `aggregates.ts` [verify: e2e]
  - [ ] 5.3 Implement stacked bar chart of deals by stage split by rental
    type, with accessible labels and a legend [verify: e2e]
  - [ ] 5.4 Implement expected income by month chart and stage-bar click
    navigation with typed `navigate({ to: '/deals', search: { stage } })`
    [verify: e2e]
  - [ ] 5.5 Confirm the chart library is in the dashboard chunk only
    (build output lists it outside the list and deal chunks)
    [verify: manual-run-claude]
- [ ] 6.0 **User Story:** As a visitor, I want clear error, not-found and
  reset behaviour and a usable mobile layout, so that the demo never looks
  broken [0/6]
  - [ ] 6.1 Write `e2e/resilience.spec.ts`: failure flag shows the error
    screen and retry recovers after removing the flag; unknown deal id shows
    not-found with a link to the list; unknown route shows not-found
    [verify: e2e]
  - [ ] 6.2 Implement route error component with retry (reset query error,
    `router.invalidate()`), and not-found components for root and deal
    route [verify: e2e]
  - [ ] 6.3 Write spec and implement "Reset demo data" (header menu or
    footer): an edited deal returns to its seed value
    [verify: e2e]
  - [ ] 6.4 Corrupted storage value (spec writes invalid JSON to the key)
    shows the error screen with "Reset demo data"; reset recovers
    [verify: e2e]
  - [ ] 6.5 Mobile layout pass at 375 px: table scrolls inside its box or
    collapses to cards, filters fold, form is one column; mobile project of
    all specs passes [verify: e2e]
  - [ ] 6.6 Keyboard pass: all filters, form fields, dialog and nav reachable
    and operable by keyboard; visible focus style
    [verify: manual-run-claude]
- [ ] 7.0 **User Story:** As a recruiter, I want a public repository with a
  README and a deployed demo link, so that I can see the work in under a
  minute [0/8]
  - [ ] 7.1 Build step copies `dist/index.html` to `dist/404.html`; add
    `.github/workflows/deploy.yml` from the Vite GitHub Pages workflow,
    running only after CI succeeds on `main` [verify: code-only]
  - [ ] 7.2 Take screenshots of the three screens (desktop) with Playwright
    into `docs/screenshots/` [verify: manual-run-claude]
  - [ ] 7.3 Write `README.md`: one-line pitch, demo link, screenshots, stack
    with the reason for each library, architecture summary (URL + query
    cache as sources of truth), how the failure flag works, local run
    commands, links to PRD, tech design and tasks, note that data is
    invented [verify: code-only]
  - [ ] 7.4 Public-safety check: search the whole repo and git history for
    employer names, personal data and real emails; report results to the
    owner [verify: manual-run-claude]
  - [ ] 7.5 Owner confirms making `rental-crm` public; then change
    visibility and enable Pages with source "GitHub Actions"
    [verify: manual-run-user]
  - [ ] 7.6 Deploy runs green; open the demo URL and a direct
    `/deals/<id>` link; both render [verify: manual-run-claude]
  - [ ] 7.7 Measure first screen load on the deployed URL once (Lighthouse
    or DevTools) and note the result in the README
    [verify: observation]
  - [ ] 7.8 Propose (do not push) the profile README and CV update with the
    demo and repo links; push only after the owner approves
    [verify: manual-run-user]
