# CoolShop

A Next.js marketplace with a local MongoDB catalog, guest and signed-in bags, and demo checkout. The first iteration is the core shopping loop. Departments, payments, reviews, and admin tools can be added on the same services.

## Run it

MongoDB should be listening on `127.0.0.1:27017`.

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo accounts after seeding:

- Shopper: `demo@coolshop.dev` / `demo12345` with CC 2,000.00
- Desk: `admin@coolshop.dev` / `admin12345`

Seeding reloads the catalog, sample reviews, and CoolCash balances, and clears local orders so they do not point at old products.

Copy `.env.example` to `.env.local` if you clone this without the local env file. `AUTH_SECRET` signs the session cookie.

## What is included

- Home, department, search, and product pages
- Guest bag that merges into the account on sign-in
- Register, sign-in, checkout, and order history
- CoolCash test balance (1 CC = $1). New accounts start with CC 500.00
- Reviews from customers who bought the item
- Cancel before shipment, with stock and CoolCash returned
- Admin order desk to mark shipped and delivered
- Admin product desk to create and edit catalog items
- Saved addresses, with the default one filled in at checkout
- Wishlist, recently viewed products, and an often-bought-with row from past orders
- Coupon codes. Seeded codes: `WELCOME10` (10% off orders of $20 or more) and `SAVE5` ($5 off)
- JSON API under `/api/v1` for the same use cases

Pay on delivery does not spend CoolCash. A real card processor can replace CoolCash later.

## How it is split

- `src/domain` — money, shipping quote, catalog query parsing
- `src/lib/db` — Mongoose connection and models
- `src/lib/repositories` — the only place that talks to collections
- `src/lib/services` — catalog, bag, auth, and orders
- `src/lib/actions` — UI mutations
- `src/app/api/v1` — HTTP API over those services

Prices are stored in cents. Product text search uses a MongoDB text index. Listing queries are paginated.

## Later

An editable catalog, saved addresses, and a real payment provider can sit behind the current services. CoolCash is the stand-in until that provider exists.
