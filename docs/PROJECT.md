# SwiftPay — Project Documentation

> **Platform:** Pakistan Raast/1LINK real-time payment console  
> **Stack:** React 18 + TypeScript (frontend) · Spring Boot 4 + Java 25 (backend) · PostgreSQL 17

---

## Table of Contents

1. [Overview](#1-overview)
2. [Repository Map](#2-repository-map)
3. [Frontend — swiftpay-web](#3-frontend--swiftpay-web)
4. [Backend — payment-service](#4-backend--payment-service)
5. [API Contract](#5-api-contract)
6. [Database Schema](#6-database-schema)
7. [1LINK Integration](#7-1link-integration)
8. [Auth & Security](#8-auth--security)
9. [Feature Pages](#9-feature-pages)
10. [Design System & UI](#10-design-system--ui)
11. [Environment Variables](#11-environment-variables)
12. [Running Locally](#12-running-locally)
13. [Testing](#13-testing)
14. [Known Gaps / Backlog](#14-known-gaps--backlog)

---

## 1. Overview

SwiftPay is a B2B payment console that wraps Pakistan's **1LINK Raast** network. Merchants and aggregators use it to:

- Send **Request to Pay (RTP)** messages to payers via Raast aliases (mobile number or IBAN)
- Track RTP status in real time via `/statusInquiry` polling
- Manage settlements, linked bank accounts, and Raast aliases
- (Admins) Monitor 1LINK endpoint health, manage OAuth2 clients, review audit logs

The frontend never calls 1LINK directly — all upstream calls go through the `payment-service` backend, which handles auth, idempotency, resilience, and correlation tracking.

---

## 2. Repository Map

```
D:\Work\SwiftPay\
├── swiftpay-web/           # React frontend (this repo)
│   ├── src/
│   ├── docs/               # ← this file lives here
│   └── ...
├── payment-service/        # Spring Boot backend
│   ├── src/
│   └── docs/               # Architecture, status, 1LINK API reference
└── Resources/
    └── UI/                 # Design mockups (26 PNGs + Direction A PDF)
        └── screens/
```

---

## 3. Frontend — swiftpay-web

### 3.1 Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.7 |
| Build | Vite | 6.1 |
| Styling | Tailwind CSS | 4.0.6 — uses `@tailwindcss/vite` plugin, **not** classic `tailwind.config.js` |
| Components | Radix UI | dialog, tabs, switch, dropdown-menu, etc. |
| Class utilities | CVA + clsx + tailwind-merge | 0.7.1 / 2.1.1 / 3.0.1 — exported as `cn()` from `src/lib/utils.ts` |
| Forms | React Hook Form + Zod | 7.54 |
| Server state | TanStack Query | 5.66 |
| HTTP client | Axios | 1.7.9 |
| Charts | Recharts | 2.15.1 |
| Icons | Lucide React | 0.475 |
| i18n | i18next | 24.2 (en + ur/RTL) |
| Toasts | Sonner | 1.7 |
| Linting | ESLint 9 + TypeScript ESLint | — |

### 3.2 Project Structure

```
src/
├── main.tsx                  # Entry point
├── router.tsx                # Route definitions (lazy-loaded)
├── index.css                 # Tailwind v4 + design tokens (CSS vars)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # 2-column grid (sidebar + topbar + main)
│   │   ├── Sidebar.tsx       # Navigation + role switcher
│   │   ├── TopBar.tsx        # Search, notifications, CTA
│   │   ├── ErrorBoundary.tsx
│   │   └── PageFallback.tsx  # Lazy route loading spinner
│   ├── shared/
│   │   ├── Avatar.tsx        # Initials-based avatar
│   │   ├── Sparkline.tsx     # Recharts mini charts
│   │   ├── StatusPill.tsx    # RTP status badge
│   │   └── Wordmark.tsx      # SwiftPay logo
│   └── ui/                   # Radix UI primitive wrappers
│       ├── button.tsx, card.tsx, badge.tsx, input.tsx, label.tsx
│       ├── dialog.tsx, drawer.tsx, tabs.tsx, dropdown-menu.tsx, switch.tsx
│       └── index.ts          # Barrel export
├── contexts/
│   ├── AuthContext.tsx        # JWT, user object, role, signIn/signOut/switchRole
│   └── ThemeContext.tsx       # dark/light + accent color (6 presets)
├── features/
│   ├── auth/LoginPage.tsx
│   ├── dashboard/DashboardPage.tsx     # User variant + Admin variant
│   ├── requests/
│   │   ├── RequestsPage.tsx            # Filterable RTP list
│   │   ├── CreateRtpDialog.tsx         # 4-step wizard
│   │   ├── DetailDrawer.tsx            # Right panel + 8s status polling
│   │   └── api.ts                      # React Query hooks
│   ├── settlements/SettlementsPage.tsx
│   ├── aliases/AliasesPage.tsx
│   ├── accounts/BankAccountsPage.tsx
│   ├── settings/SettingsPage.tsx       # Profile, API keys, webhooks, security, notifs
│   ├── system/SystemHealthPage.tsx     # Admin: 1LINK health
│   ├── clients/ApiClientsPage.tsx      # Admin: OAuth2 clients
│   ├── audit/AuditPage.tsx             # Admin: activity log
│   └── misc/NotFoundPage.tsx
├── lib/
│   ├── api.ts                # Axios instance + interceptors
│   ├── auth.ts               # getSession(), setSession(), isSessionLive(), authHeader()
│   ├── env.ts                # Typed VITE_* env vars
│   ├── i18n.ts               # i18next setup
│   ├── queryClient.ts        # TanStack Query config
│   └── utils.ts              # fmtPKR(), relTime(), maskMobile(), maskIban(), uuid(), cn()
├── types/api.ts              # RtpRow, RtpStatus, AliasType, TokenResponse, etc.
├── locales/
│   ├── en.json
│   └── ur.json               # Urdu (WIP)
└── mock/data.ts              # MOCK_RTPS, makeFakeRtps(), MOCK_USER
```

### 3.3 Routing

| Path | Component | Guard |
|---|---|---|
| `/login` | LoginPage | Public |
| `/` | DashboardPage | RequireAuth |
| `/requests` | RequestsPage | RequireAuth |
| `/requests/:rtpId` | RequestsPage (DetailDrawer open) | RequireAuth |
| `/settlements` | SettlementsPage | RequireAuth |
| `/aliases` | AliasesPage | RequireAuth |
| `/accounts` | BankAccountsPage | RequireAuth |
| `/settings/*` | SettingsPage | RequireAuth |
| `/system` | SystemHealthPage | Admin only |
| `/clients` | ApiClientsPage | Admin only |
| `/audit` | AuditPage | Admin only |

All protected routes are lazy-loaded and wrapped in `RequireAuth`.

### 3.4 Authentication Flow

1. User submits email + password → `POST /api/v1/auth/token`
2. JWT stored in `localStorage` under key `swiftpay_token` via `lib/auth.ts`
3. Axios request interceptor injects `Authorization: Bearer <token>` + `X-Correlation-Id` (UUID) + `Idempotency-Key`
4. Response interceptor: 401 → clear session + redirect to `/login`, 503 → show upstream error
5. `isSessionLive()` checks JWT expiry with a 30-second buffer
6. Route guards: `<RequireAuth>` for all authenticated routes; `<RoleGate allow="admin">` for admin-only routes

### 3.5 Data Fetching

- TanStack Query: `staleTime: 30s`, `gcTime: 5min`
- Retry: skip 4xx errors, retry 5xx/network errors up to 2 times
- Dev mode: mock data from `mock/data.ts`; toggled by `const USE_REAL_API = env.isProd` in `features/requests/api.ts`
- Mutations call `queryClient.invalidateQueries()` on success

### 3.6 Theming

- Default: dark theme
- Toggle: dark ↔ light
- Accent colors: 6 presets (sky, green, purple, amber, rose, forest)
- Implemented via CSS custom properties (`--c-bg`, `--c-accent`, `--c-text`, etc.)
- RTL layout automatically applied for Urdu via i18next language detector

### 3.7 Key UI Patterns

**CreateRtpDialog** — 4-step wizard:
1. Recipient (alias lookup)
2. Details (amount, type, expiry)
3. Review
4. Done

**DetailDrawer** — 440px right panel:
- Polls `POST /api/v1/rtp/{id}/status` every 8s while status is `PENDING`
- Cancel flow triggers confirmation dialog → `POST /api/v1/rtp/{id}/cancel`

### 3.8 Vite Build

Manual chunk splitting for optimal long-term caching:
- `react-vendor` — React, React DOM, React Router
- `query-vendor` — TanStack Query
- `chart-vendor` — Recharts
- `radix-vendor` — Radix UI primitives

---

## 4. Backend — payment-service

### 4.1 Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Spring Boot | 4.0.6 |
| Language | Java | 25 |
| Build | Maven | 3.9 |
| Database | PostgreSQL | 17 |
| Migrations | Flyway | — |
| HTTP Client | Spring Cloud OpenFeign | — |
| Resilience | Resilience4j | — |
| Security | Nimbus JOSE (HS256 JWT) | — |
| API Docs | SpringDoc OpenAPI | 2.8.8 |
| Testing | Testcontainers + JUnit 5 | 2.0.5 |

### 4.2 Package Structure

```
com.mofassa.swiftpay.payment/
├── api/
│   ├── advice/GlobalExceptionHandler.java
│   ├── controller/AuthController, AliasLookupController, RtpController
│   └── dto/                           # API-level request/response records
├── application/service/               # Business logic (interfaces + impls)
│   ├── TokenService(Impl)
│   ├── AliasLookupService(Impl)
│   └── RtpService(Impl)
├── domain/
│   ├── enumtype/                      # AliasType, LookupStatus, PartyType, RtpStatus, RtpType
│   ├── exception/                     # PaymentServiceException, ResourceNotFoundException
│   └── repository/                    # Domain repository interfaces
├── infrastructure/
│   ├── onelink/                       # Feign client, DTOs, OAuth2 token cache, ref generator
│   └── persistence/                   # JPA entities + adapters
├── config/
│   ├── properties/ApplicationProperties.java
│   ├── SecurityConfig.java
│   ├── JacksonConfig.java
│   └── OpenApiConfig.java
└── observability/CorrelationIdFilter.java
```

### 4.3 Service Logic

**TokenServiceImpl** — Issues HS256 JWTs. Validates credentials against `app.security.clients[]` config (no DB lookup). Claims: `sub`, `iss`, `iat`, `exp`, `roles`.

**AliasLookupServiceImpl** — Resolves Raast aliases:
- Normalizes mobile (`03X` → `923X`) and IBAN
- Routes to 1LINK endpoint based on `aliasType` + `partyType`
- Persists to `alias_lookups` table
- Returns `lookupId` (UUID) + `rtpId` (1LINK reference)
- Decorated with `@Retry(name="onelink-read")`

**RtpServiceImpl** — Creates/manages RTPs:
- Idempotency check on `idempotency_key` before creating
- Routes to one of 4 1LINK endpoints: `rtpNow/LaterMerchant/Aggregator`
- Status inquiry + cancellation update entity via `@Modifying @Query`
- Race-condition-safe: `DataIntegrityViolationException` → fallback lookup

**OneLinkTokenService** — OAuth2 `client_credentials` with volatile cache + 30-second expiry buffer.

**ReferenceGenerator** — RRN: 12-digit timestamp + 2-digit random. STAN: 6-digit random.

### 4.4 Resilience

| Pattern | Config |
|---|---|
| Circuit breaker | 10-call window, 50% fail threshold, 30s wait in open, 3 probes in half-open |
| Retry (reads) | Max 3 attempts, 1s wait, retries on Feign/network errors |
| Timeout | Connect: 5s, Read: 15s |
| Idempotency | `idempotency_key` UNIQUE on `payment_requests`; writes never retried |

---

## 5. API Contract

All endpoints are under `/api/v1`. All except `/auth/token` require `Authorization: Bearer <jwt>`.

### Auth

```
POST /api/v1/auth/token
Body: { "clientId": "...", "clientSecret": "..." }
Response: { "accessToken": "...", "tokenType": "Bearer", "expiresIn": 3600 }
```

### Alias Resolution

```
POST /api/v1/aliases/resolve
Body: {
  "aliasType": "MOBILE" | "IBAN",
  "alias": "923001234567" | "PK36SCBL...",
  "channel": "...",
  "merchantId": "..." | null,
  "aggregatorId": "..." | null
}
Response: {
  "lookupId": "<uuid>",
  "rtpId": "<1link-rtpId>",
  "accountTitle": "...",
  "maskedAccount": "...",
  "status": "RESOLVED" | "NOT_FOUND" | "FAILED"
}
```

### RTP Lifecycle

```
POST /api/v1/rtp
Headers: Idempotency-Key: <uuid>
Body: {
  "lookupId": "<uuid>",
  "partyType": "MERCHANT" | "AGGREGATOR",
  "rtpType": "NOW" | "LATER",
  "merchantId": "...",
  "instructedAmount": "1000.00",
  "currency": "PKR",
  "billNo": "...",
  "expiryDateTime": "2025-01-01T00:00:00"
}
Response: { "requestId": "<uuid>", "status": "PENDING", ... }

POST /api/v1/rtp/{id}/status
Response: { "requestId": "...", "status": "PENDING|ACCEPTED|REJECTED|EXPIRED|CANCELLED", ... }

POST /api/v1/rtp/{id}/cancel
Response: { "requestId": "...", "status": "CANCELLED", ... }
```

### Error Format

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "...",
  "correlationId": "<uuid>",
  "violations": [{ "field": "...", "message": "..." }]
}
```

---

## 6. Database Schema

### `alias_lookups`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| mobile_alias | VARCHAR(20) | |
| iban | VARCHAR(34) | |
| alias_type | VARCHAR(10) | `MOBILE` \| `IBAN` |
| lookup_status | VARCHAR(20) | `RESOLVED` \| `NOT_FOUND` \| `FAILED` |
| account_title | VARCHAR(255) | |
| masked_account | VARCHAR(50) | |
| raast_id | VARCHAR(100) | |
| upstream_ref | VARCHAR(255) | rtpId from 1LINK |
| channel | VARCHAR(50) | |
| merchant_id | VARCHAR(100) | |
| aggregator_id | VARCHAR(100) | |
| correlation_id | VARCHAR(36) | |
| created_at | TIMESTAMPTZ | |

### `payment_requests`

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| lookup_id | UUID FK → alias_lookups | |
| rtp_id | VARCHAR(100) | 1LINK RTP ID |
| idempotency_key | VARCHAR(36) UNIQUE | |
| party_type | VARCHAR(20) | `MERCHANT` \| `AGGREGATOR` |
| rtp_type | VARCHAR(10) | `NOW` \| `LATER` |
| merchant_id | VARCHAR(100) | |
| instructed_amount | VARCHAR(20) | |
| currency | VARCHAR(3) | default `PKR` |
| bill_no | VARCHAR(35) | |
| expiry_date_time | VARCHAR(25) | |
| transaction_type | VARCHAR(3) | |
| rtp_status | VARCHAR(20) | `PENDING` \| `ACCEPTED` \| `REJECTED` \| `EXPIRED` \| `CANCELLED` |
| upstream_response_code | VARCHAR(10) | |
| upstream_response_description | VARCHAR(255) | |
| correlation_id | VARCHAR(36) | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

---

## 7. 1LINK Integration

**Sandbox base URL:** `https://sandboxapi.1link.net.pk/uat-1link/sandbox/1Link`

### Implemented Endpoints (12/12)

| Endpoint | Purpose |
|---|---|
| `/preRTPAliasInquiry` | Resolve mobile alias (generic) |
| `/preRTPAliasInquiryAggregator` | Resolve mobile alias (aggregator) |
| `/preRTPAliasInquiryMerchant` | Resolve mobile alias (merchant, with profile fields) |
| `/preRTPTitleFetch` | Fetch IBAN account title (generic) |
| `/preRTPTitleFetchAggregator` | Fetch IBAN account title (aggregator) |
| `/preRTPTitleFetchMerchant` | Fetch IBAN account title (merchant) |
| `/rtpNowMerchant` | Immediate RTP — merchant party |
| `/rtpLaterMerchant` | Scheduled RTP — merchant party |
| `/rtpNowAggregator` | Immediate RTP — aggregator party |
| `/rtpLaterAggregator` | Scheduled RTP — aggregator party |
| `/statusInquiry` | Poll RTP status |
| `/rtpCancellation` | Cancel pending RTP |

### Auth (per request)

- `Authorization: Bearer <token>` (from OAuth2 `client_credentials` token cache)
- `X-IBM-Client-Id: <ONELINK_CLIENT_ID>`
- `X-Correlation-Id: <correlationId>`

### Universal Response Schema

```json
{
  "responseCode": "00",
  "responseDescription": "Success",
  "accountTitle": "...",
  "accountNumber": "...",
  "raastId": "...",
  "bankIMD": "...",
  "rtpId": "..."
}
```

`responseCode: "00"` = success; any other value = error.

---

## 8. Auth & Security

### Frontend JWT Usage

- Stored in `localStorage`
- 30-second expiry buffer before auto-logout
- `X-Correlation-Id` (UUID v4) added to every request
- `Idempotency-Key` (UUID v4) added to mutation requests
- 401 → automatic session clear + redirect to `/login`

### Backend JWT Issuance

- Algorithm: HS256
- Secret: `APP_JWT_SECRET` (min 32 chars)
- Expiry: `APP_JWT_EXPIRATION` (e.g., `PT1H`)
- Claims: `sub` (clientId), `iss`, `iat`, `exp`, `roles`
- Issued by `TokenServiceImpl`, validated by Spring Security resource server

### Access Control

- `/api/v1/auth/token` — public
- `/api/v1/**` — requires valid JWT
- `/actuator/health`, `/actuator/info` — public
- `/swagger-ui.html`, `/v3/api-docs/**` — public

---

## 9. Feature Pages

| Page | Route | Role | Status | Description |
|---|---|---|---|---|
| Login | `/login` | Public | Implemented | Email + password, JWT flow |
| Dashboard (User) | `/` | User | Implemented | Stats, quick-send tiles, sparklines, recent requests |
| Dashboard (Admin) | `/` | Admin | Implemented | System health pulse, event stream |
| Requests | `/requests` | User | Implemented | Filterable RTP list, create wizard, detail drawer |
| Settlements | `/settlements` | User | Mock data | Daily settlement runs, in-transit/settled amounts |
| Aliases | `/aliases` | User | Mock data | Registered Raast aliases (mobile + IBAN), QR placeholder |
| Bank Accounts | `/accounts` | User | Mock data | Linked settlement IBANs, verification status |
| Settings | `/settings/*` | User | Mock data | Profile, API keys, webhooks, 2FA/JWT, notifications |
| System Health | `/system` | Admin | Mock data | P50/P95/error-rate sparklines, 1LINK endpoint matrix |
| API Clients | `/clients` | Admin | Mock data | OAuth2 clients, tier, TPS, last-seen |
| Audit Log | `/audit` | Admin | Mock data | Searchable activity table with correlation IDs |
| Onboarding | — | User | Not built | First-run KYC → bank → alias flow |
| Notifications inbox | — | User | Not built | Bell-anchored panel with filter + mark-all-read |
| Command palette | — | User | Not built | ⌘K — grouped actions/pages/recent |
| Empty / error states | — | All | Not built | Zero-row list, 503 / circuit breaker open |
| Mobile layout | — | All | Not built | Responsive breakpoints (layouts currently assume desktop) |

---

## 10. Design System & UI

### Design Resources

Located at `D:\Work\SwiftPay\Resources\UI\`:
- `SwiftPay UI — Direction A.pdf` — comprehensive design specification
- `screens/` — 26 PNG mockups (924×540) covering all flows

### CSS Design Tokens (`src/index.css`)

Dark theme (default) values:

| Token | Value | Role |
|---|---|---|
| `--c-bg` | `#0a0d12` | Page background |
| `--c-surface` | `#11151b` | Card background |
| `--c-surface-2` | `#181d25` | Elevated surface |
| `--c-surface-3` | `#1f252e` | Further elevation |
| `--c-text` | `#e8ebf0` | Primary text |
| `--c-text-2` | `#a4adba` | Secondary text |
| `--c-text-3` | `#6a7280` | Tertiary / placeholder |
| `--c-border` | `#232932` | Default border |
| `--c-accent` | `#0ea5e9` | Live-swappable accent |
| `--c-success / --c-warn / --c-danger` | — | Status colours |

Tailwind v4 utilities map directly: `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-surface-3`, `text-text`, `text-text-2`, `text-text-3`, `border-border`, `bg-accent`, `text-accent`.

```css
/* Fonts */   Geist (sans), Geist Mono (IDs, IBANs, amounts, timestamps)
/* Radii */   6px (sm), 8px (base), 12px (lg), 16px (xl)
/* Animations */ spin (0.7s), fade-in (0.25s), pulse-ring (1.2s)
```

### Accent Color Presets

| Name | Hex |
|---|---|
| sky (default) | `#0ea5e9` |
| green | `#22c55e` |
| purple | `#a855f7` |
| amber | `#f59e0b` |
| rose | `#ef4444` |
| forest | `#0b5d3b` |

---

## 11. Environment Variables

### Frontend (`swiftpay-web/.env`)

| Variable | Example | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:9771` | Backend base URL |
| `VITE_CLIENT_ID` | `swiftpay-web-dev` | OAuth2 client ID |
| `VITE_CLIENT_SECRET` | `replace-me` | OAuth2 client secret |
| `VITE_ENV_LABEL` | `local` | Shown in UI env badge |

### Backend (`payment-service/.env`)

| Variable | Description |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | DB credentials |
| `SERVER_PORT` | Default 9771 |
| `APP_JWT_SECRET` | HS256 signing secret (min 32 chars) |
| `APP_JWT_ISSUER` | JWT `iss` claim |
| `APP_JWT_EXPIRATION` | e.g., `PT1H` |
| `AUTH_CLIENT_ID` / `AUTH_CLIENT_SECRET` / `AUTH_CLIENT_ROLES` | Client credentials for token issuance |
| `ONELINK_BASE_URL` | 1LINK API base URL |
| `ONELINK_CLIENT_ID` | IBM API gateway client ID |
| `ONELINK_TOKEN_URL` | OAuth2 token endpoint |
| `ONELINK_OAUTH_CLIENT_ID` / `ONELINK_OAUTH_CLIENT_SECRET` / `ONELINK_OAUTH_SCOPE` | 1LINK OAuth2 credentials |

---

## 12. Running Locally

### Frontend

```bash
cd swiftpay-web
npm install
npm run dev          # http://localhost:5173
npm run build        # Type-check + production build → dist/
npm run lint         # ESLint (zero warnings allowed)
npm run type-check   # tsc --noEmit only
npm run preview      # Serve dist/ locally
```

Vite proxies `/api/v1/*` → `http://localhost:9771` in dev.

**Dev login credentials:** `ayesha.khan@nessovo.com` / `developer-secret`

### Backend (Docker)

```bash
cd payment-service
docker compose up --build    # PostgreSQL 17 on :9773 + app on :9771
docker compose logs -f       # Follow logs
docker compose down -v       # Stop + wipe DB
```

### Backend (Maven direct)

```bash
cd payment-service
mvn spring-boot:run
```

Requires PostgreSQL running and env vars set.

### Health check

```bash
curl -s http://localhost:9771/actuator/health | jq .
```

### API docs

```
http://localhost:9771/swagger-ui.html
```

---

## 13. Testing

### Backend Tests (12 tests, 7 classes)

| Class | Tests | Coverage |
|---|---|---|
| `AuthIntegrationTest` | 3 | Valid credentials → JWT, wrong secret → 401, blank ID → 400 |
| `AliasLookupIntegrationTest` | 4 | No JWT → 401, MOBILE alias → 200 + DB row, IBAN alias → 200, bad format → 400 |
| `PaymentServiceApplicationTests` | 1 | Context load |
| `JwtClaimsIntegrationTests` | 3 | JWT claim extraction |
| `AbstractIntegrationTest` | base | Testcontainers PostgreSQL 17, MockMvc, OneLinkRtpClient mocked |

Tests use Testcontainers (real PostgreSQL), not mocks. The 1LINK Feign client is mocked.

### Frontend Tests

No test suite yet — dev/QA uses mock data mode.

---

## 14. Known Gaps / Backlog

### Backend

- [ ] `GET /api/v1/rtp` — RTP list/query endpoint with pagination (frontend `useRequests()` currently uses mock data; this is the most critical missing endpoint)
- [ ] Endpoints for Settlements, Aliases list, Bank Accounts, Settings, System Health, API Clients, Audit Log — none of these management pages have any backend support yet
- [ ] Rate limiting on public endpoints
- [ ] Audit trail (DB table for all actions)

### Frontend

- [ ] Onboarding flow (first-run KYC → bank → alias)
- [ ] Notifications inbox
- [ ] Command palette (⌘K)
- [ ] Empty and error state screens
- [ ] Mobile responsive layout
- [ ] Real API integration for Settlements, Aliases, Bank Accounts, Settings, System Health, API Clients, Audit pages — blocked on backend endpoints above
- [ ] Wire `useRequests()` to real `GET /api/v1/rtp` once backend builds it
- [ ] Urdu translations (ur.json is WIP)
- [ ] RTP list pagination

---

*Last updated: 2026-05-19 — backend fully explored; all 12 1LINK endpoints confirmed implemented*
