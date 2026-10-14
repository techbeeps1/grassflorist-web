# 🌐 Frontend API Endpoints Documentation

This document contains the complete and up-to-date catalog of all HTTP API endpoints integrated within the Grass Florist Next.js frontend (`/frontend`).

> [!NOTE]
> All storefront requests strictly use the URL language prefix: `/api/en/...` for English and `/api/ar/...` for Arabic (`/api/{locale}/...`).
> In local development mode (`NODE_ENV=development`), ISR caching is bypassed (`no-store`) to ensure instantaneous updates during coding.

---

## 📋 Table of Contents
1. [Catalog & Products](#1-catalog--products)
2. [Cart & Checkout](#2-cart--checkout)
3. [Customer Authentication & Account](#3-customer-authentication--account)
4. [Subscriptions Management](#4-subscriptions-management)
5. [Wishlist](#5-wishlist)
6. [Home & Navigation](#6-home--navigation)
7. [CMS & Content](#7-cms--content)
8. [Next.js Internal Route Proxies](#8-nextjs-internal-route-proxies)
9. [SEO & Crawler Routes](#9-seo--crawler-routes)

---

## 1. Catalog & Products

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/products` | `GET` | **5 Minutes (300s)** | `store-api.ts` (`getStoreProducts`), `productsApi.ts` (`useGetProductsQuery`) | Product catalog listing, category fallback filter, search fallback |
| `/api/{locale}/products/{slug}` | `GET` | **5 Minutes (300s)** + In-Memory Map | `store-api.ts` (`getStoreProductDetails`), `productsApi.ts` (`useGetProductBySlugQuery`) | Product details page (PDP), related products & bought-together |
| `/api/{locale}/category` | `GET` | **5 Minutes (300s)** | `store-api.ts` (`getStoreCategories`), `categoriesApi.ts` (`useGetCategoriesQuery`) | Category sliders, mega menus, category grids |
| `/api/{locale}/category/{slug}` | `GET` | **5 Minutes (300s)** | `store-api.ts` (`getStoreCategoryBySlug`), `CategoryPageView.tsx` | Specific category page with child categories & product listings |
| `/api/{locale}/search?q={query}` | `GET` | **Realtime (0s)** | `store-api.ts` (`getStoreProducts`), Search Drawer | Live search query suggestions and search results |

---

## 2. Cart & Checkout

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/cart/viewcart` | `GET` | **Realtime (0s)** | `cartApi.ts` (`useViewCartQuery`), Cart Drawer, Cart Page, Header Counter | Live shopping cart contents, prices, discounts & session sync |
| `/api/{locale}/cart/add` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useAddToCartMutation`), Product Card, PDP Quick Add | Add product item to cart (standard or subscription) |
| `/api/{locale}/cart/cartupdate` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useUpdateCartQuantityMutation`), Cart Drawer, Cart Page | Increase, decrease, or set explicit quantity of an item |
| `/api/{locale}/cart/remove` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useRemoveCartItemMutation`), Cart Drawer, Cart Page | Delete specific product item from cart |
| `/api/{locale}/cart/empty` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useEmptyCartMutation`) | Clear all items from the current cart session |
| `/api/{locale}/cart/sync-customer` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useSyncCustomerCartMutation`), Auth slice | Associates guest cart items with the customer user account on login |
| `/api/{locale}/cart/merge` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useMergeCartMutation`), Post-login handler | Merges offline guest session items into the authenticated customer cart |
| `/api/{locale}/cart/coupons` | `GET` | **60 Seconds (60s)** | `cartApi.ts` (`useGetAvailableCouponsQuery`), Coupon drawer | Fetches list of active promotional coupons available for use |
| `/api/{locale}/cart/coupon/{code}` | `POST` | **0s (Realtime)** | `cartApi.ts` (`useApplyServerCouponMutation`), Checkout & Cart coupon input | Validates and applies coupon code to cart subtotal |
| `/api/{locale}/shipping-methods` | `GET` | **60 Seconds (60s)** | `checkoutApi.ts` (`useGetShippingMethodsQuery`), Checkout Page | Shipping tiers (Inside Jeddah, Express, Free shipping thresholds) |
| `/api/{locale}/v1/payment-methods` | `GET` | **60 Seconds (60s)** | `checkoutApi.ts` (`useGetPaymentMethodsQuery`), Checkout Page | Active payment gateways (Mada, Apple Pay, Visa, Tamara, Tabby, PayPal) |
| `/api/{locale}/v1/delivery-slots?date={YYYY-MM-DD}` | `GET` | **Realtime (0s)** | `checkoutApi.ts` (`useGetDeliverySlotsQuery`), Checkout step 2 | Live delivery slots, Friday timings, blocked dates & cutoff validations |
| `/api/{locale}/cart/checkout` | `POST` | **0s (Realtime)** | `ordersApi.ts` (`useCreateOrderMutation`), Checkout Step 4 | Finalizes order placement, recipient data, gift message & creates DB order |
| `/api/{locale}/orders/{orderNumber}` | `GET` | **60 Seconds (60s)** | `ordersApi.ts` (`useGetOrderByNumberQuery`), Order confirmation / Thank you view | Displays confirmed order summary, items, recipient info & payment status |
| `/api/{locale}/v1/payments/initiate` | `POST` | **0s (Realtime)** | `checkoutApi.ts` (`useInitiatePaymentMutation`), Checkout Payment button | Initializes payment session with gateway (HyperPay checkout ID, Tamara URL, etc.) |
| `/api/{locale}/v1/payments/verify` | `POST` | **0s (Realtime)** | `checkoutApi.ts` (`useVerifyPaymentMutation`), Payment return page | Verifies gateway payment status (HyperPay resource path, Tamara status, etc.) |

---

## 3. Customer Authentication & Account

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/v1/login` | `POST` | **0s** | `authApi.ts` (`useLoginMutation`), Login Modal & Auth Views | Customer login with email and password |
| `/api/{locale}/v1/register` | `POST` | **0s** | `authApi.ts` (`useRegisterMutation`), Register Modal & Auth Views | New customer signup with name, email, phone & password |
| `/api/{locale}/my-account/checkauth` | `GET` | **60 Seconds (60s)** | `authApi.ts` (`useCheckAuthQuery`), Route Guard | Validates JWT token and checks if user is logged in |
| `/api/{locale}/my-account/user` | `GET` | **60 Seconds (60s)** | `authApi.ts` (`useGetUserProfileQuery`), Account Profile Tab | Fetches customer profile, addresses, contact details & verification status |
| `/api/{locale}/v1/updateuser` | `POST` | **0s** | `authApi.ts` (`useUpdateProfileMutation`), Edit Profile Form | Updates customer name, phone, address, city & district |
| `/api/{locale}/my-account/logout` | `POST` | **0s** | `authApi.ts` (`useLogoutUserMutation`), Header Logout & Account Menu | Invalidates server JWT token and clears client state |
| `/api/{locale}/customer/forgot-password` | `POST` | **0s** | `authApi.ts` (`useForgotPasswordMutation`), Forgot Password Form | Sends password reset email link with localized template |
| `/api/{locale}/customer/reset-password` | `POST` | **0s** | `authApi.ts` (`useResetPasswordMutation`), Reset Password Page | Validates reset token and sets new customer password |
| `/api/{locale}/my-account/send-verification-email` | `POST` | **0s** | `authApi.ts` (`useSendVerificationEmailMutation`), Email Verify Notice | Dispatches email verification link to customer |
| `/api/{locale}/my-account/verify-email` | `POST` | **0s** | `authApi.ts` (`useVerifyEmailMutation`), Verify Email Landing Page | Marks customer email as verified via signed token |
| `/api/{locale}/my-account/passwordchange` | `POST` | **0s** | `authApi.ts` (`useChangePasswordMutation`), Security Tab | Changes customer password with current password confirmation |
| `/api/{locale}/my-account/user_order/{id}` | `GET` | **60 Seconds (60s)** | `authApi.ts` (`useGetUserOrdersQuery`), Account Orders Tab | Order history list with items, tracking statuses & invoices |
| `/api/{locale}/my-account/refresh` | `POST` | **0s** | `baseApi.ts` (Automatic Silent Refresh) | Silently refreshes expired JWT token in background without logging user out |

---

## 4. Subscriptions Management

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/subscription-plans` | `GET` | **60 Seconds (60s)** | `subscriptionApi.ts` (`useGetSubscriptionDealsQuery`), Subscription Landing | Curated flower subscription plans & curated packages |
| `/api/{locale}/subscription-plans/{slug}` | `GET` | **60 Seconds (60s)** | `subscriptionApi.ts` (`useGetSubscriptionDealBySlugQuery`), Plan Detail View | Subscription plan details, features, allowed frequencies & pricing |
| `/api/{locale}/subscriptions/settings` | `GET` | **60 Seconds (60s)** | `SubscriptionPurchaseSelector.tsx` | Global subscription rules, allowed durations, and default discounts |
| `/api/{locale}/subscriptions/calculate` | `POST` | **0s (Realtime)** | `SubscriptionPurchaseSelector.tsx`, `subscriptionApi.ts` | Zero-trust server calculation of cycle pricing, discounts & delivery fees |
| `/api/{locale}/subscriptions/checkout` | `POST` | **0s (Realtime)** | `SubscriptionCheckoutModal.tsx`, `SubscribeCheckoutPageView.tsx` | Dedicated subscription checkout, creates subscription cycle & recurring order |
| `/api/{locale}/my-account/subscriptions` | `GET` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | List of active, paused, and completed customer subscriptions |
| `/api/{locale}/my-account/subscriptions/{id}` | `GET` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Subscription breakdown, scheduled deliveries list, and recipient info |
| `/api/{locale}/my-account/subscriptions/{id}/pause` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Pauses upcoming recurring subscription deliveries |
| `/api/{locale}/my-account/subscriptions/{id}/resume` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Resumes a paused subscription with updated delivery schedule |
| `/api/{locale}/my-account/subscriptions/{id}/skip-next` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Skips the immediate next scheduled delivery cycle |
| `/api/{locale}/my-account/subscriptions/{id}/deliveries/{deliveryId}/reschedule` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Reschedules an individual future delivery date and time slot |
| `/api/{locale}/my-account/subscriptions/{id}/address` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Updates delivery address, recipient contact, and map coordinates |
| `/api/{locale}/my-account/subscriptions/{id}/cancel` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Cancels subscription plan with customer feedback reason |
| `/api/{locale}/my-account/subscriptions/{id}/retry-payment` | `POST` | **0s (Realtime)** | `CustomerSubscriptionsDashboard.tsx` | Retries failed payment charge for a pending subscription cycle |

---

## 5. Wishlist

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/my-account/view-wishlist` | `GET` | **60 Seconds (60s)** | `wishlistApi.ts` (`useGetWishlistQuery`), Account Wishlist Tab, Wishlist Drawer | Full product objects of saved items in customer's wishlist |
| `/api/{locale}/my-account/view-wishlistid` | `GET` | **60 Seconds (60s)** | `wishlistApi.ts` (`useGetWishlistIdsQuery`), Product Cards | Fast ID array lookup to highlight active heart icons |
| `/api/{locale}/my-account/add-wishlist` | `POST` | **0s (Realtime)** | `wishlistApi.ts` (`useAddToWishlistMutation`), Heart Icon Click | Saves product to user's server-side wishlist |
| `/api/{locale}/my-account/delete-wishlist` | `DELETE` | **0s (Realtime)** | `wishlistApi.ts` (`useRemoveFromWishlistServerMutation`), Heart Icon Click | Removes product from server-side wishlist |

---

## 6. Home & Navigation

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/home-page` | `GET` | **1 Minute (60s)** | `store-api.ts` (`getHomePageData`), `homeApi.ts` (`useGetHomePageQuery`) | Home page hero sliders, bestsellers, popular categories, and promo banners |
| `/api/{locale}/navigation` | `GET` | **30 Seconds (30s)** | `store-api.ts` (`getNavigationData`), Header, MegaMenu, MobileNav, Footer | Dynamic navigation menus, featured dropdown items & footer link columns |

---

## 7. CMS & Content

| Endpoint | Method | Cache Time | Used In | Description |
| :--- | :---: | :---: | :--- | :--- |
| `/api/{locale}/blog` | `GET` | **1 Minute (60s)** | `store-api.ts` (`getBlogPosts`), Blog listing page | Published blog posts, featured articles, categories & author details |
| `/api/{locale}/blog/{slug}` | `GET` | **1 Minute (60s)** | `store-api.ts` (`getBlogPostBySlug`), Blog detail page | Single blog post content, SEO meta tags & reading time |
| `/api/{locale}/faqs` | `GET` | **1 Minute (60s)** | `store-api.ts` (`getFaqs`), FAQ page & Checkout FAQ drawer | Frequently asked questions categorized with bilingual answers |
| `/api/{locale}/cms-pages/{slug}` | `GET` | **1 Minute (60s)** | `store-api.ts` (`getCmsPageBySlug`), `cmsApi.ts` (`useGetCmsPageBySlugQuery`) | Static policy pages (Privacy Policy, Terms of Service, About Us) |
| `/api/{locale}/contact-page` | `GET` | **1 Minute (60s)** | `store-api.ts` (`getContactPageData`), `cmsApi.ts` (`useGetContactPageQuery`) | Contact page content: boutique addresses, phone, working hours & map link |
| `/api/{locale}/contact-form` | `POST` | **0s (Realtime)** | `store-api.ts` (`submitContactInquiry`), `cmsApi.ts` (`useSendContactFormMutation`) | Contact form submission logging & email dispatch |
| `/api/{locale}/newsletter` | `POST` | **0s (Realtime)** | `cmsApi.ts` (`useSubscribeNewsletterMutation`), Footer Newsletter Form | Newsletter email registration & promo coupon dispatch |
| `/api/{locale}/global-settings` | `GET` | **30 Seconds (30s)** | `cmsApi.ts` (`useGetGlobalSettingsQuery`), Root Layout, Topbar | Branding, SAR/USD currency rates, VAT percentages, social links & tracking scripts |
| `/api/{locale}/google-reviews` | `GET` | **0s (Realtime)** | `cmsApi.ts` (`useGetGoogleReviewsQuery`), Testimonial Sliders | Verified Google reviews with ratings, author avatars & review count |

---

## 8. Next.js Internal Route Proxies
*Located in `/frontend/src/app/api/...` to proxy multipart forms, client payloads, or hide internal backend URLs.*

| Next.js Route | Method | Backend Target URL | Cache Time | Used In |
| :--- | :---: | :--- | :---: | :--- |
| `/api/event-booking` | `POST` | `/api/{locale}/event-booking` | **0s** | `EventBookingForm.tsx` (Event flower styling bookings) |
| `/api/partner-with-us` | `POST` | `/api/{locale}/partner-with-us` | **0s** | `PartnerWithUsPageView.tsx` (Florist partnership with file uploads) |
| `/api/navigation` | `GET` | `/api/{locale}/navigation` | **60s** | Header, MegaMenu, MobileNavDrawer, Footer |
| `/api/global-settings` | `GET` | `/api/{locale}/global-settings` | **30s** | `sitemap.xml`, `robots.txt`, `llms.txt` |
| `/api/google-reviews` | `GET` | `/api/{locale}/google-reviews` | **0s (no-store)** | Reviews carousel component |

---

## 9. SEO & Crawler Routes

| Route | Method | Cache Time | Source / Target |
| :--- | :---: | :---: | :--- |
| `/sitemap.xml` | `GET` | **1 Hour (3600s)** | Dynamically queries `/api/{locale}/global-settings` and builds XML for all products, categories, pages, blogs in both EN & AR |
| `/robots.txt` | `GET` | **1 Hour (3600s)** (Revalidate: 60s) | Dynamic crawler directives with live sitemap reference |
| `/llms.txt` | `GET` | **1 Hour (3600s)** (Revalidate: 60s) | Machine-readable AI model index for search engine AI summaries |

---

## 🛠️ Summary of Cache Durations by Category

```
📦 Catalog & Categories:   300s (5 minutes) ISR
🏠 Home Page & Content:    60s  (1 minute)  ISR
🧭 Navigation & Menus:     30s  (30 seconds) ISR
⚙️ Global Site Settings:    30s  (30 seconds) ISR
🛒 Cart, Checkout & User:  0s   (Realtime - Stale-free)
📅 Subscriptions Ops:      0s   (Realtime - Live updates)
🔍 Live Search:            0s   (Realtime - Dynamic query)
🗺️ SEO (Sitemap / Robots): 3600s (1 hour) ISR
```
