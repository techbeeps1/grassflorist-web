Master Implementation Plan: Production-Quality Multilingual E-Commerce Platform
This plan outlines the architecture, design system, data model, state management, SEO engine, accessibility standards, and component ecosystem for a luxury e-commerce platform inspired by the premium gifting experience of Floward, but with 100% original branding, design tokens, visual assets, and content.

Brand Concept: Florelle (فلوريل) — Luxury Floral Atelier & Artisanal Gifting.
Default Language: Arabic (https://florelle.com/) — Pure RTL root.
Secondary Language: English (https://florelle.com/en/) — Pure LTR /en/.
Strict Constraint: Arabic NEVER uses /ar/. No /ar/ URLs will ever be generated or accepted.

User Review Required
IMPORTANT

Key Architecture Decisions for Approval:

Next.js App Router Structure with Twin Root Layouts:
src/app/(ar)/layout.tsx -> Serves all root URLs (/, /products, /product/[slug], etc.) with <html lang="ar" dir="rtl"> and the Arabic font (Cairo).
src/app/en/layout.tsx -> Serves all /en URLs (/en, /en/products, /en/product/[slug], etc.) with <html lang="en" dir="ltr"> and the English font (Plus Jakarta Sans).
Core page views and logic are shared via src/views/ (e.g., HomePageView({ locale })), guaranteeing zero code duplication, zero hydration mismatch, and instant SSG/SSR pre-rendering.
State & API Architecture:
Redux Toolkit manages client state: Cart (with item options, delivery date, gift card), Wishlist, UI (drawers, city selector, search modal).
RTK Query provides simulated async API endpoints (productsApi, categoriesApi, ordersApi) with realistic latency and mock data, fully prepared for future backend swap with zero UI component changes.
Branding & Visual Palette:
Deep Forest Emerald (#0F4C3A), Refined Champagne Gold (#C5A880), Soft Terracotta Accent (#E07A5F), Petal Cream (#FAF8F5), and Crisp Surface White (#FFFFFF). Centralized in src/config/theme.ts.
1. Directory & File Architecture
text

grass-frontend/
├── public/
│   ├── images/              # Curated SVG icons, category art, badges
│   ├── llms.txt             # AI Search & LLM Knowledge specification (EN & AR)
│   └── robots.txt           # Dynamic via src/app/robots.ts
├── src/
│   ├── app/
│   │   ├── (ar)/            # Root Arabic Route Group (dir="rtl", lang="ar")
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                             # /
│   │   │   ├── products/page.tsx                    # /products/
│   │   │   ├── category/[slug]/page.tsx             # /category/[slug]/
│   │   │   ├── product/[slug]/page.tsx              # /product/[slug]/
│   │   │   ├── search/page.tsx                      # /search/
│   │   │   ├── cart/page.tsx                        # /cart/
│   │   │   ├── wishlist/page.tsx                    # /wishlist/
│   │   │   ├── checkout/page.tsx                    # /checkout/
│   │   │   ├── about/page.tsx                       # /about/
│   │   │   ├── contact/page.tsx                     # /contact/
│   │   │   ├── faq/page.tsx                         # /faq/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx                         # /blog/
│   │   │   │   └── [slug]/page.tsx                  # /blog/[slug]/
│   │   │   └── policies/
│   │   │       ├── privacy/page.tsx                 # /policies/privacy/
│   │   │       ├── terms/page.tsx                   # /policies/terms/
│   │   │       ├── shipping/page.tsx                # /policies/shipping/
│   │   │       └── returns/page.tsx                 # /policies/returns/
│   │   │
│   │   ├── en/              # English Routes Group (dir="ltr", lang="en")
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                             # /en/
│   │   │   ├── products/page.tsx                    # /en/products/
│   │   │   ├── category/[slug]/page.tsx             # /en/category/[slug]/
│   │   │   ├── product/[slug]/page.tsx              # /en/product/[slug]/
│   │   │   ├── search/page.tsx                      # /en/search/
│   │   │   ├── cart/page.tsx                        # /en/cart/
│   │   │   ├── wishlist/page.tsx                    # /en/wishlist/
│   │   │   ├── checkout/page.tsx                    # /en/checkout/
│   │   │   ├── about/page.tsx                       # /en/about/
│   │   │   ├── contact/page.tsx                     # /en/contact/
│   │   │   ├── faq/page.tsx                         # /en/faq/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx                         # /en/blog/
│   │   │   │   └── [slug]/page.tsx                  # /en/blog/[slug]/
│   │   │   └── policies/
│   │   │       ├── privacy/page.tsx                 # /en/policies/privacy/
│   │   │       ├── terms/page.tsx                   # /en/policies/terms/
│   │   │       ├── shipping/page.tsx                # /en/policies/shipping/
│   │   │       └── returns/page.tsx                 # /en/policies/returns/
│   │   │
│   │   ├── not-found.tsx    # Accessible 404 page with localized fallback
│   │   ├── error.tsx        # Global error boundary
│   │   ├── robots.ts        # Dynamic Next.js robots.txt generator
│   │   └── sitemap.ts       # Dynamic Next.js XML sitemap generator
│   │
│   ├── views/               # Shared Page View Components (DRY, SSR-ready)
│   │   ├── HomePageView.tsx
│   │   ├── ProductsPageView.tsx
│   │   ├── CategoryPageView.tsx
│   │   ├── ProductDetailPageView.tsx
│   │   ├── SearchPageView.tsx
│   │   ├── CartPageView.tsx
│   │   ├── WishlistPageView.tsx
│   │   ├── CheckoutPageView.tsx
│   │   ├── AboutPageView.tsx
│   │   ├── ContactPageView.tsx
│   │   ├── FaqPageView.tsx
│   │   ├── BlogListingPageView.tsx
│   │   ├── BlogPostPageView.tsx
│   │   └── PolicyPageView.tsx
│   │
│   ├── components/
│   │   ├── common/          # Badges, Breadcrumbs, StarRating, QuantitySelector, Pagination
│   │   ├── layout/          # AnnouncementBar, CitySelectorModal, MobileNavDrawer
│   │   ├── header/          # Header, MegaMenu, LanguageSwitcher, SearchBar, HeaderActions
│   │   ├── footer/          # Footer, NewsletterSignup, TrustBadges
│   │   ├── home/            # HeroSection, CategoryCircles, OccasionCards, BestSellers, PromoBanner, TrustFeatures, TestimonialsSection
│   │   ├── product/         # ProductCard, ProductGrid, ProductGallery, ProductInfo, ProductUpsells, ProductReviews, ProductTabs
│   │   ├── category/        # CategoryFilters, PriceRangeFilter, SortDropdown, MobileFilterDrawer
│   │   ├── cart/            # CartDrawer, CartItemRow, OrderSummaryCard, FreeShippingProgress, CouponInput
│   │   ├── wishlist/        # WishlistGrid, WishlistItemCard, EmptyWishlist
│   │   ├── checkout/        # StepIndicator, DeliveryAddressForm, DeliveryTimeSlotPicker, GiftMessageForm, PaymentMethodSelector, OrderConfirmation
│   │   ├── search/          # SearchModal, LiveSearchResults, SearchFacetBar
│   │   ├── blog/            # BlogCard, BlogGrid, AuthorCard, RelatedPosts
│   │   ├── faq/             # FaqAccordion, FaqCategoryTabs
│   │   └── ui/              # Button, Input, Modal, Drawer, Toast, Skeleton, Tabs, Accordion
│   │
│   ├── config/
│   │   ├── theme.ts         # Single source of truth for colors, typography, radius, layout
│   │   ├── site.ts          # Site brand details, contact, cities, currency defaults
│   │   └── seo.ts           # SEO titles, meta templates, social handles
│   │
│   ├── data/
│   │   ├── products.ts      # 35+ realistic products with rich EN & AR details
│   │   ├── categories.ts    # 6 core categories & 18 subcategories
│   │   ├── banners.ts       # Hero banners & promotional banners
│   │   ├── occasions.ts     # Occasion collections (Birthday, Anniversary, Romance, etc.)
│   │   ├── testimonials.ts  # Verified customer reviews
│   │   ├── faqs.ts          # Categorized FAQs (Ordering, Delivery, Flower Care, Payment)
│   │   └── blog.ts          # Educational guides & flower care articles
│   │
│   ├── i18n/
│   │   ├── config.ts        # Locales: ['ar', 'en'], default: 'ar'
│   │   ├── routing.ts       # Path translations & bidirectional switcher logic
│   │   ├── dictionaries/
│   │   │   ├── ar.json      # Complete, natural Arabic translations
│   │   │   └── en.json      # Complete, professional English translations
│   │   └── get-dictionary.ts
│   │
│   ├── lib/
│   │   ├── seo/             # generatePageMetadata(), hreflang helpers, canonical helpers
│   │   ├── schema/          # JSON-LD generators (Organization, WebSite, Product, Breadcrumb, Article, FAQ)
│   │   ├── utils/           # formatCurrency(), formatDate(), cn(), slugify()
│   │   └── validation/      # Checkout, contact, and newsletter form validation rules
│   │
│   ├── store/
│   │   ├── api/
│   │   │   ├── baseApi.ts   # RTK Query base with mock service handler & delay
│   │   │   ├── productsApi.ts
│   │   │   ├── categoriesApi.ts
│   │   │   └── ordersApi.ts
│   │   ├── slices/
│   │   │   ├── cartSlice.ts
│   │   │   ├── wishlistSlice.ts
│   │   │   └── uiSlice.ts
│   │   ├── index.ts         # Root Redux store configuration
│   │   └── provider.tsx     # Client Redux provider with localStorage rehydration
│   │
│   ├── types/
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── blog.ts
│   │   ├── faq.ts
│   │   └── common.ts
│   │
│   └── styles/
│       └── globals.css      # CSS custom properties linked to theme.ts, RTL utilities
├── middleware.ts            # Route guards, redirects /ar/* to /* (301), sets path headers
├── next.config.ts           # Image domains, security headers, optimization
├── tailwind.config.ts       # Extends theme.ts tokens, RTL plugins
└── tsconfig.json            # Strict TypeScript configuration
2. Core Implementation Phases
Phase 1: Foundation & Project Bootstrapping
Initialize Next.js project inside workspace with TypeScript, Tailwind CSS, App Router, ESLint, and @/* alias using npx.cmd create-next-app.
Install necessary production dependencies:
@reduxjs/toolkit and react-redux
lucide-react (high-performance, accessible tree-shakeable icons)
clsx and tailwind-merge (for safe dynamic classes)
Setup Google Fonts in src/app/fonts.ts:
Arabic: Cairo (weights 400, 500, 600, 700, 800) with Arabic subset.
English: Plus Jakarta Sans (weights 400, 500, 600, 700, 800) with Latin subset.
Configure src/config/theme.ts with complete design tokens (Emerald #0F4C3A, Champagne #C5A880, Terracotta #E07A5F, Cream #FAF8F5, Slate #1A1E21).
Configure tailwind.config.ts to consume theme.ts and set up logical layout helpers.
Configure globals.css with CSS custom properties, smooth scrolling, reduced motion support, and focus-visible rings.
Phase 2: Multilingual Routing, Layouts & Middleware
Create middleware.ts:
Intercept any access to /ar or /ar/* and 301-redirect to / or /* (strictly enforcing "NEVER /ar/").
Set request headers (x-pathname, x-locale) for server layout processing.
Create src/i18n/:
config.ts: defines defaultLocale = 'ar', locales = ['ar', 'en'].
dictionaries/ar.json & dictionaries/en.json: exhaustive translation keys for every UI string (Header, Nav, Filters, Sort, ProductCard, PDP, Cart, Checkout, Validation, FAQ, Blog, Policies, Accessibility).
routing.ts: language switcher helper functions that preserve the current URL across languages:
Example: /product/royal-red-roses <-> /en/product/royal-red-roses
Example: /category/luxury-arrangements <-> /en/category/luxury-arrangements
Graceful fallback to localized home if page has no direct equivalent.
Create Twin Root Layouts:
src/app/(ar)/layout.tsx: renders <html lang="ar" dir="rtl" className={cairo.variable}>
src/app/en/layout.tsx: renders <html lang="en" dir="ltr" className={plusJakartaSans.variable}>
Both wrap children in the Redux Store Provider and include the AnnouncementBar, Header, Main content container, Toast notifications container, and Footer.
Phase 3: Comprehensive Data Layer (35+ Products & Content)
Create src/types/product.ts, category.ts, cart.ts, order.ts, blog.ts, faq.ts.
Build src/data/categories.ts:
Fresh Flowers & Bouquets (flowers / زهور وباقات)
Luxury Box Arrangements (luxury-arrangements / تنسيقات فاخرة)
Indoor Plants & Bonsai (plants / نباتات داخلية)
Chocolates & Artisan Cakes (chocolates-cakes / شوكولاتة وكيك)
Perfumes & Scented Gifts (gifts-perfumes / عطور وهدايا)
Curated Gift Hampers (gift-sets / مجموعات هدايا)
Build src/data/products.ts:
35+ realistic, handcrafted products with authentic Arabic and English titles, descriptions, care guidelines, attributes, stock, tags, SKUs, and pricing in SAR (e.g. 195 SAR, 280 SAR, 450 SAR).
High-resolution, optimized photography for bouquets, roses, acrylic flower boxes, orchids, peace lilies, Belgian pralines, luxury oud perfumes, and combo hampers.
Build src/data/occasions.ts: Birthday, Anniversary, Romance, Congratulations, New Baby, Get Well Soon.
Build src/data/testimonials.ts: Realistic customer reviews with verified purchase badges and ratings.
Build src/data/faqs.ts: 16+ detailed FAQs across 4 categories (Ordering, Delivery & Timing, Flower Care & Freshness, Payment & Cancellations).
Build src/data/blog.ts: 6 in-depth educational articles (e.g., "How to keep cut roses fresh for 10+ days", "The ultimate guide to choosing flowers for anniversaries", "Indoor plants that purify your home air").
Phase 4: State Management & RTK Query Architecture
Create src/store/slices/:
cartSlice.ts: Items array, quantity modification, add-on additions (vase, chocolates, custom greeting card with message), coupon application (e.g. WELCOME10), delivery slot & date selection, localStorage persistence.
wishlistSlice.ts: Toggling items, count, removal, move-to-cart, localStorage persistence.
uiSlice.ts: Mobile menu drawer, cart slide-over drawer, search modal, city selector modal (Riyadh, Jeddah, Khobar, Dubai), active notifications.
Create src/store/api/:
baseApi.ts: Configured RTK Query slice with custom mock query handlers providing 250ms simulated latency for realistic loading states.
productsApi.ts: Endpoints for getProducts, getProductBySlug, getFeaturedProducts, getBestsellers, searchProducts.
categoriesApi.ts: Endpoints for getCategories, getCategoryBySlug.
ordersApi.ts: Endpoint for createOrder.
This architecture enables dropping in real backend endpoints in baseApi.ts without touching any UI component.
Phase 5: Reusable UI Component Library
src/components/ui/:
Accessible Button (variants: primary, secondary, outline, ghost; sizes: sm, md, lg; loading spinner).
Input and Textarea with accessible label, error message, helper text, and RTL alignment.
Modal and Drawer (slide-over from right in LTR, from left in RTL; keyboard Escape support, focus trap, body scroll lock).
Accordion (semantic <details> or accessible ARIA button with smooth height transition).
Tabs (accessible role="tablist", arrow key navigation).
Toast notification system.
Skeleton components for cards, grids, and PDP images.
Phase 6: Header, Navigation & Mega Menu
Desktop Header:
Top Announcement Bar: Delivery timer, free shipping banner ("Free delivery on orders over 250 SAR").
Main Bar: Florelle Logo (refined serif luxury font mark), City/Location Selector (Riyadh, Jeddah, etc.), Search Trigger Bar, Language Switcher (العربية / English), Wishlist Icon with count badge, Cart Button with count and live subtotal badge.
Category Navigation Bar with hover & focus Mega Menu displaying subcategories, featured highlights, and quick links.
Mobile Header:
Sticky header with Hamburger trigger, Brand Logo, Search icon, Cart button with badge, Language switcher.
Slide-over Mobile Navigation Drawer with category accordions, city selection, customer support links, and quick actions.
Directional icons automatically flipped in RTL (chevrons, back arrows), non-directional icons preserved (phone, heart, cart).
Phase 7: Homepage Implementation
src/views/HomePageView.tsx:
Hero Section: High-impact hero banner with headline ("Handcrafted Blooms & Luxury Gifting"), supporting text, CTAs ("Explore Flowers", "Send a Gift"), and same-day delivery badge.
Quick Category Circles: Visual circular stories for fast mobile navigation.
Shop by Occasion: Curated occasion cards (Anniversary, Birthday, Love & Romance, Congratulations).
Featured Collections & Best Sellers: Tabbed product carousel/grid with quick add-to-cart and wishlist toggle.
Curated Promotional Banner: Luxury gift sets with bespoke greeting cards and Belgian chocolates.
New Arrivals Showcase.
Value Propositions / Trust Features: 2-hour express delivery, 7-day freshness guarantee, cold-chain transport, handwritten cards.
Customer Testimonials: Real reviews with star ratings and photos.
Editorial Flower Care / Blog Snippets: Visual preview of helpful guides.
FAQ Accordion: Frequently asked questions for immediate customer trust.
VIP Club / Newsletter Signup: With discount incentive.
Phase 8: Product Catalog & Category Pages
src/views/ProductsPageView.tsx & src/views/CategoryPageView.tsx:
Accessible Breadcrumb navigation with localized links.
Category Header with localized title, description, and banner visual.
Filter Sidebar (Desktop) and Slide-over Filter Drawer (Mobile):
Category & Subcategory selection.
Price range slider & inputs.
Rating filter (4★ & above).
Availability toggle (In stock only).
Occasion / Tag filters.
Clear all filters button.
Sort Controls: Most Popular, Price: Low to High, Price: High to Low, Highest Rated, Newest.
Product Grid: 2 columns on mobile, 3-4 columns on desktop, with loading skeletons and empty filter states.
Reusable ProductCard:
Image with secondary image preview on hover.
Discount badge & New Arrival tag.
Wishlist heart toggle with instant animation.
Title, Star Rating with review count.
Price & Strikethrough original price.
Quick "Add to Cart" button with loading spinner and slide-over cart drawer opening.
Phase 9: Product Detail Page (PDP)
src/views/ProductDetailPageView.tsx:
Breadcrumbs: Home > Category > Subcategory > Product Name.
Image Gallery: Multi-angle high-resolution thumbnails, main active image with zoom lens, badge indicators.
Product Details: Localized title, SKU, Stock status with countdown ("Order in 1h 45m for delivery today"), Star rating and review link.
Pricing Block: Current price, original price, discount percentage, VAT inclusion note.
Gifting Add-ons (Upsells):
Choose Vase (None, Classic Glass Vase +45 SAR, Luxury Ceramic +75 SAR).
Custom Greeting Card (+0 SAR) with textarea for handwritten message.
Add Luxury Chocolates (+65 SAR).
Quantity Selector with min/max validation.
Primary Action Buttons: "Add to Cart" and "Buy Now" (direct to checkout), plus Wishlist toggle.
Delivery Time Estimator: Interactive city and time slot indicator.
Tabbed Accordion: Full Description, Floral Care Instructions, Dimensions & Flower Count, Shipping & Guarantee.
Frequently Bought Together combo recommendation.
Related Products carousel.
Customer Reviews section with rating breakdown and review submission modal.
Phase 10: Search Experience
src/components/search/SearchModal.tsx & src/views/SearchPageView.tsx:
Instant live autocomplete dropdown when typing in the header search input.
Popular search tags (e.g. "Red Roses", "Orchids", "Birthday Hampers", "Lilies").
Dedicated search results page (/search?q=... and /en/search?q=...) supporting Arabic and English search queries with filter facets and sort options.
Empty state with recommendations and popular products if no match found.
Phase 11: Cart & Wishlist System
src/components/cart/CartDrawer.tsx (Slide-over) & src/views/CartPageView.tsx (Dedicated page):
Free Shipping Progress Bar (dynamic bar showing remaining amount to reach free delivery).
Cart item list with thumbnail, title, selected add-ons, price, and quantity controls (+ / - / remove).
Promo Code Input with instant discount calculation.
Gift Packaging & Card message preview.
Order Summary: Subtotal, Estimated VAT (15%), Delivery fee, Total.
Sticky "Proceed to Checkout" CTA button.
Empty cart state with "Continue Shopping" link.
src/views/WishlistPageView.tsx:
Grid of saved wishlist items with "Move to Cart" and remove actions.
Empty wishlist state with curated suggestions.
Phase 12: Checkout Flow & Order Confirmation
src/views/CheckoutPageView.tsx:
Step 1: Recipient Information:
Toggle: "Send to myself" or "Send as a gift to someone special".
Recipient name, mobile number, delivery address (City, District, Street).
Step 2: Delivery Date & Time Slot:
Date picker (Today, Tomorrow, Specific Date).
Slot selection: Morning (9 AM - 1 PM), Afternoon (2 PM - 6 PM), Evening (7 PM - 11 PM).
Step 3: Greeting Card:
Sender name (or "Keep me anonymous"), message text for handwritten card.
Step 4: Payment Method UI:
Mada, Apple Pay, Visa/MasterCard, Cash on Delivery, Tabby (4 split payments preview).
Step 5: Order Summary & Place Order:
Full breakdown of products, add-ons, VAT, shipping, and total.
Client-side validation for all required fields with localized error messages.
Step 6: Order Confirmation View:
Unique order number, estimated delivery time, order tracking stepper, and summary details.
Phase 13: Content & Policy Pages
src/views/AboutPageView.tsx: Brand story, artisan florists, cold-chain delivery promise, sustainability.
src/views/ContactPageView.tsx: Contact form with validation, customer support phone, WhatsApp link, boutique addresses (Riyadh, Jeddah, Dubai), working hours.
src/views/FaqPageView.tsx: Categorized accordions, search input within FAQs.
src/views/BlogListingPageView.tsx & BlogPostPageView.tsx: Articles with reading time, author, publication date, tags, table of contents, and related articles.
src/views/PolicyPageView.tsx: Privacy Policy, Terms of Service, Shipping & Delivery Policy, Return & Refund Policy (both EN & AR).
Phase 14: Comprehensive Technical SEO & AI SEO (GEO / AEO)
src/lib/seo/metadata.ts:
Localized title and description for every page.
Self-referencing canonical URL on both Arabic and English pages.
Hreflang alternates:
html

<link rel="alternate" hreflang="ar" href="https://florelle.com/..." />
<link rel="alternate" hreflang="en" href="https://florelle.com/en/..." />
<link rel="alternate" hreflang="x-default" href="https://florelle.com/..." />
OpenGraph & Twitter Card tags with localized titles, summaries, and social image previews.
src/lib/schema/:
generateOrganizationSchema()
generateWebSiteSchema()
generateProductSchema(product, locale) (including name, description, image, sku, brand, offers, aggregateRating)
generateBreadcrumbSchema(breadcrumbs, locale)
generateArticleSchema(post, locale)
generateFaqSchema(faqs, locale)
src/app/sitemap.ts: Dynamic Next.js sitemap listing all products, categories, blog posts, and static pages in both Arabic and English (excluding cart/checkout).
src/app/robots.ts: Allows public crawling, points to sitemap, disallows /cart, /checkout, /api/.
/public/llms.txt: Factual entity definitions, category trees, product lines, flower care guides, and delivery coverage in English and Arabic for LLM answer engines (Perplexity, ChatGPT, Gemini, Google AI Overviews).
Phase 15: Accessibility (WCAG 2.2 AA) & Performance
Focus visible rings, skip-to-content links.
ARIA labels on all icon-only buttons, modal dialog semantics, accessible mobile drawer and accordions.
High color contrast ratio (minimum 4.5:1).
next/image optimization with explicit widths, heights, responsive sizes, priority on hero images, and descriptive localized alt texts.
Zero layout shift (CLS), fast LCP, responsive INP.
3. Verification & Testing Plan
Automated Verification
TypeScript Compilation:
powershell

npm.cmd run type-check # or npx.cmd tsc --noEmit
Must pass with 0 errors in strict mode.
ESLint & Code Quality:
powershell

npm.cmd run lint
Must pass cleanly without warnings.
Production Build Validation:
powershell

npm.cmd run build
Must successfully generate all static pages, dynamic routes, twin layouts, sitemap, and robots without errors.
Manual & Functional Verification
Multilingual & RTL Verification:
Verify / loads in Arabic with <html lang="ar" dir="rtl"> and Cairo font.
Verify /en loads in English with <html lang="en" dir="ltr"> and Plus Jakarta Sans font.
Verify accessing /ar or /ar/* 301-redirects cleanly to / or /*.
Verify language switcher toggles between /product/royal-red-roses and /en/product/royal-red-roses without losing page context.
Verify RTL layout: navigation, product cards, filters, drawer, breadcrumbs, icons.
E-Commerce Flows:
Product Browsing: Catalog filtering by category, price slider, and sorting.
PDP Experience: Image gallery zoom/selection, add-on selection (vase, card message), quantity update.
Cart System: Adding items opens slide-over drawer, updates badge count, calculates shipping progress bar, promo code discounts, and persists on page reload.
Wishlist: Toggling heart button updates wishlist count, persists in localStorage, and allows moving item to cart.
Checkout: Complete multi-step form validation, recipient toggle, date/time slot selection, payment method toggle, and mock order confirmation.
Search: Live autocomplete dropdown suggestions in header and full search results page.
SEO & Structured Data Verification:
Inspect <head> on Arabic and English pages: verify title, description, self-referencing canonical, and 3 hreflang links (ar, en, x-default).
Inspect JSON-LD <script type="application/ld+json"> for Organization, Product, Breadcrumb, FAQ, and Article.
Verify /sitemap.xml, /robots.txt, and /llms.txt.
Accessibility Verification:
Keyboard Tab navigation through Header, Mega Menu, Filters, Product Cards, Modal, and Cart Drawer.
Escape key closes drawers and modals.
Screen reader attributes (aria-label, aria-expanded, aria-hidden) on all interactive elements.