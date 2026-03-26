# Submission Notes

## Dev Environment

### Nix Flake + direnv
- `flake.nix` provides reproducible dev shell with `nodejs` via nixpkgs-unstable
- `use flake` in `.envrc` — auto-activates shell + runs `npm install` on entry
- flake-parts for multi-system support (aarch64/x86_64 darwin/linux)
- Inputs: llm-agents.nix, serena, crane, rust-overlay (from existing tooling)
- `.data/` dir for shell logs, gitignored alongside `node_modules/` and `.direnv/`

---

## Tech Stack Decisions

### Design System: Chakra UI v3
- Built-in responsive props (`columns={{ base: 1, md: 2, lg: 4 }}`)
- Accessible by default (WAI-ARIA), keyboard/focus handled out of the box
- Fast DX: styled components, theming, layout primitives
- Components: SimpleGrid, Card, Input, Select, Button, Skeleton, Badge, Stack

### Data Layer: Effect-TS v3
- `Schema.Class` + `Schema.decodeUnknown` — validate MSW API responses (typed decode)
- `Effect.gen` + `Effect.tryPromise` — fetch with structured errors (`FetchError | DecodeError`)
- `Context.Tag` + `Layer` — dependency injection for `ProductService`
- Pure composable functions in `filters.ts` — easily unit tested, no framework dependency
- Clean separation: data logic (Effect) vs presentation (React)

### Testing: Vitest + React Testing Library
- Native to Vite, fast
- Focus: filter/sort pure functions, component render, user interactions

### State: React useState + useMemo
- Single-component scope, no global store needed
- useMemo for derived filtered/sorted list

---

## Implementation Plan

### Phase 1 — Setup
- [x] npm install (handled by nix devShell)
- [x] Add deps to remote: `@chakra-ui/react@^3.34.0`, `effect@^3.21.0`
- [x] Add deps to host: `@chakra-ui/react@^3.34.0`
- [x] Add dev deps to remote: `vitest@^4.1.1`, `@testing-library/react@^16.3.2`, `@testing-library/jest-dom@^6.9.1`, `jsdom@^29.0.1`
- [x] Align `@module-federation/vite` to `^1.7.1` in both apps (was `^1.2.6`)
- [x] Add `@chakra-ui/react` + `@emotion/react` to MF shared config (singleton)
- [x] Fix MSW: extract `ensureMsw()` for federation-safe lazy init, remove auto-start from `browser.ts`
- [x] Copy `mockServiceWorker.js` to host public dir
- [x] Seed faker (`faker.seed(42)`) for deterministic data
- [x] Add vitest config + test setup
- [x] Add `@effect/language-service` to tsconfig plugins
- [x] Verify both apps start with `npm run dev`

### Phase 2 — Data Layer (remote)
- [x] Define Product schema with `Schema.Class` (Effect v3 — schemas integrated into `effect` package)
- [x] Fetch `/api/products` with `Effect.gen` + `Effect.tryPromise` (structured `FetchError | DecodeError`)
- [x] Custom hook: `useProducts()` — returns `loading | error | ok` discriminated union
- [x] Pure functions in `filters.ts`: filterBySearch, filterByCategory, sortByPrice, paginate, totalPages, extractCategories

### Phase 3 — ProductList UI (remote)
- [x] Wrap app in `ChakraProvider` with `defaultSystem`
- [x] Product card: `Card.Root` / `Card.Body` with Image, name, price, Badge category, optional rating
- [x] Responsive grid: `SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}`
- [x] Skeleton loading state (12-card grid)
- [x] Error state with red border box
- [x] Search uses `useDeferredValue` (React 19 native, better than setTimeout debounce)
- [x] Category filter + price sort via `NativeSelect`
- [x] Pagination: 24 items/page, page resets on filter change
- [x] Respect `featureFlags.showRatings`

### Phase 4 — Host Integration
- [x] `React.lazy(() => import('products/ProductList'))` for code-split remote
- [x] `ErrorBoundary` class component for remote load failures
- [x] `Suspense` with skeleton fallback
- [x] `ChakraProvider` in host for consistent theming
- [x] Pass `featureFlags={{ showRatings: true }}`

### Phase 5 — Tests (18 tests, all passing)
- [x] Pure function tests: filterBySearch, filterByCategory, sortByPrice, paginate, totalPages, extractCategories (14 tests)
- [x] Component test: renders loading → products (1 test)
- [x] Interaction test: search filters results (1 test)
- [x] `featureFlags.showRatings` show/hide (2 tests)

### Phase 6 — Polish
- [x] Semantic HTML: `SimpleGrid as="ul"`, `Card.Root as="li"`, `section` for filters, `header`/`main` in host
- [x] Chakra handles focus outlines by default
- [x] Image alt text set to product name
- [x] Final review + update this file

---

## Performance Strategy
- `useDeferredValue` for search (React 19 — defers re-render at low priority, better than fixed debounce)
- `useMemo` on filtered/sorted/paginated derived state
- Pagination: 24 items/page (not all 2000 in DOM at once)
- `React.lazy` for code-split remote loading
- Singleton shared React + Chakra + Emotion across host/remote via MF shared config

## Accessibility
- Chakra handles: focus rings, aria-labels, keyboard nav
- Semantic: `section` > heading + `ul` > `li` > `article` (cards)
- All form controls labelled
- Skip-to-content if time allows

## Known Limitations / Out of Scope
- No server-side pagination (MSW returns all 2000)
- No product detail view / routing
- No URL-persisted filter state
- No E2E tests
- Image placeholders depend on external service (prd.place)
