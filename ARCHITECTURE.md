# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│                                                         │
│  ┌─────────────────┐       ┌──────────────────────────┐ │
│  │   Host (:3001)  │──MF──▶│  Remote Products (:3002) │ │
│  │                 │       │                          │ │
│  │  ChakraProvider │       │  ProductList.tsx         │ │
│  │  ErrorBoundary  │       │  Products.ts (Effect)    │ │
│  │  Suspense       │       │  filters.ts             │ │
│  │                 │       │                          │ │
│  └────────┬────────┘       └────────────┬─────────────┘ │
│           │                             │               │
│           │        ┌────────────┐       │               │
│           └───────▶│ MSW Worker │◀──────┘               │
│                    │ /api/*     │                        │
│                    └────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

## Directory Layout

```
.
├── apps/
│   ├── host/                          # Shell application
│   │   ├── src/
│   │   │   ├── main.tsx               # Entry: lazy remote import, providers
│   │   │   ├── components/
│   │   │   │   └── ErrorBoundary.tsx   # Catches remote load/render failures
│   │   │   └── types/
│   │   │       └── federation.d.ts    # Type declaration for products/ProductList
│   │   ├── public/
│   │   │   └── mockServiceWorker.js   # MSW service worker (copied from remote)
│   │   └── vite.config.ts            # MF consumer config
│   │
│   └── remote-products/               # Product catalogue micro-frontend
│       ├── src/
│       │   ├── main.tsx               # Dev playground entry
│       │   ├── ProductList.tsx        # UI: grid, filters, pagination
│       │   ├── Products.ts           # Data: Effect service, schema, hook
│       │   ├── filters.ts            # Pure: search, category, sort, paginate
│       │   ├── msw/
│       │   │   ├── handlers.ts        # Mock API: 2000 seeded products
│       │   │   ├── browser.ts         # MSW worker instance
│       │   │   └── initMsw.ts        # Lazy init for federation context
│       │   └── __tests__/
│       │       ├── setup.ts           # Vitest + jest-dom setup
│       │       ├── filters.test.ts    # Pure function tests (14)
│       │       └── ProductList.test.tsx # Component tests (4)
│       ├── vitest.config.ts
│       └── vite.config.ts            # MF producer config (exposes ProductList)
│
├── docs/ADRS/                         # Architecture Decision Records
├── tsconfig.base.json                 # Shared: strict, Effect language service
├── package.json                       # Workspace root
└── flake.nix                          # Nix dev environment
```

## Module Federation Topology

```
host (consumer)                    remote-products (producer)
─────────────────                  ──────────────────────────
remotes:                           exposes:
  products ──────────────────────▶   ./ProductList
    entry: :3002/remoteEntry.js

shared (singleton):                shared (singleton):
  react          ^19.0.0             react          ^19.0.0
  react-dom      ^19.0.0             react-dom      ^19.0.0
  @chakra-ui/react                   @chakra-ui/react
  @emotion/react                     @emotion/react
```

## Data Flow

```
                    ┌──────────────┐
                    │ useProducts  │
                    │   (hook)     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  ensureMsw() │  lazy init service worker
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ ProductService│  Effect.gen pipeline
                    │   .fetchAll  │
                    └──────┬───────┘
                           │
              ┌────────────▼────────────┐
              │  fetch("/api/products") │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │ Schema.decodeUnknown    │  validate 2000 products
              │   Product[]             │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  Effect.match           │  type-safe error mapping
              │  onSuccess → ok         │
              │  onFailure → error      │
              └────────────┬────────────┘
                           │
                    ┌──────▼───────┐
                    │  setState()  │  ProductsState discriminated union
                    └──────────────┘
```

## Filter Pipeline

```
products (2000)
  │
  ├── filterBySearch(query)     text match on name
  ├── filterByCategory(cat)     exact match or "all"
  ├── sortByPrice(dir)          asc/desc
  ├── paginate(page, 24)        slice for current page
  │
  └──▶ visible[]                max 24 items rendered
```

All filter functions are pure (`filters.ts`) — no React, no side effects, independently testable.

## Component Tree

```
ChakraProvider
└── App
    ├── header
    │   ├── h1 "Catalog Shell (Host)"
    │   └── small "Vite • Module Federation • React 19"
    └── main
        └── ErrorBoundary
            └── Suspense (skeleton fallback)
                └── ProductList (lazy remote)
                    ├── Filters (section)
                    │   ├── Input (search)
                    │   ├── NativeSelect (category)
                    │   ├── NativeSelect (sort)
                    │   └── Button (reset)
                    ├── SimpleGrid as="ul"
                    │   └── Card.Root as="li" (×24)
                    │       ├── Image
                    │       └── Card.Body
                    │           ├── Text (name)
                    │           ├── Text (price) + Badge (category)
                    │           └── Text (rating, conditional)
                    └── Pagination
                        ├── Button (previous)
                        ├── Text (page N of M)
                        └── Button (next)
```

## Error Handling

```
Layer             Mechanism                    Renders
─────             ─────────                    ───────
Remote load       ErrorBoundary                "Failed to load Product Catalogue"
HTTP failure      FetchError → Effect.match    "Failed to load products"
Schema mismatch   DecodeError → Effect.match   "Failed to load products"
Empty results     visible.length === 0         "No products found"
```

## Test Strategy

```
Unit (filters.test.ts)           Component (ProductList.test.tsx)
─────────────────────            ────────────────────────────────
filterBySearch     ×3            renders products        ×1
filterByCategory   ×2            search filters          ×1
sortByPrice        ×3            showRatings flag on     ×1
paginate           ×2            showRatings flag off    ×1
totalPages         ×1            error state             ×1
extractCategories  ×2
─────────────────────            ────────────────────────────────
Total: 14 pure                   Total: 5 integration
       (no DOM, no React)               (MSW node, jsdom)
```

## Dev Environment

```
flake.nix + .envrc               nix develop → nodejs, npm install
npm run dev                      concurrently: host(:3001) + remote(:3002)
npm run test -w remote-products  vitest run (18 tests)
```
