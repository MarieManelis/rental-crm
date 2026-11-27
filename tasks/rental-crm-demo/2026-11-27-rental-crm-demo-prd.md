# Rental CRM Demo — PRD

**Status**: Draft
**Created**: 2026-11-27
**Tracker**: none (personal portfolio project)
**Author**: Claude Code (AI assistant), reviewed by the project owner

---

## Wider Context / Higher Goal

This is a public portfolio project for a frontend developer looking for a Senior Frontend
(React/TypeScript) role. Seven years of commercial work live in private repositories under NDA,
so there is no public code to show. The project exists so that a recruiter can open a working
demo in one click, and an interviewer can read code, documents and tests that show the same
skills listed in the CV.

The repository also demonstrates the spec-driven, AI-first workflow named in the CV: the PRD,
technical design and test plan are committed next to the code.

## Context

A small CRM for a fictional real-estate agency that rents out apartments. Agents track rental
deals from the first inquiry to the signed contract. A deal is either a **long-term rental**
(months to years) or a **short-term rental** (nights to weeks); the type changes which fields
the deal has.

### Current State (observed)

- The project folder is an empty git repository: no commits, no files, no remote — verified via:
  `ls -la` and `git log` on the project folder, 2026-11-27.
- There is no existing code, so there are no patterns or integration points to follow.
  Architecture is decided from scratch in the technical design.

### Past Similar Features

- No past PRDs for this project. The owner's commercial experience (migrating a CRM to
  type-safe file-based routing, preparing a move to query caching) is the reason the stack
  is centred on TanStack Router and TanStack Query.

## Problem Statement

**Who**: (1) a recruiter or hiring manager screening candidates; (2) a technical interviewer
preparing questions; (3) the owner, who must explain every line in an interview.
**What**: there is no public evidence of the candidate's frontend skills.
**Why**: without it, screening relies only on CV text, which cannot show code quality.
**When**: during the job search that starts now; the first version is needed within one week.

## Goals

### Primary Goal
A small, finished, deployed application that shows Senior-level React/TypeScript practice
on three screens.

### Secondary Goals
- Every technology in the CV's Skills section that the app uses has a real reason to be there.
- The repository reads well in 10 minutes: README with a demo link, screenshots, a short
  architecture section and links to the PRD, technical design and test plan.
- Code contains nothing from any employer: domain, names, data and structure are invented.

## User Stories

### Epic
As an agency agent, I want to see, filter and update rental deals and see a summary of the
pipeline, so that I know which deals need my attention.

### User Stories

1. **As an** agent
   **I want** a list of deals that I can filter, sort and page through
   **So that** I find the deals I need quickly.

   **Acceptance Criteria**:
   - [ ] Filters: rental type, stage, city, price range, free-text search by client or address.
   - [ ] Sorting by at least date created, price and stage; pagination.
   - [ ] Every filter, sort and page value is stored in the URL; reloading the page or opening
         a copied link shows the same list.
   - [ ] Invalid URL values (unknown stage, negative price, page 0) fall back to defaults
         instead of crashing.
   - [ ] Loading, empty and error states are shown.

2. **As an** agent
   **I want** to open a deal and edit it in a form
   **So that** the deal data stays correct.

   **Acceptance Criteria**:
   - [ ] The deal page has its own URL; opening it directly works.
   - [ ] The form shows common fields for both rental types and type-specific fields:
         long-term (e.g. contract length, deposit, monthly rent) and short-term (e.g. check-in
         and check-out dates, nightly rate, number of guests).
   - [ ] Switching the rental type changes the visible fields and the validation rules.
   - [ ] Validation errors appear next to the field; cross-field rules are checked
         (e.g. check-out after check-in).
   - [ ] After saving, the list and the dashboard show the new data without a manual reload.
   - [ ] Leaving the page with unsaved changes asks for confirmation.

