# Finance OS

A personal financial operating system that answers: *what can I afford right now, what should I do with my next paycheque, and what happens if I make a major financial decision?*

```
Laptop / Phone → React + Vite (Vercel) → /api (same-origin rewrite) → Django REST API (Railway) → PostgreSQL
```

- **Backend** (`backend/`): Django 5.2 LTS + DRF. It owns all financial logic, validation and auth.
- **Frontend** (`frontend/`): React 19 + Vite + Tailwind 4, plain JavaScript. It handles presentation and API calls only.

## Core concepts (kept strictly separate)

| Concept | Meaning | Lives in |
|---|---|---|
| **Actual** | What really happened | `ledger`: Account, Category, Transaction, Transfer |
| **Projected** | What is expected to happen | `schedule`: IncomeSource, RecurringRule |
| **Planned** | What you intend to do with money | `planning`: FinancialPeriod, Budget, Allocation, Goal |
| **Interpretation** | How everything above is combined | `engine` (pure functions, no models) |

## Local development

Requirements: Python 3.12+, Node ≥ 20.19, and PostgreSQL running locally (Postgres.app or Homebrew).

```bash
createdb finance_dev
```

### Backend
```bash
cd backend
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/python manage.py migrate
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to Django on :8000.

> This machine has an old Node 16 at `/usr/local/bin/node` ahead of Homebrew's Node 25. If `npm run dev` fails with a `styleText` error, run `export PATH=/opt/homebrew/bin:$PATH` first.

### Tests
```bash
cd backend && .venv/bin/python manage.py test
```

## Authentication

The app uses Django's built-in session auth, with no JWTs.

- Login creates a server-side session. The browser holds only an **httpOnly, SameSite=Lax** session cookie, which JavaScript cannot read.
- CSRF protection: the SPA fetches `/api/auth/csrf/`, and axios echoes the `csrftoken` cookie as `X-CSRFToken` on every unsafe request. Login and register also enforce CSRF, to prevent login-CSRF attacks.
- "Keep me signed in" gives a 30-day session; without it, the session ends when the browser closes.
- Login and register are rate-limited (10/min).
- Unauthenticated API calls return **401**. CSRF and permission failures return **403**.
- **Same-origin is essential.** In production, Vercel rewrites `/api/*` to Railway, so the cookie is first-party. Safari would block it as a third-party cookie otherwise.

Endpoints: `GET csrf/`, `POST login/`, `POST logout/`, `POST register/` (only when `ALLOW_REGISTRATION=true`), `GET|PATCH me/`, `POST password/`, all under `/api/auth/`. There is also `GET /api/health/`.

## Money

All amounts are `Decimal` and are stored as `NUMERIC(12,2)`. Rounding is ROUND_HALF_UP to the cent, applied once at output (`apps/core/money.py`). The API sends money as **strings**, and the frontend only formats it.

## Roadmap

1. ✅ Foundation: settings, custom email user, session auth, app shell
2. Core money: accounts, categories, transactions, transfers, income sources, recurring rules, seed data
3. Planning: periods, budgets, allocations, Paycheque Planner
4. Financial engine: cash flow, Safe to Spend, dashboard
5. Goals & debt projections
6. Scenarios (including the car calculator)
7. Polish & PWA
8. Test hardening
9. Deployment (Railway + Vercel)
