# Wearism

Fashion storefront and admin for Wearism. The app is Next.js with Prisma. Local development uses SQLite. Production on Vercel uses Neon Postgres. Prices are integer rupees. GST is calculated from store settings (seeded at 5% for a unit price at or under ₹1000, and 12% above that).

## Run locally

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm install` runs `prisma generate` (`postinstall`). There is no migrate script in `package.json`; `npx prisma migrate dev` applies `prisma/migrations`. `npm run db:seed` loads `prisma/seed.ts` and replaces existing catalog, user, and order rows.

### Environment

Copy `.env.example`. Local development keeps:

```
DATABASE_URL="file:./dev.db"
```

That file is `prisma/dev.db`. `npm run dev` uses it. A `postgres://` or `postgresql://` `DATABASE_URL` uses Neon through the serverless driver instead.

### Neon and Vercel

Create `.env.neon.local` (gitignored) with the production branch connection strings from the Neon console:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/neondb?sslmode=require"
```

`DATABASE_URL` is the pooled URL. `DIRECT_URL` is the direct URL. On Vercel, set both in the project environment. Apply the Postgres schema and copy the current SQLite rows (products, image URLs, users, and orders) once:

```bash
npm run db:migrate:neon
npm run db:copy-to-neon
npm run dev:neon
```

`db:copy-to-neon` reads `prisma/dev.db` and replaces the Neon tables with that snapshot. It does not modify the SQLite file. Product images in the database are URL strings, so they move with each product row. Admin uploads are stored in the `StoredImage` table and served from `/api/media/[id]`, so they work on Vercel as well as locally. Apply `npm run db:migrate:neon` after pulling this change so the table exists before the first upload. The upload route also creates the table if it is missing.

`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are optional. Both must be set for live Razorpay checkout. Keys stay in the environment; admin settings only show whether the key id is set.

Other scripts: `npm run build`, `npm start`, `npm run lint`.

## Logins

Seeded accounts. Sign in at `/login`.

**Admin**

- Email: `admin@wearism.dev`
- Password: `admin12345`
- Admin URL: `/admin` (non-admins are sent back to login)

**Customer**

- Email: `ananya@wearism.dev`
- Password: `customer12345`

The customer has a default Bengaluru address, three product reviews, a cash-on-delivery order in `placed`, and a paid Razorpay order in `shipped` with tracking `WRSM3921847601`.

Register new customers at `/register`. Checkout and `/account` require a signed-in customer.

## Store

| Path | What it is |
| --- | --- |
| `/` | Home, grouped by category |
| `/shop` | Catalog |
| `/product/[slug]` | Product, size, and reviews |
| `/cart` | Cart (guests can add items; checkout requires login) |
| `/checkout` | Address, GST summary, payment |
| `/order/[id]` | Order confirmation, status, shipment |
| `/account` | Profile. Also `/account/orders`, `/account/orders/[id]`, `/account/addresses` |

Seeded categories: New in, Coats, Tops, Knitwear. One product is inactive and out of stock (`wide-leg-trouser`).

## Admin

| Path | What it is |
| --- | --- |
| `/admin` | Dashboard: paid revenue, order counts, products with stock at or under 5 |
| `/admin/products` | List, create (`/admin/products/new`), edit (`/admin/products/[id]`) |
| `/admin/orders` | List and open an order (`/admin/orders/[id]`) |
| `/admin/customers` | List and open a customer (`/admin/customers/[id]`) |
| `/admin/reports/gst` | GST invoice totals for a date range |
| `/admin/settings` | Store name, support email, GST threshold and rates |

Order status moves only forward: **placed → processing → shipped → delivered**. Marking an order shipped requires a carrier and a tracking number. A delivered order cannot move backward. Cash on delivery stays pending until the order is marked delivered, which sets payment to paid.

## Payments

Checkout offers cash on delivery and pay online.

- **Cash on delivery:** order is created with payment pending.
- **Razorpay:** used when both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set. The order is marked paid after signature verification.
- **Demo online payment:** used when either key is missing. Confirming it marks the order paid and does not charge a card.

## Password reset

`/forgot-password` does not send email. If the account exists, the next screen shows the reset link. The link is `/reset-password?token=...` and the token expires after one hour. The new password must be at least 8 characters.
