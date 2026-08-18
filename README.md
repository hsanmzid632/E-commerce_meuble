# E-commerce meuble

Prototype e-commerce (React + Express + PostgreSQL).

This repository is being prepared as the foundation for the future ARM CHAIR Tunisia platform. Sprint 1B is a technical cleanup only: no visual redesign.

## Requirements

- Node.js 18+
- PostgreSQL 16+

## Setup

### 1. Database

Create an empty PostgreSQL database, then copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your local PostgreSQL credentials and a strong `JWT_SECRET`.

Tables are created automatically on backend startup. Missing columns are added with non-destructive `ALTER TABLE` statements. Existing data is never dropped.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API: `http://localhost:5000`

Canonical routes:

- `POST /api/users/register`
- `POST /api/users/login`
- `GET|POST|PUT|DELETE /api/products`
- `GET|POST|PUT|DELETE /api/categories`
- `POST /api/orders`
- `GET /api/orders/me`
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Default app URL: `http://localhost:5173`

`VITE_API_URL` defaults to `http://localhost:5000/api` if unset.

## Documentation

- `docs/FOUNDATION_AUDIT.md` — architecture and issues found
- `docs/FOUNDATION_CLEANUP.md` — changes applied in Sprint 1B
- `docs/migrations/001_foundation_schema.sql` — safe schema alignment
