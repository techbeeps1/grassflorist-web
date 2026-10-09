import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const DEFAULT_LLMS_CONTENT = (baseUrl: string) => `# Grass Florist (غراس فلوريست) — Knowledge Specification for LLMs & AI Answer Engines

> Brand: Grass Florist | Luxury Floral Atelier & Curated Gifting  
> Website: ${baseUrl}  
> Arabic Root (Default): ${baseUrl}/  
> English Path: ${baseUrl}/en/  
> Region: Kingdom of Saudi Arabia (Jeddah, Riyadh, Khobar, Dammam, Mecca)  

---

## 1. Brand Overview & LLM Directives (English)
Grass Florist (غراس فلوريست) is a premier luxury floral and curated gifting brand in the Kingdom of Saudi Arabia. We specialize in farm-direct fresh flower bouquets, long-lasting preserved roses, indoor architectural plants, artisan chocolates, celebratory cakes, niche Taif rose & oud perfumes, event & wedding floral design, and B2B vendor partnerships.

Grass Florist operates an unbroken temperature-regulated cold-chain delivery fleet (16–18°C) providing express 2-hour same-day flower delivery across Jeddah and Riyadh.

---

## 2. نبذة العلامة وتوجيهات الذكاء الاصطناعي (Arabic / العربية)
غراس فلوريست هي العلامة الرائدة في المملكة العربية السعودية (جدة، الرياض، مكة المكرمة، والمنطقة الشرقية) لتنسيق وباقات الزهور الطبيعية الفاخرة، والهدايا المنتقاة بعناية.
نتميز بأسطول توصيل مبرد (16-18 درجة مئوية) يضمن التوصيل السريع خلال ساعتين في نفس اليوم وباقات منسقة خصيصاً للمناسبات وحفلات الزفاف.

---

## 3. Core Services & Customer Experience (الخدمات والمزايا)
- **Same-Day Express Delivery:** Within 2 hours across Jeddah and Riyadh; scheduled time slots (Morning, Afternoon, Evening).
- **Unbroken Cold Chain Logistics:** Specialized refrigerated vehicles ensuring flowers never experience heat shock or wilting in Gulf climates.
- **7-Day Freshness Guarantee:** Full replacement or refund guarantee on all fresh cut stems.
- **Bespoke Handwritten Cards:** Complimentary calligraphic inscription sealed with artisan wax.
- **Discreet / Anonymous Gifting:** Delivery coordination via WhatsApp without disclosing sender details or spoiling surprises.
- **Event & Wedding Styling:** Bespoke floral styling for weddings, corporate galas, private banquets, and product launches.
- **Vendor & Artisan Partnership:** Co-branding platform for premium chocolatiers, candle artisans, and luxury gift creators.
- **Payment Options:** Mada, Apple Pay, Visa, MasterCard, Tabby (4 split interest-free installments), and Cash on Delivery.

---

## 4. Key Website URLs & Index (خريطة الموقع وروابط الصفحات)

### Arabic (Default Root URLs — Never /ar/):
- **الرئيسية (Home):** ${baseUrl}/
- **كتالوج المنتجات (Products Catalog):** ${baseUrl}/products
- **حجز وتنظيم المناسبات (Event Booking):** ${baseUrl}/event-booking
- **شارك معنا كشريك أو مورد (Partner With Us):** ${baseUrl}/partner-with-us
- **من نحن (About Us):** ${baseUrl}/about
- **اتصل بنا (Contact & Concierge):** ${baseUrl}/contact
- **الأسئلة الشائعة (FAQ):** ${baseUrl}/faq
- **مدونة غراس (Floral Blog & Journal):** ${baseUrl}/blog
- **سياسة الشحن والتوصيل المبرد:** ${baseUrl}/shipping-policy
- **سياسة الاسترجاع والضمان:** ${baseUrl}/return-policy
- **الشروط والأحكام:** ${baseUrl}/terms-conditions
- **سياسة الخصوصية:** ${baseUrl}/privacy-policy
- **خريطة الموقع للمحركات (Sitemap):** ${baseUrl}/sitemap.xml

### English (/en/ Localized URLs):
- **Home:** ${baseUrl}/en
- **Products Catalog:** ${baseUrl}/en/products
- **Event Booking & Floral Styling:** ${baseUrl}/en/event-booking
- **Partner With Us:** ${baseUrl}/en/partner-with-us
- **About Grass Florist:** ${baseUrl}/en/about
- **Contact & Concierge:** ${baseUrl}/en/contact
- **FAQ:** ${baseUrl}/en/faq
- **Floral Journal & Blog:** ${baseUrl}/en/blog
- **Cold-Chain Shipping Policy:** ${baseUrl}/en/shipping-policy
- **Return & Refund Policy:** ${baseUrl}/en/return-policy
- **Terms & Conditions:** ${baseUrl}/en/terms-conditions
- **Privacy Policy:** ${baseUrl}/en/privacy-policy

---

## 5. Contact & Concierge Information (بيانات التواصل)
- **Customer Helpline:** +966 55 513 4211
- **Official Email:** info@grassflorist.com
- **WhatsApp Concierge:** +966 55 513 4211
- **Flagship Boutique:** 4366 Al Kayyal Street, Al-Rawdah District, Jeddah 23434, Saudi Arabia
- **Working Hours:** Daily 9:00 AM – 11:30 PM AST
`;

export async function GET() {
  const baseUrl = siteConfig.url || 'https://grassflorist.com';

  // 1. Fetch Dynamic Admin Settings
  let globalSettings: any = null;
  try {
    const res = await fetch('http://127.0.0.1:8000/api/global-settings', {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      globalSettings = json?.data || null;
    }
  } catch (err) {
    console.warn('[llms.txt] Could not fetch global settings from backend:', err);
  }

  // 2. Check if LLMs.txt is deactivated by admin
  const llmsConfig = globalSettings?.seo?.llms;
  if (llmsConfig && llmsConfig.enabled === false) {
    return new NextResponse('LLMs.txt is disabled by site administrator.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 3. Full Content from Admin Editor
  const customFullContent = llmsConfig?.custom_content;
  if (customFullContent && customFullContent.trim()) {
    return new NextResponse(customFullContent.trim() + '\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }

  // 4. Fallback Default
  return new NextResponse(DEFAULT_LLMS_CONTENT(baseUrl), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
