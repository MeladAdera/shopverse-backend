# Shopverse API

REST API for the Shopverse e-commerce platform. It provides authentication, product catalog and search, shopping cart, checkout and orders, product reviews, and admin tooling. The service is built with **Express** and **TypeScript**, uses **PostgreSQL** via `pg`, and applies **Zod** for configuration validation and request validation where configured.

## Features

- **Authentication** — Registration, login, JWT access and refresh tokens, profile, logout
- **Products** — Listing with filters, search, categories, brands, seasons, top sellers, image uploads (Multer), admin CRUD and stock
- **Cart** — Authenticated cart CRUD and item counts
- **Orders** — Checkout from cart, list orders, order detail, cancel
- **Reviews** — Create, list, summaries, eligibility checks, delete (authenticated)
- **Admin** — User management, order management, dashboard stats, categories (public category list plus protected mutations)
- **Operations** — Health check, Helmet security headers, configurable CORS, rate limiting in production, structured error handling, migrations on startup

## Requirements

- **Node.js** 18 or newer (recommended LTS)
- **PostgreSQL** 14 or newer

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure PostgreSQL

Create a database for the application (for example `shopverse`). Update the connection settings in `src/config/database.ts` (`host`, `port`, `database`, `user`, `password`) so they match your local or hosted PostgreSQL instance.

On first successful start, the app runs `runMigrations()` and creates required tables if they do not exist.

### 3. Environment variables

Create a `.env` file in the project root. Values are validated in `src/config/env.ts`.

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development`, `production`, or `test` (default: `development`) |
| `PORT` | HTTP port (default: `5000`) |
| `HOST` | Bind host used in startup logs (default: `localhost`) |
| `FRONTEND_URL` | Allowed frontend origin context (default: `http://localhost:5173`) |
| `JWT_SECRET` | Secret for signing access tokens — **set a strong value in production** |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens — **set a strong value in production** |
| `DATABASE_URL` | Optional; reserved for future use (connection is currently defined in `database.ts`) |

Example:

```env
NODE_ENV=development
PORT=5000
HOST=localhost
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
FRONTEND_URL=http://localhost:5173
```

### 4. CORS

Allowed browser origins are defined in `src/config/cors.ts`. Add your frontend URL to `allowedOrigins` when deploying or running a client on a new host.

### 5. Run the server

**Development** (TypeScript with watch):

```bash
npm run dev
```

**Production** — compile then start:

```bash
npm run build
npm start
```

**Typecheck only** (no emit):

```bash
npm run predeploy
```

The server listens on `PORT` (default `5000`). After startup you should see:

- `GET /api/health` — liveness and environment info
- `GET /` — short welcome payload

## API overview

Base path for most resources is `/api`. Send JSON bodies with `Content-Type: application/json` unless uploading files (product create/update image routes use `multipart/form-data`).

| Area | Base path | Notes |
|------|-----------|--------|
| Auth | `/api/auth` | `register`, `login`, `refresh-token`; `profile`, `logout` require `Authorization: Bearer <token>` |
| Products | `/api/products` | Public reads; admin writes require admin role |
| Reviews | `/api/products/:productId/reviews`, `/api/reviews/:reviewId`, etc. | Mixed public and authenticated |
| Cart | `/api/cart` | All routes require authentication |
| Orders | `/api/orders` | All routes require authentication |
| Admin | `/api/admin` | Most routes require authentication + admin; `GET /api/admin/categories` is public in the current router |

Static assets are served from `public/` (for example `/public`, `/products` for product images). Ensure those directories exist on disk when using image features.

## Project layout

```
src/
  app.ts              # Express app, middleware, route mounting
  server.ts           # Startup, DB check, migrations, graceful shutdown
  config/             # env, database, CORS, rate limits, uploads
  controllers/        # HTTP handlers
  services/           # Business logic
  repositories/       # SQL / data access
  routes/             # Route definitions
  middleware/         # Auth, validation, admin guard
  database/migrate.ts # Schema bootstrap (CREATE TABLE IF NOT EXISTS)
  models/, utils/, errors/
```

Compiled output is written to `dist/` when you run `npm run build`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Run `src/server.ts` with `tsx` in watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run `dist/server.js` |
| `npm run predeploy` | `tsc --noEmit --strict` using `tsconfig.strict.json` |

## Tech stack

- [Express](https://expressjs.com/) — HTTP server
- [PostgreSQL](https://www.postgresql.org/) + [node-pg](https://node-postgres.com/) — persistence
- [Zod](https://zod.dev/) — env and request validation
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JWT
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing
- [Helmet](https://helmetjs.github.io/), [cors](https://github.com/expressjs/cors), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) — security and abuse mitigation
- [Multer](https://github.com/expressjs/multer) — multipart uploads
- [morgan](https://github.com/expressjs/morgan) — HTTP logging

## License

This project is provided as-is for Shopverse. Add a `LICENSE` file at the repository root if you intend to distribute or open-source it.