3. **As an** agent
   **I want** a dashboard with charts
   **So that** I see the state of the pipeline at a glance.

   **Acceptance Criteria**:
   - [ ] A chart of deals by stage, split by rental type.
   - [ ] A chart of expected income by month.
   - [ ] A few summary numbers (open deals, deals closed this month, average deal value).
   - [ ] Clicking a stage in the chart opens the deal list filtered by that stage.

4. **As a** recruiter
   **I want** to open the app from a link without installing anything
   **So that** I can see the work in under a minute.

   **Acceptance Criteria**:
   - [ ] The app is deployed to a public URL linked from the README.
   - [ ] The demo starts with realistic seeded data; changes survive a page reload in the same
         browser and can be reset to the seed data.

## Requirements

### Functional Requirements

1. **FR-1**: Three screens — deal list, deal page with edit form, dashboard — plus a shared
   layout with navigation.
   - **Priority**: High
   - **Rationale**: compact scope that fits one week and can be finished to a high standard.

2. **FR-2**: Routing is file-based and type-safe; URL search parameters are validated with a
   schema and typed throughout the app.
   - **Priority**: High
   - **Rationale**: this is the owner's strongest CV point and has no public proof yet.

3. **FR-3**: Data is read and written through a fake API layer with artificial latency and an
   optional error mode, with server-state caching, cache invalidation after edits, and
   prefetching on route load.
   - **Priority**: High
   - **Rationale**: shows real async handling without a backend.
   - **Dependencies**: the fake API must keep data in browser storage so the demo survives
     reloads (FR in story 4).

4. **FR-4**: The deal form uses a schema shared with the data layer, with a discriminated
   structure by rental type.
   - **Priority**: High
   - **Rationale**: one source of truth for types and validation.

5. **FR-5**: Dashboard charts are built from the same cached data as the list.
   - **Priority**: Medium

6. **FR-6**: Seed data: about 50–100 invented deals across several cities and both rental types.
   - **Priority**: Medium

### Non-Functional Requirements

1. **NFR-1**: Quality — strict TypeScript, no type errors and no lint errors in CI.
2. **NFR-2**: Tests — end-to-end browser checks cover the four user stories' main acceptance
   criteria; they run in CI on every push.
3. **NFR-3**: Usability — the layout works at mobile width (about 375px) and desktop width;
   forms are usable with the keyboard.
4. **NFR-4**: Performance — the deployed app shows the first screen within about 2 seconds on a
   normal connection [assumption, verify in tech-design].
5. **NFR-5**: Confidentiality — no employer code, names, data models or screenshots.

### Technical Constraints

- Use only technologies from the CV Skills section: React, TypeScript, TanStack Router,
  TanStack Query, React Hook Form, Zod, Recharts, Playwright, and one of the styling options
  listed there. Exact versions and APIs are chosen in the technical design from official docs.
  Exception: the build tool is Vite (owner's decision, 2026-11-27), as the documented
  first-class setup for the router plugin.
- No backend; hosting is free static hosting [assumption, verify in tech-design].
- README and all project documents are in English.

## Out of Scope

- Booking calendar, availability by date and overlap checks for short-term rentals.
- Companies, contacts and a separate client directory.
- Kanban board of deal stages.
- Login, roles and permissions.
- Import and export of data.
- A real backend or database.
- Internationalisation.

## Success Metrics

1. **Delivered on time**: deployed demo and public repository within one week (by 2026-12-04).
2. **Repository completeness**: README with demo link and screenshots; PRD, technical design and
   test plan in the repository; CI green.
3. **Interview readiness**: the owner can explain every file and every library choice
   (self-check before publishing the link in the CV and GitHub profile).

## References

### From Codebase
- Empty repository; no existing code.

### From Earlier Work
- No past PRDs for this project. Constraints taken from the owner's CV work: claims must match
  what the owner did; no inferred facts.

---

**Next Steps**:
1. Review and refine this PRD.
2. Write the technical design (versions and APIs checked in official docs).
3. Break the design down into tasks.
