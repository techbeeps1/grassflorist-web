# Implementation Plan: Laravel Backend Integration with Next.js Storefront

This document tracks the phased migration of the **Grass Florist** Next.js frontend from WordPress/WooCommerce to the **Laravel 12 REST API Backend** (`http://127.0.0.1:8000/api`).

---

## 🎯 Strict Constraints
1. **Zero Design Change:** Layout, styling, Tailwind classes, typography, animations, and UI components remain 100% untouched.
2. **Zero Backend Changes Without Explicit Permission:** Only frontend files were modified. No changes to `backend/` without user confirmation.
3. **Full Bilingual Support:** Seamless support for Arabic (`ar`, RTL) and English (`en`, LTR) with `X-Locale` headers and data adapters.
4. **RTK Query Caching:** Smart tag invalidation (`Product`, `Category`, `Cart`, `Order`, `Auth`, `Wishlist`, `HomePage`, `PaymentMethods`, `DeliverySlots`, `Settings`, `Cms`).
5. **Secure Authentication:** JWT token handling, Bearer authorization, persistent session, auto-logout on 401.

---

## 📅 Phases Progress & Status

- [x] **Phase 1: Environment & API Base Setup (RTK Query Core)**
  - [x] Created `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` & `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000`
  - [x] Added `127.0.0.1` & `localhost` to `next.config.ts` `images.remotePatterns`
  - [x] Implemented production `baseApi.ts` with `fetchBaseQuery`, dynamic JWT `Authorization` header, `X-Locale` header, tagTypes
  - [x] Tested with `npm run type-check` (Exit code: 0)

- [x] **Phase 2: Secure Customer Authentication Module**
  - [x] Implemented `authApi.ts` with real endpoints:
    - `POST /v1/login`
    - `POST /v1/register`
    - `GET /my-account/checkauth`
    - `GET /my-account/user`
    - `POST /my-account/logout`
    - `POST /my-account/passwordchange`
    - `POST /v1/updateuser`
    - `GET /my-account/view-address/{user_id}`
    - `GET /my-account/user_order/{user_id}`
  - [x] Bound with `authSlice.ts` (token storage, login, logout, rememberMe)
  - [x] Tested with `npm run type-check` (Exit code: 0)

- [x] **Phase 3: Catalog & Dynamic Home Page Integration**
  - [x] Implemented `homeApi.ts` (`GET /home-page`) with RTK Query caching
  - [x] Updated `getHomePageData(locale)` in `store-api.ts` to call Laravel `GET /home-page` with bilingual mapping
  - [x] Connected `getStoreCategories(locale)` to Laravel `GET /category`
  - [x] Connected `getStoreProducts(params)` to Laravel `GET /products`, `GET /category/{slug}`, `GET /search`
  - [x] Connected `getStoreProductBySlug(slug)` to Laravel `GET /products/{slug}`
  - [x] Tested with `npm run type-check` (Exit code: 0)

- [x] **Phase 4: Dynamic Cart Module (RTK Query + Server Session Sync)**
  - [x] Implemented persistent browser `session_id` generator/retriever (`getCartSessionId`)
  - [x] Implemented `cartApi.ts` with real endpoints:
    - `GET /cart/viewcart`
    - `POST /cart/add`
    - `POST /cart/cartupdate`
    - `POST /cart/remove`
    - `GET /cart/empty`
    - `POST /cart/sync-customer`
    - `GET /cart/coupons`
    - `POST /cart/coupon/{coupon_code}`
  - [x] Connected `cartSlice.ts` (`syncWithServerCart`), `CartPageView.tsx`, `CartDrawer.tsx`, `ProductDetailPageView.tsx`, `ProductCard.tsx` to server mutations
  - [x] Tested with `npm run type-check` (Exit code: 0)

- [x] **Phase 5: Dynamic Checkout & Order Pipeline**
  - [x] Implemented `checkoutApi.ts`:
    - `GET /v1/payment-methods` (HyperPay, Tabby, Tamara, Mada, Apple Pay, COD)
    - `GET /v1/delivery-slots?date=YYYY-MM-DD` (Friday vs Regular + cutoffs)
    - `POST /v1/payments/initiate`
    - `POST /v1/payments/verify`
  - [x] Updated `ordersApi.ts` to call real `POST /cart/checkout` and `GET /orders/{orderNumber}`
  - [x] Integrated dynamic delivery slots and payment methods in `CheckoutPageView.tsx`
  - [x] Tested with `npm run type-check` (Exit code: 0)

- [x] **Phase 6: Wishlist, My Account Orders & CMS Pages**
  - [x] Implemented `wishlistApi.ts` (`GET /my-account/view-wishlist`, `POST /my-account/add-wishlist`, `DELETE /my-account/delete-wishlist`)
  - [x] Connected `ProductCard.tsx` wishlist toggle to server mutation
  - [x] Implemented `cmsApi.ts` (`/global-settings`, `/contact-page`, `/contact-form`, `/newsletter`, `/cms-pages/{slug}`)
  - [x] Verified full project TypeScript compile with `npm run type-check` (Exit code: 0)
