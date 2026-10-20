# Nexura Technologies — Phone Repair, Accessories & Electronics

A full-stack website for a phone repair and technology shop in Namibia. Customers can book a
repair, shop for accessories and electronics, offer a device for sale and track their booking.
The business owner manages everything from a protected admin dashboard.

Built as a submission for the Golden Switch Technologies internship coding challenge.

> The business name, phone number and email are set in `client/src/config/site.js`. The address,
> opening hours and product catalogue are still sample data. They are all changed from a handful
> of files — see [Customising](#customising).

## Features

**For customers**

- **Request a Repair** — brand/model pickers that adapt to the device, 21 hardware issues, software
  issues that switch between iOS and Android, optional photo upload, drop-off or pickup (pickup
  fields only appear and are only required when pickup is chosen), and a reference number on success.
- **Accessories and Other Electronics shops** — category filters, instant search, stock indicators.
- **Shopping cart** — add, remove, change quantity, stock limits, survives a page refresh, and
  re-checks prices and stock when opened.
- **Checkout** — delivery or collection, delivery address required only for delivery, configurable
  delivery fee. Saves an order request; **no online payment is taken or claimed**.
- **Sell Your Device** — describe a device, attach up to 4 photos and name an asking price. Clearly
  an enquiry, not an offer.
- **Track Your Order** — progress bar and status history for repairs, orders and sale enquiries.
  Needs the reference number **and** the phone/email used, and never reveals personal details.
- **Search** across both shops from the navigation bar, plus About and Contact pages.
- Responsive from phone to desktop, with a working mobile menu.

**For the business owner** (`/admin`)

- Sign in with a hashed password; every admin API route is checked on the server.
- View and search repairs, orders and sale enquiries by reference, customer or status.
- Update statuses with internal notes; every change is logged with who made it and when.
- Record a proposed offer and private notes on sale enquiries.
- Add, edit, re-price, restock and deactivate products.
- Read contact-form messages and view customers' uploaded photos (admin only).

## Technology

| Layer    | Tools                                                                 |
| -------- | --------------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Tailwind CSS 4, lucide-react icons      |
| Backend  | Node.js, Express 5                                                    |
| Database | MySQL 8 (`mysql2`, parameterised queries, transactions)               |
| Security | bcrypt password hashing, JWT in an httpOnly cookie, helmet, rate limits |
| Uploads  | multer (type, size and file-signature checks)                         |
| Tests    | Node's built-in test runner + supertest                               |

## Project structure

```
├── client/                     React frontend
│   ├── public/images/products/ product illustrations (replace with real photos)
│   └── src/
│       ├── api/                fetch wrapper + one function per API endpoint
│       ├── components/         reusable UI (layout, ui, forms, shop, admin, art)
│       ├── config/             ★ business details, form options, page text
│       ├── context/            shopping cart state
│       ├── hooks/              useForm, useCatalogue
│       ├── pages/              one file per page
│       ├── styles/index.css    ★ colours, fonts and shared button/input styles
│       └── utils/              formatting and browser-side validation
├── server/                     Express API
│   ├── src/
│   │   ├── config/             environment settings, status lists
│   │   ├── controllers/        handle each request
│   │   ├── db/                 connection pool + setup script
│   │   ├── middleware/         auth, uploads, rate limits, error handler
│   │   ├── models/             all SQL lives here
│   │   ├── routes/             URL → controller mapping
│   │   ├── utils/              reference numbers, validation helpers
│   │   └── validators/         server-side checks for each form
│   ├── tests/                  automated tests
│   └── uploads/                customer photos (not committed)
├── database/
│   ├── schema.sql              tables
│   └── seed.sql                sample categories and products
└── docs/CODE_GUIDE.md          how the code works, file by file
```

★ = the files you edit most often to customise the site.

## Getting started

### 1. Requirements

- [Node.js](https://nodejs.org) 20 or newer (developed on Node 26)
- MySQL 8, running

### 2. Install

```bash
git clone https://github.com/Mweshii/Internship-Challenge.git
cd Internship-Challenge
npm run install:all
```

### 3. Configure

Copy `server/.env.example` to `server/.env` and fill it in:

```bash
cp server/.env.example server/.env
```

| Variable                              | What to put                                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| `DB_HOST`, `DB_PORT`                  | Where MySQL runs (usually `127.0.0.1` and `3306`)                  |
| `DB_USER`, `DB_PASSWORD`              | Your MySQL login                                                   |
| `DB_NAME`                             | Database name to create/use (default `techfix`)                    |
| `JWT_SECRET`                          | A long random string (command below)                               |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`       | The admin login to create (password: at least 10 characters)       |
| `DELIVERY_FEE`                        | Delivery fee in N$. **`50` in the example file is a sample value** |
| `DELIVERY_ENABLED`, `COLLECTION_ENABLED` | Set to `false` to switch an option off                          |

Generate a `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`server/.env` is in `.gitignore`. Never commit it.

### 4. Create the database

```bash
npm run db:setup
```

This creates the database, the tables, the sample products and your admin account. It is safe to
run again — existing data is kept. To wipe everything and start over, use `npm run db:reset`.

<details>
<summary>Doing it by hand in MySQL Workbench instead</summary>

```sql
CREATE DATABASE techfix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techfix;
-- then run database/schema.sql, followed by database/seed.sql
```

You still need `npm run db:setup` afterwards to create the admin account, because the password
must be hashed by the application.

</details>

### 5. Run

```bash
npm run dev
```

- Website: <http://localhost:5173>
- Admin dashboard: <http://localhost:5173/admin>
- API: <http://localhost:4000/api/health>

`npm run dev` starts both servers. To run them in separate terminals instead, use
`npm run dev --prefix server` and `npm run dev --prefix client`.

### Production build (optional)

```bash
npm run build
npm start
```

`npm run build` creates `client/dist`; the Express server then serves the website and the API
together on one port (4000). Set `NODE_ENV=production` so the login cookie is HTTPS-only.

## Tests

```bash
npm test
```

55 automated tests cover reference-number generation, every form validator (including the
pickup/drop-off and delivery/collection rules), tracking privacy helpers, admin authorisation
(no cookie, forged cookie, non-admin user), upload rejection, and how the API behaves when the
database is unreachable. They need no database and never touch real data.

## API overview

| Method | Route                                  | Purpose                                   |
| ------ | -------------------------------------- | ----------------------------------------- |
| GET    | `/api/health`                          | Server and database check                 |
| GET    | `/api/settings`                        | Delivery fee and fulfilment options       |
| GET    | `/api/categories?section=`             | Product categories                        |
| GET    | `/api/products?section=&search=`       | Active products                           |
| POST   | `/api/repairs`                         | Submit a repair request (+ optional photo) |
| POST   | `/api/sell-enquiries`                  | Submit a sale enquiry (+ up to 4 photos)  |
| POST   | `/api/orders`                          | Place an order request                    |
| POST   | `/api/track`                           | Look up a booking (reference + contact)   |
| POST   | `/api/contact`                         | Send a contact message                    |
| POST   | `/api/auth/login` · `/logout`          | Admin sign in / out                       |
| GET    | `/api/auth/me`                         | Who is signed in                          |
| —      | `/api/admin/*`                         | Admin only — see `server/src/routes/adminRoutes.js` |

## Customising

| To change…                              | Edit                                                             |
| --------------------------------------- | ---------------------------------------------------------------- |
| Brand name, phone, email, address, hours | `client/src/config/site.js`                                     |
| Navigation links                        | `navLinks` in `client/src/config/site.js`                        |
| Colours and font                        | the `@theme` block in `client/src/styles/index.css`              |
| Button / input / card styling           | `@layer components` in `client/src/styles/index.css`             |
| Homepage and About wording              | `client/src/config/content.js`                                   |
| Repair brands, models and issue lists   | `client/src/config/repairOptions.js`                             |
| Sell-form options                       | `client/src/config/sellOptions.js`                               |
| Products, prices, stock                 | Admin dashboard → Products (or `database/seed.sql` + `db:reset`) |
| Product pictures                        | add files to `client/public/images/products/`, set the image path in the dashboard |
| Status names and tracking steps         | `server/src/config/statuses.js`                                  |
| Delivery fee and options                | `server/.env`                                                    |
| Hide the "sample catalogue" banner      | `showSampleDataNotice` in `client/src/config/site.js`            |

## Known limitations

- **No online payment.** Checkout saves an order request and the business arranges payment.
  `orders.payment_status` exists for a future payment provider and is always `not_paid` today.
- **No notifications.** The site does not send email, SMS or WhatsApp messages. Staff contact
  customers themselves; customers check progress on the tracking page.
- **Cancelling an order does not restock it.** Adjust the quantity in the Products tab.
- **Sample content.** Products, prices, stock, contact details and About text are placeholders.
  Product pictures are illustrations drawn for this project, not photos of real stock.
- **One admin role.** The `users` table has a `staff` role, but only `admin` is used.
- **No device market prices.** The sell form records the customer's asking price only; it does
  not suggest a valuation.
- **Uploads are stored on the server's disk**, which suits a single server but not every host.
- **Admin lists show the latest 200 records** per tab; older ones are reached through search.
- Brand lists and pickup time windows appear in both a client config file and a server validator,
  and must be changed together (each file says so in a comment).

## Possible future improvements

- Payment provider integration as a step after the order is created.
- Email / WhatsApp notifications when a status changes.
- Product image upload from the dashboard (currently a path is typed in).
- Restock automatically when an order is cancelled.
- Staff accounts with limited permissions, and a password-change screen.
- Pagination for long lists, and frontend component tests.

## Troubleshooting

| Problem                                             | Fix                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `JWT_SECRET is not set`                             | Create `server/.env` from `.env.example` and fill in `JWT_SECRET`.                    |
| `Database setup failed: MySQL rejected the login`   | Check `DB_USER` / `DB_PASSWORD` in `server/.env`.                                     |
| `MySQL is not reachable`                            | Start the MySQL service; check `DB_HOST` / `DB_PORT`.                                 |
| Shop says "temporarily unavailable"                 | The API cannot reach MySQL, or `npm run db:setup` has not been run. See the API terminal. |
| Pages load but nothing saves / "Could not reach the server" | The API is not running. Start it with `npm run dev`.                          |
| Cannot sign in to `/admin`                          | Run `npm run db:setup` after setting `ADMIN_EMAIL` and `ADMIN_PASSWORD`. An existing account's password is not overwritten — use `db:reset` (deletes all data) or update the hash manually. |
| Port 4000 or 5173 already in use                    | Stop the other program, or change `PORT` in `.env` (and the proxy in `client/vite.config.js`). |

More detail on how each part works is in [docs/CODE_GUIDE.md](docs/CODE_GUIDE.md).
