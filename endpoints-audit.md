# 📊 Frontend API Endpoints Audit (Used vs Unused Backend Endpoints)

Please see the comprehensive audit report created in:
- [backend/API_ENDPOINTS_AUDIT.md](file:///d:/Projects/grassnew/backend/API_ENDPOINTS_AUDIT.md)
- [frontend/endpoints.md](file:///d:/Projects/grassnew/frontend/endpoints.md) (Active Frontend Endpoints Catalog)

### Cleanup Summary
- **Total Registered Backend Routes:** Reduced from 246 down to **165 clean, canonical routes**
- **🟢 Actively Used in Frontend:** 69 endpoints (All 100% active and functioning)
- **🧹 Removed in Category 1 & Category 2:**
  - Dead Indian states, tutor form, vendor signup, product request, news CRUD, old publications
  - Legacy Razorpay webhooks (Saudi uses HyperPay, Tabby, Tamara, PayPal)
  - Duplicate `/customer/subscriptions/*` aliases (Canonical `/my-account/subscriptions/*` preserved)
  - Duplicate `/v1/cart/*` aliases (Canonical `/cart/*` preserved)
  - Duplicate `/newsletter/subscribe` (Canonical `/newsletter` preserved)
  - Duplicate v1 content endpoints (`/v1/faqs`, `/v1/google-reviews`, etc.)
- **🔴 Remaining Unused (Retained by Design):**
  - Active server webhooks (HyperPay, Tabby, Tamara, PayPal server-to-server pings)
  - Cron tools (`/global-settings/fetch-currency-rate`)
  - Admin documentation page (`/admin/api-documentation`)
