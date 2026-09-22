# FastStore API

## Configuration and startup

Copy `.env.example` to `.env` only for a new installation. Existing `.env` files should be updated rather than overwritten. Set separate, random `JWT_SECRET` and `JWT_REFRESH_SECRET` values (at least 32 random bytes each), `MONGO_URI`, and `CLIENT_URL`. `CORS_ORIGINS` is an optional comma-separated allowlist. Vite at localhost:5173 is supported.

`npm start` loads backend/.env exactly once, validates required variables, connects to MongoDB, then listens on PORT (default 5500). `npm run dev` uses nodemon. Optional Stripe, mail and SMS credentials are checked when their features are used. `/health/live` checks the process and `/health/ready` checks MongoDB connectivity.

## Session contract

- POST `/api/auth/login`: `{ email, password }`. Accounts must be email-verified. Returns a safe user summary and sets accessToken (one hour) and refreshToken (seven days) HttpOnly, SameSite=Lax cookies. Cookies require HTTPS in production.
- POST `/api/auth/refresh`: sends the refresh cookie, rotates it atomically, and issues a new access cookie. Clients should serialize refresh requests.
- POST `/api/auth/logout`: revokes the database session and clears cookies.
- GET `/api/auth/check-session`: validates the access JWT and stored session; expired access returns 401, allowing the client to refresh.
- PUT `/api/password/reset/password`: `{ currentPassword, newPassword, confirmPassword }`. Password changes and recovery revoke existing sessions.

Use `credentials: "include"` or Axios `withCredentials: true`. The frontend and API should share a site in production because cookies use SameSite=Lax. There is one active session per account; a new login revokes the previous session. Legacy storeSession cookies no longer authenticate.

Customer is the default role. Administrative catalog operations, global customer/order/cart lists, notification creation and SMS require a database-assigned Admin role. Registration and profile editing cannot promote users. Assign the first administrator through an authenticated database administration session, not an HTTP request.

## Shopping API changes

- PATCH `/api/cart/quantity`: `{ productId, quantity }`.
- POST `/api/wishlist/add-to-wishlist`: `{ productId }`; DELETE `/api/wishlist` takes the catalog productId too.
- PUT/DELETE `/api/address/:id`: operate on the authenticated user's selected address. A single defaultAddressId on the user selects the default address. The older `/update` and `/delete` paths accept `addressId` in the body.
- PATCH `/api/notifications/:id/read`: marks an owned notification read.
- Product creation/update uses name, currentPrice, originalPrice, quantity, category, description, image, reviews, and newArrival. No title/price aliases.
- List endpoints accept page and limit (1–100). Empty customer lists return arrays or `{ products: [] }` as appropriate.

## Payments and MongoDB deployment

Checkout requires a MongoDB replica set (a single-node replica set works locally) because stock reservation and settlement use transactions. A standalone mongod supports authentication and browsing but cannot execute checkout transactions. Configure the replica set before payment integration; no database configuration is changed by this code update.

POST `/api/checkout/create-checkout-session` requires an Idempotency-Key header (16–100 letters/digits/underscores/hyphens) and `{ items: [{ productId, quantity }], addressId, source: "cart" | "buy-now" }`. Reuse a key for retries of exactly the same purchase. Prices are resolved from the database; stock is reserved transactionally. Orders include a shipping-address snapshot. Checkout currently supports card payments only.

Configure Stripe webhook events checkout.session.completed and checkout.session.expired to POST `/api/webhook`. The raw body is signature-verified. Paid settlement and expired reservation releases are idempotent. A minute-based reconciliation loop checks overdue reservations against Stripe before releasing stock, including lost session-creation responses. A canceled checkout holds its reservation until expiry (approximately one hour). SMTP is at-least-once: an ambiguous delivery failure can result in a duplicate email, but stock and cart mutations are not repeated.

The frontend still needs /success, /account-verification and /password/reset pages and integration with this API. Existing static Vite previews do not implement these flows.

## Existing data and indexes

No live data is migrated automatically. Back up and inspect existing data before deployment:

1. User documents without role default to Customer; users must verify email before login. New secret/session fields are optional. Normalize legacy email casing and resolve collisions before relying on case-normalized login.
2. Legacy wishlist snapshots have no productId. Rebuild their references after identifying the corresponding products, or ask users to re-add them. Do not guess product identities from names without review.
3. Remove duplicate carts per user, wishlists per user, product names and (product, type) promos before creating their new unique indexes.
4. The old addresses.email unique index must be dropped explicitly; removing unique from a Mongoose schema does not remove an existing database index.
5. Create the product name/description text index and the new unique indexes using a reviewed database migration. In production, do not rely on automatic index creation. Existing legacy orders remain readable; automatic reconciliation targets only new reserved orders.

The application does not run syncIndexes or delete existing data. Database migrations and real Stripe/SMTP/Twilio checks are deployment tasks, not performed by the unit tests.

## Tests and operational limits

Run `npm test`. Tests mock external services and database operations; no emails, SMS messages or payments are sent. Rate limits are in-process; configure shared throttling at the gateway for multi-instance deployment. Configure proxy trust only for your actual reverse-proxy topology before relying on client IPs behind it.
