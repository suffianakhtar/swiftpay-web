# SwiftPay — Web

Production-ready frontend scaffold for the **SwiftPay** payment service (Pakistan Raast / 1LINK).
Built on **React 18**, **TypeScript**, **Vite**, **Tailwind v4**, **TanStack Query**, **React Router v6**,
**Radix Primitives**, **React Hook Form + Zod**, **Recharts**, **Lucide**, and **i18next**.

---

## Quickstart

```bash
# 1. Install
cd swiftpay-web
npm install

# 2. Configure env
cp .env.example .env.local
#   - point VITE_API_BASE_URL at your Spring Boot service (default: http://localhost:9771)
#   - set VITE_CLIENT_ID / VITE_CLIENT_SECRET if calling /api/v1/auth/token

# 3. Run
npm run dev        # → http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the build
npm run lint
npm run type-check
```

The dev server proxies `/api/v1/*` to `VITE_API_BASE_URL` to sidestep CORS while you point at a local backend.

By default the data hooks return **mocked data** so the UI works without a backend.
Open `src/features/requests/api.ts` and flip `USE_REAL_API` (or set `import.meta.env.PROD`)
when you're ready to hit the real `/api/v1/*` endpoints.

---

## What's inside

```
src/
├── main.tsx                       Bootstrap: Providers + Router
├── router.tsx                     Route map (lazy-loaded), auth & role gates
├── index.css                      Tailwind v4 + design tokens (CSS vars)
├── lib/
│   ├── api.ts                     Axios instance + 401 / 503 interceptors,
│   │                              X-Correlation-Id + Idempotency-Key auto-stamping
│   ├── auth.ts                    Token storage + expiry helpers
│   ├── env.ts                     Typed env access
│   ├── i18n.ts                    i18next + RTL handling (en, ur skeleton)
│   ├── queryClient.ts             TanStack Query defaults
│   └── utils.ts                   cn(), fmtPKR(), relTime(), uuid(), mask helpers
├── contexts/
│   ├── ThemeContext.tsx           Dark/light + live accent swap
│   └── AuthContext.tsx            Sign-in, sign-out, role switching, 401 handler
├── components/
│   ├── ui/                        Primitives (button, card, input, dialog,
│   │                              drawer, tabs, dropdown-menu, switch, badge)
│   ├── layout/                    AppShell, Sidebar, TopBar, ErrorBoundary
│   └── shared/                    Wordmark, Avatar, StatusPill, Sparkline
├── features/
│   ├── auth/                      LoginPage
│   ├── dashboard/                 User + admin dashboards
│   ├── requests/                  List, detail drawer, create wizard, api hooks
│   │                              (status polling + cancellation + Idempotency-Key)
│   ├── settlements/               Settlements list
│   ├── aliases/                   Manage Raast aliases
│   ├── accounts/                  Linked bank accounts
│   ├── settings/                  Profile · API keys · Webhooks · Security · Notifications
│   ├── audit/                     Filterable audit log (admin)
│   ├── system/                    1LINK upstream health (admin)
│   ├── clients/                   OAuth2 API clients (admin)
│   └── misc/                      404
├── types/api.ts                   DTOs mirroring com.mofassa.swiftpay.payment.api.dto.*
├── mock/data.ts                   Mock data for offline development
└── locales/                       i18n bundles (en, ur)
```

---

## API integration

The scaffold mirrors the existing Spring Boot service endpoints:

| Backend | Hook | File |
| --- | --- | --- |
| `POST /api/v1/auth/token` | `signIn()` | `contexts/AuthContext.tsx` |
| `POST /api/v1/aliases/resolve` | `useResolveAlias()` | `features/requests/api.ts` |
| `POST /api/v1/rtp` | `useCreateRtp()` | `features/requests/api.ts` |
| `POST /api/v1/rtp/{id}/status` | `useStatusInquiry()` | `features/requests/api.ts` |
| `POST /api/v1/rtp/{id}/cancel` | `useCancelRtp()` | `features/requests/api.ts` |

The axios client (`src/lib/api.ts`) automatically attaches:
- `Authorization: Bearer <jwt>` from `AuthContext`
- `X-Correlation-Id` (uuid) — threads UI sessions through backend logs
- `Idempotency-Key` (uuid) on `POST /rtp` if the caller didn't supply one

A `401` response clears the local session and redirects to `/login`.

---

## Theming

Theme is **CSS variables**, swapped at runtime by `ThemeContext`:

- `data-theme="dark|light"` toggles the colour palette on `<html>`.
- `--c-accent` is a single live variable — `setAccent(hex)` updates it everywhere instantly.
  Tailwind reads it via `@theme inline` in `index.css`, so utilities like
  `bg-accent` / `text-accent` track the swap automatically.

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { setAccent, toggleTheme } = useTheme();
setAccent('#22c55e');
```

---

## Forms

Every form uses **React Hook Form + Zod**.

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type Values = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<Values>({
  resolver: zodResolver(schema),
});
```

See `features/auth/LoginPage.tsx` and `features/requests/CreateRtpDialog.tsx` for end-to-end examples.

---

## Conventions

- **Path alias** — `@/...` resolves to `src/...` (configured in `vite.config.ts` + `tsconfig.json`).
- **UI primitives** — anything reusable lives in `components/ui` and re-exports via the barrel
  `components/ui/index.ts`. Import as `import { Button, Card } from '@/components/ui'`.
- **Feature folders** — each feature has its page(s), local components, and `api.ts` for queries/mutations.
  Don't reach across features for data hooks; hoist into `lib/` if shared.
- **Money** — always render through `fmtPKR()` (`src/lib/utils.ts`) so the locale + tabular numerals stay consistent.
- **Time** — render through `relTime()` for "3h ago" style or `toLocaleString('en-GB')` for absolute timestamps.
- **Idempotency** — generate a key with `uuid()` when initiating any user-facing create flow; the axios
  layer also auto-stamps `POST /rtp` so retries are always safe.

---

## i18n / RTL

- English (`src/locales/en.json`) and Urdu (`src/locales/ur.json`, empty strings).
- Language detected from browser; switching to `ur` flips `<html dir="rtl">` automatically.
- All copy in components should go through `useTranslation()` — see `LoginPage` for patterns.

---

## Production

```bash
npm run build
```

Output lands in `dist/`. The build is code-split per route (lazy imports in `router.tsx`) and per vendor
bundle (`react-vendor`, `query-vendor`, `chart-vendor`, `radix-vendor`).

Drop the contents of `dist/` behind any static host (Vercel, Netlify, Cloudfront, nginx). The SPA needs a
catch-all rewrite to `index.html` for client-side routing.

---

## Not yet wired

A few screens from the original design are intentionally stubbed or simplified — fill them in following the
established patterns:

- ⌘K command palette (placeholder button in `TopBar.tsx`)
- Notifications inbox (bell button — see `TopBar.tsx`)
- Onboarding flow (first-run KYC → bank → alias)
- Empty / error states for every list (only Requests has a starter)
- Real backend list endpoint for `GET /rtp` — `useRequests()` currently returns mock rows
