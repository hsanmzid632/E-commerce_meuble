# Foundation Audit — Sprint 1B

Audit of the existing e-commerce prototype before the ARM CHAIR redesign.
No visual identity work is included in this sprint.

## Current architecture

```
frontend/          React 19 + Vite + Tailwind + Axios
  src/pages        Home, Products, ProductDetails, Cart, Login, Register,
                   MyOrders, About, AdminDashboard, AdminOrders
  src/context      AuthContext, CartContext
  src/services     api.js (single Axios client)
  src/components   Header, Footer, ProtectedRoute

backend/           Express 5 + PostgreSQL (pg) + JWT + bcrypt
  src/server.js    HTTP listener
  src/app.js       Middleware + route mounting
  src/db.js        Pool + CREATE TABLE IF NOT EXISTS + safe ALTERs
  src/routes       users, products, categories, orders
  src/controllers  users, products, categories, orders (legacy unused)
  src/middlewares  JWT auth + adminOnly
```

## Current stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Tailwind 3, Axios, Lucide |
| Backend | Node.js, Express 5, dotenv, cors |
| Auth | JWT (7 days), bcrypt (cost 10) |
| Database | PostgreSQL, `pg` Pool |
| Roles (current) | `admin`, `client` |

## Current API routes (canonical)

All application traffic must use `/api/...`.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/` | public | Health message |
| POST | `/api/users/register` | public | Creates `client` |
| POST | `/api/users/login` | public | Returns JWT + public user |
| GET | `/api/categories` | public | |
| POST/PUT/DELETE | `/api/categories` | admin | |
| GET | `/api/products` | public (optional admin token) | Public list is active-only |
| GET | `/api/products/:id` | public | |
| POST/PUT/DELETE | `/api/products` | admin | DELETE is soft (`is_active=false`) |
| POST | `/api/orders` | authenticated | Transactional create |
| GET | `/api/orders/me` | authenticated | Customer history |
| GET | `/api/orders` | admin | All orders |
| PATCH | `/api/orders/:id/status` | admin | |

## Current database structure

Inspected live database `mobilier_store` (no dump committed).

### users
`id`, `fullname`, `email` (unique), `password` (bcrypt hash), `role` default `client`

### categories
`id`, `name` (unique)

### products
Canonical: `image_url`, `is_active`, `created_at`  
Legacy (kept): `image`, `active`  
Also: `title`, `description`, `price`, `stock`, `category_id`

### orders
Core: `id`, `user_id`, `total`, `status`, `created_at`, `customer_name`, `customer_email`, `customer_phone`, `customer_address`  
Shipping extras (added safely if missing): `customer_city`, `customer_postal_code`, `customer_governorate`, `customer_cin`, `customer_birthdate`, `customer_phone2`, `customer_instructions`

### order_items
`id`, `order_id`, `product_id`, `quantity`, `unit_price`

## Current authentication

- Register hashes passwords with bcrypt.
- Login signs JWT with `JWT_SECRET` (`id`, `email`, `role`).
- `authMiddleware` requires `Authorization: Bearer <token>`.
- `adminOnly` checks `req.user.role === "admin"`.
- Frontend `AuthContext` stores `token` + `user` in `localStorage`.
- `ProtectedRoute` blocks unauthenticated pages; `adminOnly` blocks customers from `/admin` and `/admin/orders`.
- Future RBAC (`super_admin`, `manager`, `sales`, `editor`, `customer`) is **not** implemented.

## Current cart

Client-side only (`localStorage` key `cart`).

Item shape: `{ id, title, price, image_url, stock, qty }`

Supported: add, remove, update quantity (capped by stock), clear, count, total, persistence after refresh.

No variant support yet. Item identity is `product.id`.

## Current orders

Canonical create path is **inline in** `backend/src/routes/orderRoutes.js`:

1. Validate items + shipping
2. `BEGIN`
3. Load products, decrement stock with `stock >= qty`
4. Insert `orders` then `order_items` (server-calculated total)
5. `COMMIT` / `ROLLBACK`

`backend/src/controllers/orderController.js` is **not mounted**. It is a legacy non-transactional implementation that also referenced columns (`customer_firstname`, `customer_lastname`) that were never part of the live schema.

## Identified issues (before cleanup)

1. `backend/.env` was tracked in Git (credentials + JWT secret).
2. `backend/node_modules` was tracked in Git (~1150 files).
3. Root `.gitignore` was incomplete (no `.env.example` exception, logs, coverage).
4. Duplicate order mount: `server.js` exposed `/orders` in addition to `/api/orders`.
5. Frontend API URL hardcoded to `http://localhost:5000/api`.
6. Product schema mismatch: SQL used `image` / `active`; app used `image_url` / `is_active`.
7. Order insert referenced shipping columns that did not exist on the live table — checkout could fail.
8. `pool.connect()` never released a client (connection leak).
9. Register `RETURNING *` leaked the password hash to the client.
10. Login used a hardcoded JWT fallback that middleware did not share.
11. Public `GET /api/products` hid inactive products from admin CRUD.
12. Order creation did not validate required shipping fields server-side (frontend did).
13. Stock decrement was not atomic (`stock >= qty`).
14. Errors sometimes forwarded raw `err.message` (risk of SQL details).
15. `dotenv` loaded from process cwd, not from `backend/.env` reliably.
16. Unused `orderController.js` still present.

## Intentionally untouched

- Homepage, header, footer, colors, typography, product cards
- ARM CHAIR visual identity
- Product variants, wishlist, payments, CMS, advanced RBAC
