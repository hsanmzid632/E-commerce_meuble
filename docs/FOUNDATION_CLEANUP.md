# Foundation Cleanup — Sprint 1B

Stabilization only. No ARM CHAIR redesign. No destructive database reset.

## Changes made

- Stopped tracking secrets and generated dependencies.
- Normalized API to `/api/...` only.
- Centralized frontend API base URL via `VITE_API_URL`.
- Aligned PostgreSQL schema with application code using additive migrations.
- Dual-write product columns (`image`/`image_url`, `active`/`is_active`) so legacy and canonical names stay in sync.
- Hardened auth (no password hash in responses, JWT secret from env only).
- Transactional order create with shipping validation and atomic stock decrement.
- Minimal validation and safer HTTP statuses.
- Documentation for architecture, cleanup, and schema alignment.

## Files modified

- `.gitignore`
- `frontend/.gitignore`
- `backend/src/db.js`
- `backend/src/server.js`
- `backend/src/app.js`
- `backend/src/middlewares/authMiddleware.js`
- `backend/src/controllers/userController.js`
- `backend/src/controllers/productController.js`
- `backend/src/controllers/categoryController.js`
- `backend/src/controllers/orderController.js` (comment only: unused)
- `backend/src/routes/productRoutes.js`
- `backend/src/routes/orderRoutes.js`
- `frontend/src/services/api.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/CartContext.jsx`
- `frontend/src/pages/Cart.jsx` (image URL base only, no UI redesign)

## Files created

- `backend/.gitignore`
- `backend/.env.example`
- `frontend/.env.example`
- `README.md`
- `docs/FOUNDATION_AUDIT.md`
- `docs/FOUNDATION_CLEANUP.md`
- `docs/migrations/001_foundation_schema.sql`

## Git tracking cleanup

Removed from the Git index (local files kept):

- `backend/.env`
- `backend/node_modules/**`

Rotate `JWT_SECRET` and the database password if this repository was ever public: they were previously committed.

## Migrations created

`docs/migrations/001_foundation_schema.sql`

Applied automatically on backend startup by `backend/src/db.js`:

- `ADD COLUMN IF NOT EXISTS` / equivalent `duplicate_column` guards
- Backfill `image_url` from `image` and `is_active` from `active` (and the reverse)
- Add order shipping columns without dropping existing rows
- **No `DROP TABLE`, no data deletion**

Canonical product names going forward: `image_url`, `is_active`.
Legacy columns `image` and `active` are retained and kept synchronized.

## API changes

- Removed duplicate `/orders` mount from `server.js`. Callers must use `/api/orders`.
- Frontend already used `/api` via Axios `baseURL`; no page-level route changes.
- `GET /api/products` still returns active products for anonymous/customer users.
  If a valid **admin** JWT is sent, inactive products are included so admin CRUD works.
- Unknown `/api/*` paths return `404 { message: "Route introuvable" }`.
- Register: `201`, duplicate email `409`, never returns password hash.
- Login: invalid credentials `401` (same JSON `message` field the UI already reads).
- Duplicate category: `409`.
- Order stock / inactive product: `409`. Missing product: `404`.

## Environment changes

Backend (`backend/.env.example`):

- `PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `JWT_SECRET`

Frontend (`frontend/.env.example`):

- `VITE_API_URL` (example: `http://localhost:5000/api`)

`dotenv` now loads `backend/.env` from the backend directory, independent of process cwd.
Backend refuses to start if `JWT_SECRET` is missing.
No `DATABASE_URL` was introduced: the live code uses discrete `DB_*` variables.

## Authentication changes

Preserved:

- bcrypt hashing
- JWT 7-day expiry
- existing `admin` / `client` roles
- frontend login/logout/localStorage behavior
- admin-only product/category/order admin endpoints

Tightened:

- JWT secret comes only from the environment
- Register/login validation
- Password hash no longer returned
- Invalid/expired token still `401`

RBAC for ARM CHAIR (`super_admin`, `manager`, `sales`, `editor`) was **not** added.

## Remaining technical debt

- `orderController.js` is unused (canonical logic is in `orderRoutes.js`).
- Product variants are not modeled (`CartContext` still keys by `product.id` only).
- Cart remains localStorage-only (no server cart).
- No automated test suite.
- `updated_at` is not present on tables.
- CORS is fully open (`cors()` default).
- No rate limiting on login/register.
- Soft-deleted products remain in `products` (by design).
- Admin accounts are still created by setting `users.role = 'admin'` in SQL.

## Known limitations

- Changing login failure from `400` to `401` is a minor API status change; the UI uses `message`, not status.
- Register now stores new emails lowercased; lookup is case-insensitive for existing rows.
- Duplicate `/orders` (non-`/api`) is gone. Any external caller of `http://localhost:5000/orders` must switch to `/api/orders`.
- Visual identity remains the current Velveto prototype. ARM CHAIR redesign is Sprint 2+.

## Potential breaking changes

1. Removal of `/orders` without the `/api` prefix.
2. Login HTTP status `401` instead of `400` for bad credentials.
3. Duplicate email/category now `409` instead of `400`.
4. Register response no longer includes `user.password`.
5. Backend process exits if PostgreSQL or `JWT_SECRET` is missing (previously it could listen anyway).
