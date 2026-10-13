# Code Guide

This guide explains how TechFix works so you can explain it, change it and debug it yourself.
Read it with the code open. Every file also starts with a comment saying what it is for.

**Contents**

1. [The big picture](#1-the-big-picture)
2. [Follow one request from click to database](#2-follow-one-request-from-click-to-database)
3. [The frontend, file by file](#3-the-frontend-file-by-file)
4. [The backend, file by file](#4-the-backend-file-by-file)
5. [The database](#5-the-database)
6. [Security decisions and why](#6-security-decisions-and-why)
7. [How to change things](#7-how-to-change-things)
8. [Common errors and how to debug them](#8-common-errors-and-how-to-debug-them)
9. [Questions you may be asked](#9-questions-you-may-be-asked)
10. [Small changes to practise](#10-small-changes-to-practise)

---

## 1. The big picture

There are three programs:

```
Browser (React app)  ──HTTP/JSON──▶  Express API  ──SQL──▶  MySQL
   client/                             server/                database/
   port 5173 in development            port 4000
```

- The **React app** draws the pages and holds what the user is typing. It knows nothing about SQL.
- The **Express API** is the only thing allowed to talk to the database. It checks every request,
  runs the SQL and replies with JSON.
- **MySQL** stores the data.

In development, Vite serves the React app on port 5173 and **proxies** any request starting with
`/api` to Express on port 4000 (`client/vite.config.js`). That is why frontend code can simply call
`fetch('/api/products')`.

The backend is layered. A request passes through these in order:

```
routes/  →  middleware/  →  controllers/  →  validators/  →  models/  →  MySQL
(which URL)  (rate limit,     (orchestrate)    (is the data     (the SQL)
              upload, auth)                     acceptable?)
```

Each layer has one job. That is the answer to "why so many folders?": when something breaks you
know where to look. Wrong URL → routes. Rejected input → validators. Wrong data saved → models.

---

## 2. Follow one request from click to database

The best way to understand the project is to trace the repair form once.

**Step 1 — the user types.** `client/src/pages/RepairsPage.jsx` calls `useForm(INITIAL_VALUES)`.
`useForm` (`hooks/useForm.js`) keeps one object, `values`, holding every answer. Each input has a
`name`; `handleChange` copies `event.target.value` into `values[name]`. This pattern is called a
*controlled input*: React state is the single source of truth, and the input just displays it.

**Step 2 — submit.** `handleSubmit` runs:

```js
event.preventDefault();            // stop the browser reloading the page
const foundErrors = validate(values);
setErrors(foundErrors);
if (Object.keys(foundErrors).length > 0) { scrollToFirstError(foundErrors); return; }
```

`validate` returns an object such as `{ deviceModel: 'Device model is required.' }`. Each field
component shows `errors[name]` underneath itself.

**Step 3 — send.** `buildRequest(values)` reshapes the form state into what the API expects (for
example it leaves the pickup fields out for a drop-off). Then:

```js
const result = await submitRepair(request, image[0]);
```

`submitRepair` is in `api/services.js`. It calls `api.postForm` in `api/client.js`, which builds a
`FormData` with the answers as one JSON string in a field called `data`, plus the photo. FormData
is used instead of plain JSON because files cannot be sent as JSON.

**Step 4 — the server receives it.** `server/src/routes/publicRoutes.js`:

```js
router.post('/repairs', submissionLimiter, uploadRepairImage, verifyUploadedImages, createRepair);
```

Read it left to right. Each function is *middleware*: it does one job, then passes the request on.

1. `submissionLimiter` — refuses a visitor who submits too often.
2. `uploadRepairImage` — multer saves the photo into `server/uploads` under a random name.
3. `verifyUploadedImages` — opens the file and checks its first bytes really are a JPG/PNG/WebP.
4. `createRepair` — the controller.

**Step 5 — the controller** (`controllers/repairController.js`):

```js
const { errors, value } = validateRepairRequest(readFormData(req));
if (hasErrors(errors)) throw new ValidationError(errors);
const repair = await repairModel.createRepair({ ...value, imagePath: req.file ? req.file.filename : null });
res.status(201).json({ reference: repair.reference, statusLabel: ... });
```

The server validates **again**. The browser check in step 2 is for convenience; this one is for
safety, because anybody can send a request to the API without using the website at all.

**Step 6 — the model** (`models/repairModel.js`) generates a reference such as `REP-7KQ2M9XA`,
then inside one **transaction** inserts the repair row and its first `status_history` row. A
transaction means both inserts succeed or neither does.

**Step 7 — the reply.** The controller answers `201 Created` with the reference. Back in the
browser, `setConfirmation(...)` makes `RepairsPage` render the `<Confirmation>` screen instead of
the form.

**If anything fails**, the code simply `throw`s. Express 5 forwards the error to
`middleware/errorHandler.js`, which turns it into a JSON reply with the right status code and
deletes any photo that was uploaded. In the browser, `api/client.js` turns a failed reply into an
`ApiError`, and the page's `catch` block shows `error.message` and `error.fieldErrors`.

Every other form (sell, checkout, contact) follows exactly these steps.

---

## 3. The frontend, file by file

### Entry and routing

| File | What it does |
| --- | --- |
| `index.html` | The one HTML page. React draws inside `<div id="root">`. |
| `src/main.jsx` | Starts React. Wraps the app in `BrowserRouter` (URLs) and `CartProvider` (cart). |
| `src/App.jsx` | The route table: which page component is shown for which URL. |
| `components/layout/Layout.jsx` | Navbar + current page (`<Outlet />`) + footer. Scrolls to top on navigation. |

### Config (the files to edit when the business changes)

| File | What it holds |
| --- | --- |
| `config/site.js` | Brand name, contact details, hours, navigation links. |
| `config/content.js` | Homepage benefits and service cards, About page text. |
| `config/repairOptions.js` | Brands, models, hardware issues, iOS/Android software issues. |
| `config/sellOptions.js` | Options for the sell form. |
| `config/categoryIcons.js` | Which icon each product category uses. |
| `config/uploads.js` | Allowed photo types and sizes. |

### Talking to the API

- `api/client.js` — `request()` wraps `fetch`. It adds the JSON header, catches network failures and
  throws an `ApiError` (with `status` and `fieldErrors`) for any non-OK reply. Because of this,
  pages only ever need `try { ... } catch (error) { ... }`.
- `api/services.js` — one named function per endpoint (`getProducts`, `submitOrder`, ...). Pages
  import these and never write a URL themselves.

### State

- `hooks/useForm.js` — holds `values` and `errors` for a form. `setField` also clears that field's
  error, so a message disappears as soon as the user starts fixing it.
- `hooks/useCatalogue.js` — loads one shop section's categories and products. Note the `isCurrent`
  flag: if the user leaves the page before the data arrives, the result is ignored instead of
  updating a component that no longer exists. `filterProducts` narrows the list in the browser.
- `context/cartReducer.js` — the cart rules as a **pure function**: `(items, action) → newItems`.
  It never modifies the old array; it returns a new one. `clampQuantity` keeps quantities between 1
  and the stock available.
- `context/CartContext.jsx` — puts the cart in React Context so any component can call `useCart()`.
  A `useEffect` saves the cart to `localStorage` after every change, and `loadSavedCart` restores it
  on page load — that is how the cart survives a refresh.

### Components

| Folder | Contents |
| --- | --- |
| `components/ui/` | `Field.jsx` (label + input + error), `Choices.jsx` (chips, option cards, radio pills), `Feedback.jsx` (alerts, spinner, submit button), `ProgressSteps.jsx`, `Logo.jsx` |
| `components/forms/` | `CustomerFields.jsx` (name/phone/email block), `ImageUpload.jsx`, `Confirmation.jsx` |
| `components/shop/` | `ProductCard.jsx`, `ShopParts.jsx` (search box, grid, loading/empty/error states), `CartItemRow.jsx` |
| `components/admin/` | `RecordsTab.jsx`, `RecordDetail.jsx`, `ProductsTab.jsx`, `MessagesTab.jsx`, `Modal.jsx`, `recordConfig.js` |
| `components/art/` | `PhoneArt.jsx` — the phone illustrations, drawn in SVG |

Two ideas worth understanding:

- **One generic component, three uses.** `RecordsTab` shows repairs, orders *and* sell enquiries.
  It receives `resource="repairs"` and looks up the columns and details in `recordConfig.js`.
  Adding a column is a one-line change in that config.
- **Conditional rendering.** The pickup fields are not hidden with CSS — they do not exist unless
  `values.serviceMethod === 'pickup'`. The same check decides whether `validate()` requires them.

### Styling

Tailwind CSS: instead of writing a CSS file per component, you put small utility classes on the
element (`flex`, `gap-4`, `text-sm`, `lg:grid-cols-4`). A prefix such as `sm:`, `md:` or `lg:`
means "from this screen width upwards", which is how the responsive layout works — styles are
written for phones first, then widened.

`src/styles/index.css` holds the two things that should not be repeated:

- `@theme` — the colour palette and font. `--color-brand-500` creates `bg-brand-500`,
  `text-brand-500` and so on.
- `@layer components` — shared classes like `.btn`, `.btn-primary`, `.input`, `.card`.

---

## 4. The backend, file by file

| File | What it does |
| --- | --- |
| `src/index.js` | Starts the server and reports whether MySQL is reachable. |
| `src/app.js` | Builds the Express app: security headers, JSON parsing, routes, error handler. Separate from `index.js` so tests can load the app without opening a port. |
| `config/env.js` | Reads `server/.env` once into one `env` object. |
| `config/statuses.js` | Every status: `code` (stored), `label` (shown), `step` (progress-bar position). |
| `db/pool.js` | The MySQL connection pool, `query()` and `withTransaction()`. |
| `db/setup.js` | `npm run db:setup` — creates the database, tables, sample data and admin. |
| `routes/*.js` | Maps URLs to middleware and controllers. |
| `controllers/*.js` | One function per endpoint: validate → call the model → send JSON. |
| `validators/*.js` | Return `{ errors, value }` for each kind of submission. |
| `models/*.js` | All SQL. Each has a `map...()` function converting `snake_case` columns to `camelCase` JSON. |
| `middleware/auth.js` | Signs the login cookie; `requireAdmin` verifies it. |
| `middleware/upload.js` | multer configuration and the image-signature check. |
| `middleware/rateLimits.js` | Request limits for login, tracking and form submissions. |
| `middleware/errorHandler.js` | Converts any thrown error into a JSON response. |
| `utils/reference.js` | Generates and parses reference numbers. |
| `utils/validation.js` | `readText`, `readChoice`, `readNumber`, `readCustomer` building blocks. |
| `utils/tracking.js` | Contact matching and progress calculation for the tracking page. |

### Things worth being able to explain

**Parameterised queries.** SQL and values always travel separately:

```js
query('SELECT * FROM orders WHERE reference = ?', [reference]);
```

The `?` is filled in by the database driver, so user input can never become part of the SQL
command. That is the defence against SQL injection. The few places where SQL text is built in
JavaScript (`buildListFilter`, `changeStatus`) only use column and table names from our own code.

**Transactions and stock** (`models/orderModel.js`). Placing an order must (1) check stock,
(2) insert the order, (3) insert its items and (4) reduce stock — all or nothing. The products are
selected with `FOR UPDATE`, which locks those rows until the transaction ends. If two customers buy
the last item at the same moment, the second waits, then sees stock of 0 and gets a clear message.

**Prices come from the database.** Checkout sends only `{ productId, quantity }`. The server looks
up each price itself, so nobody can lower a price by editing the request in their browser.

**Money is added in cents.** `0.1 + 0.2` in JavaScript is `0.30000000000000004`, so totals are
computed in whole cents (`toCents`) and divided by 100 at the end.

**Reference numbers.** Eight random characters from an alphabet without `0/O` and `1/I`, using
`crypto.randomInt` so they cannot be predicted. The database column is `UNIQUE`; in the tiny chance
of a clash, `withUniqueReference` catches `ER_DUP_ENTRY` and tries again.

---

## 5. The database

`database/schema.sql` defines eleven tables.

```
users                    admin logins (bcrypt password_hash)
categories ─┐            section = accessories | electronics
products ───┤            category_id → categories
inventory ──┘            product_id → products, one row per product
repair_requests          hardware_issues / software_issues stored as JSON arrays
sell_enquiries           asking_price (customer) and proposed_offer (business)
sell_enquiry_photos      enquiry_id → sell_enquiries
orders
order_items              order_id → orders, product_id → products
status_history           every status change, for repairs, orders and enquiries
contact_messages
```

Design decisions:

- **`inventory` is separate from `products`.** Catalogue details change rarely; stock changes on
  every order and is the row that gets locked during checkout.
- **`order_items` copies `product_name` and `unit_price`.** An old order must keep showing what the
  customer agreed to, even after the product is renamed or re-priced.
- **Products are deactivated, never deleted** (`is_active = 0`), because old orders refer to them.
  The foreign key from `order_items` would refuse the delete anyway.
- **`status_history` is shared** by three tables through `record_type` + `record_id`. The trade-off
  is that `record_id` cannot be a real foreign key; the benefit is one history table and one set of
  code instead of three.
- **Constraints back up the code**: `UNSIGNED` stock can never go negative, `CHECK (price >= 0)`,
  `UNIQUE` references, and `ENUM` columns for fixed choices.
- **Statuses are `VARCHAR` codes**, not `ENUM`, so a new status can be added in
  `config/statuses.js` without a database change.

---

## 6. Security decisions and why

| Risk | What the project does |
| --- | --- |
| SQL injection | Parameterised queries everywhere. |
| Stolen passwords | Only a bcrypt hash is stored (`setup.js`); `bcrypt.compare` checks logins. |
| Guessing passwords | Login is rate-limited; unknown email and wrong password give the same message and take the same time. |
| Someone opening `/admin` | The page is only a shell. `router.use(requireAdmin)` in `adminRoutes.js` protects **every** admin API route on the server. |
| Stolen login token | The JWT is in an `httpOnly` cookie, so page JavaScript (including injected scripts) cannot read it. |
| CSRF | The cookie is `sameSite: 'strict'`, so other websites cannot make requests with it. |
| Guessing reference numbers | Tracking needs the reference **and** the booking's phone/email, is rate-limited, gives one message for "not found" and "wrong contact", and returns no personal data. |
| Malicious uploads | Type whitelist, 5 MB limit, file-signature check, random file names, and files are only served to signed-in admins. |
| Tampered prices | The server looks prices up itself. |
| Secrets on GitHub | Everything sensitive is in `server/.env`, which is ignored by Git. |
| Leaking internals | The error handler logs the detail on the server and sends visitors a generic message. |

A point that often comes up: **why validate in both places?** Browser validation gives instant
feedback and saves a round trip. Server validation is the real protection, because the browser can
be bypassed with a tool like Postman or curl. Neither replaces the other.

---

## 7. How to change things

**Text and business details** — `client/src/config/site.js` and `config/content.js`.

**Colours** — edit the `--color-brand-*` and `--color-navy-*` values in the `@theme` block of
`client/src/styles/index.css`. Every button, link and icon follows.

**Layout** — open the page in `client/src/pages/`. For example, to show four products per row on
large screens, change `lg:grid-cols-3` to `lg:grid-cols-4` in `ProductGrid`
(`components/shop/ShopParts.jsx`).

**Add a repair issue** — add a line to `HARDWARE_ISSUES` or `SOFTWARE_ISSUES` in
`config/repairOptions.js`. Nothing else: the server stores the label as written.

**Add a brand or model** — add to `DEVICE_BRANDS` in the same file.

**Add a product** — sign in at `/admin` → Products → Add product. For a picture, put the file in
`client/public/images/products/` and enter `/images/products/your-file.jpg` as the image path.

**Add a status** — add `{ code, label, step }` to the right list in
`server/src/config/statuses.js`. The admin dropdown and the tracking page update automatically.

**Add a field to a form** (the full path, using a "colour" field on the repair form as the example):

1. `database/schema.sql` — add the column (`device_colour VARCHAR(40) NULL`) and apply it to your
   database (`ALTER TABLE ...`, or `npm run db:reset` in development).
2. `server/src/validators/repairValidator.js` — read it:
   `deviceColour: readText(input, 'deviceColour', errors, { label: 'Colour', max: 40 })`.
3. `server/src/models/repairModel.js` — add it to the `INSERT` (column, `?`, value) and to
   `mapRepair`.
4. `client/src/pages/RepairsPage.jsx` — add it to `INITIAL_VALUES`, to `buildRequest`, and add a
   `<TextField name="deviceColour" ... />`.
5. `client/src/components/admin/recordConfig.js` — add a row to `repairDetails` so staff see it.

**Add a page** — create `client/src/pages/YourPage.jsx`, add a `<Route>` in `App.jsx`, and add a
link in `navLinks` (`config/site.js`) if it belongs in the menu.

**Add an API endpoint** — write the SQL in a model, the handler in a controller, register the URL
in `routes/`, and add a function for it in `client/src/api/services.js`.

---

## 8. Common errors and how to debug them

Start with **where** the problem is:

1. **Browser → DevTools (F12) → Console.** A red error with a file and line number is a frontend bug.
2. **DevTools → Network tab.** Click the `/api/...` request. Look at the status code, the *Payload*
   you sent and the *Response* you got back.
3. **The terminal running the API.** Server-side errors are printed there in full.

| Status | Meaning | Look at |
| --- | --- | --- |
| 400 | The request was rejected by validation | The `errors` object in the response; the matching validator |
| 401 | Not signed in / session expired | Sign in again; `middleware/auth.js` |
| 403 | Signed in but not an admin | The `role` column in `users` |
| 404 | Wrong URL, or the record does not exist | `routes/`, and the `:id` you sent |
| 409 | Stock changed during checkout | Expected; the message names the product |
| 429 | Too many requests | `middleware/rateLimits.js` — wait, or raise the limit while developing |
| 500 | A bug on the server | The API terminal shows the stack trace |
| 503 | The database is unreachable or not set up | `.env` DB settings, MySQL service, `npm run db:setup` |

Specific cases:

- **`ER_NO_SUCH_TABLE`** — the tables were not created. Run `npm run db:setup`.
- **`Unknown column ...`** — the schema changed but your database did not. Apply the change with
  `ALTER TABLE`, or run `npm run db:reset` (deletes all data).
- **`Incorrect arguments to mysqld_stmt_execute`** — a query parameter is `undefined` or the wrong
  type. Check that the number of `?` matches the array and that no value is `undefined` (use `null`).
- **The page is blank** — a component threw while rendering. The browser console names it. A common
  cause is reading a property of `undefined`, e.g. `product.name` before the data has loaded.
- **An input will not accept typing** — it has a `value` but its `name` does not match a key in
  `INITIAL_VALUES`, or `onChange` is missing.
- **A change does not appear** — check you saved the file, that the right server is running, and
  hard-refresh (Ctrl+Shift+R). Changes to `.env` need the API restarted.
- **Tailwind class does nothing** — check the spelling; an unknown class is silently ignored.
- **Cart shows old prices** — the cart lives in `localStorage`. Opening the cart page re-syncs it.
  To wipe it: DevTools → Application → Local Storage → delete `techfix-cart`.

A useful habit: add `console.log(values)` in the page or `console.log(req.body)` in the controller
to see exactly what is being sent and received, then remove it.

---

## 9. Questions you may be asked

**Why React, Express and MySQL?** A component-based frontend keeps the many forms manageable;
Express is small and makes the request flow easy to follow; the data is relational (orders have
items, items refer to products), which is what a relational database with foreign keys is for.

**How does the frontend talk to the backend?** `fetch` calls to `/api/...` returning JSON, all
going through `api/client.js`. In development Vite proxies them to Express.

**What happens if the database goes down?** Requests fail in the model, the error handler recognises
the connection error and replies `503` with a friendly message. The site never claims something was
saved when it was not — there is an automated test for exactly that.

**How do you stop two people buying the last item?** A transaction with `SELECT ... FOR UPDATE`
locks the stock rows while the order is checked and saved.

**Where are passwords stored?** They are not. Only a bcrypt hash is stored, and bcrypt is slow on
purpose, which makes guessing expensive.

**Why a cookie instead of localStorage for the login token?** An `httpOnly` cookie cannot be read
by JavaScript, so a script-injection attack cannot steal it.

**Why is validation duplicated?** See section 6 — convenience in the browser, safety on the server.

**What would you improve next?** See "Known limitations" in the README: payments, notifications,
restocking cancelled orders, image upload for products, pagination.

**What was hard?** Good honest answers from this codebase: making the pickup fields required only
for pickup in *both* the browser and the server; keeping the cart consistent with changing stock;
and showing tracking progress without exposing private details.

---

## 10. Small changes to practise

The brief says you may be asked to make a small change live. Try these first, in order:

1. Change the hero tagline (`config/site.js`).
2. Change the accent colour to green (`styles/index.css`, `@theme`).
3. Add "Screen Flickering" to the hardware issues (`config/repairOptions.js`).
4. Add a "Nokia" brand with two models (`config/repairOptions.js`).
5. Show four product cards per row on large screens (`components/shop/ShopParts.jsx`).
6. Add a new repair status "Awaiting Payment" (`server/src/config/statuses.js`).
7. Make the phone number optional on the contact form — already optional; make it *required*
   instead, in both `ContactPage.jsx` and `validators/miscValidators.js`.
8. Add a test: a repair request with an 81-character model is rejected (`tests/validators.test.js`).
9. Add the "device colour" field described in section 7, end to end.
10. Add a `GET /api/products/:id` endpoint and a product detail page.

If you can do number 9 without looking at this guide, you understand the whole request path.
