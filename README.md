# Finance OS

A personal financial operating system that answers: *what can I afford right now, what should I do with my next paycheque, and what happens if I make a major financial decision?*

```
Laptop / Phone → React + Vite (Vercel) → /api (same-origin rewrite) → Django REST API (Railway) → PostgreSQL
```

- **Backend** (`backend/`): Django 5.2 LTS + DRF. It owns all financial logic, validation and auth.
- **Frontend** (`frontend/`): React 19 + Vite + Tailwind 4, plain JavaScript. It handles presentation and API calls only.


