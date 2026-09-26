# Vendly — Production Release Foundation

Vendly is a premium Nigerian e-commerce application built with Next.js, React, TypeScript, Tailwind CSS, Prisma and PostgreSQL.

## Final stack
- Next.js + React + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL / Neon
- Cloudinary for product image/video delivery
- Paystack for NGN payments
- Vercel-ready deployment
- GitHub-ready source tree

## Final customer experience
- Premium responsive storefront
- Shop discovery, search, category filtering and sorting
- Product detail pages with image-first media
- Optional category/shop listing video previews using the product image as poster
- Persistent cart
- Persistent wishlist
- Customer registration and sign-in
- Customer profile
- Customer order history
- Public order tracking
- Secure checkout and payment confirmation
- Customer service contact form + WhatsApp support
- Loading, empty, error and not-found states
- Privacy and terms pages
- SEO metadata, dynamic sitemap and robots rules
- Mobile-first interaction and reduced-motion/accessibility refinements

## Final admin operations
- Protected admin workspace
- Product catalogue management
- Cloudinary signed image/video uploads
- Category management
- Inventory management and audit trail
- Low-stock visibility
- Order management and controlled fulfilment transitions
- Cancellation stock restoration
- Customer directory
- Customer inbox
- Analytics and top-product view
- Order CSV export
- Administrative activity/audit log
- Production configuration checklist

## Security and reliability
- HTTP-only customer/admin session cookies
- Password hashing with Node `scrypt`
- Timing-safe password/session signature comparisons
- Basic public endpoint rate limiting
- Server-side product price calculation
- Server-side stock validation and atomic stock decrement
- Payment amount derived from the stored order, not the browser
- Paystack server-side verification
- Paystack signed webhook verification
- Payment currency/email/amount validation
- API no-store response headers
- Security headers including HSTS in production
- Admin order status transition rules
- Inventory restoration when an order is cancelled
- Audit records for important admin/order/product actions

## Environment
Copy `.env.example` to `.env.local` and provide real values before deployment.

Required production services:
1. PostgreSQL database
2. Paystack live secret/public keys and webhook
3. Cloudinary cloud name/API key/API secret
4. Strong admin credentials and session/auth secrets
5. Real WhatsApp number
6. Production application URL

Never commit `.env.local`, payment keys, Cloudinary secrets or administrator credentials.

## Local setup
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Before production:
```bash
npm run typecheck
npm run build
```

The sandbox used for this build could not reliably finish `npm install`, so a full Next.js build is intentionally not represented as passed here. Run the commands above on the development/deployment machine after dependencies are installed.

## Fixes applied in this revision

A review found the storefront pages were reading from a hardcoded demo
product list (`lib/products.ts`) instead of the live database, which meant
products added in the admin panel never appeared to customers and checkout
would fail once a real database was connected (cart items used demo IDs that
don't exist in Postgres). The following was corrected:

1. **Storefront wired to the database.** Added `lib/catalog.ts` as the single
   source of truth for live product/category data (Prisma-backed). The
   homepage, `/shop`, `/product/[slug]`, `/category/[slug]`, cart, checkout,
   and wishlist now all read from it — directly via Prisma in server
   components, or via the rewritten `/api/products` route (used by
   `components/useCatalog.ts`) in client components. `lib/products.ts` is now
   explicitly demo-only data, used solely as a local fallback in
   `/api/orders` when no `DATABASE_URL` is set.
2. **Fixed a duplicate `rateLimit` import** in `app/api/orders/route.ts` that
   would have failed the TypeScript compile (`npm run build`).
3. **Removed the guessable default session secrets.** `ADMIN_SESSION_SECRET`
   and `AUTH_SECRET` previously fell back to the literal string
   `'change-this-in-production'` if left unset — since this is boilerplate
   anyone can read, an unset var in production meant admin/customer sessions
   could be forged. Both now throw at request time in production if unset,
   so misconfiguration fails loudly instead of shipping a forgeable secret.
   Admin sessions also now expire after 12 hours (previously never expired).
4. **Fixed a pre-existing admin-login bug.** The admin session cookie stored
   the raw email address, and was parsed with `value.split('.')`. Real email
   addresses contain `.` (e.g. `admin@example.com`), which silently
   corrupted the parsed email/signature and made every admin login fail
   signature verification — the admin panel was effectively unusable. The
   email is now base64url-encoded before being stored in the cookie.

None of this was verified against a real `npm run build` (same sandbox
network limitation as the original build). Do run `npm install`,
`npm run typecheck`, and `npm run build` yourself before deploying — this
pass was a thorough manual/static review, not a substitute for a real build.

## Paystack webhook
Configure the production webhook URL as:
```text
https://YOUR_DOMAIN/api/paystack/webhook
```

The browser callback is not trusted as payment proof. Vendly verifies the transaction server-side and accepts signed `charge.success` webhook events only after amount/currency/customer checks.

## Cloudinary media
The admin product editor includes signed uploads. Images and optional videos are stored as secure Cloudinary URLs. Product videos are intentionally used as optional listing previews; products without video remain image-first.

## Release checklist
- [ ] Replace all demo catalogue content
- [ ] Add real product images/videos
- [ ] Configure production PostgreSQL
- [ ] Run Prisma push/migrations as appropriate for the chosen deployment workflow
- [ ] Configure Cloudinary
- [ ] Configure Paystack live keys and webhook
- [ ] Set strong admin/auth secrets
- [ ] Set the real WhatsApp number
- [ ] Run typecheck/build on the deployment environment
- [ ] Test registration/login/logout
- [ ] Test product creation and media upload
- [ ] Test stock decrement and cancellation restoration
- [ ] Test Paystack test-mode flow before live mode
- [ ] Test order tracking
- [ ] Test mobile/desktop journeys
- [ ] Connect the custom domain

## Project maturity
Phases 1–6 established the storefront, checkout, administration and commerce infrastructure. Phases 7–8 are the final production hardening, operational intelligence, accessibility/SEO polish and release-readiness pass. Feature development should stop here unless real client testing reveals a genuine business requirement.
