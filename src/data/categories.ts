import { Category } from '@/types/category';

export const categories: Category[] = [
  {
    id: 'flowers',
    name: {
      ar: 'باقات الزهور الطبيعية',
      en: 'Fresh Flower Bouquets',
    },
    slug: 'flowers',
    description: {
      ar: 'باقات زهور طبيعية منسقة يدوياً من أجود أنواع الجوري الهولندي، التوليب، والليليوم بألوان ساحرة.',
      en: 'Hand-tied fresh flower bouquets featuring premium Dutch roses, tulips, and lilies in enchanting palettes.',
    },
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    seoTitle: {
      ar: 'باقات زهور طبيعية فاخرة | توصيل فوري في السعودية | غراس فلوريست',
      en: 'Luxury Fresh Flower Bouquets | Same-Day Delivery | Grass Florist',
    },
    seoDescription: {
      ar: 'تسوق أرقى باقات الزهور الطبيعية مع خدمة التوصيل المبرد في نفس اليوم في الرياض وجدة. ورد جوري، توليب، وليليوم.',
      en: 'Discover handcrafted fresh flower bouquets with chilled same-day delivery across Riyadh and Jeddah.',
    },
    featured: true,
    itemCount: 12,
    subcategories: [
      { id: 'roses', name: { ar: 'ورد الجوري الفاخر', en: 'Luxury Roses' }, slug: 'roses' },
      { id: 'mixed', name: { ar: 'باقات مشكلة ملكية', en: 'Mixed Botanical Bouquets' }, slug: 'mixed' },
      { id: 'tulips', name: { ar: 'توليب هولندي نقي', en: 'Dutch Tulips' }, slug: 'tulips' },
      { id: 'orchids', name: { ar: 'أوركيد استوائي نادر', en: 'Exotic Orchids' }, slug: 'orchids' },
    ],
  },
  {
    id: 'luxury-arrangements',
    name: {
      ar: 'تنسيقات الصناديق الفاخرة',
      en: 'Luxury Box Arrangements',
    },
    slug: 'luxury-arrangements',
    description: {
      ar: 'تصاميم زهور ملكية في صناديق مخملية وأكريليك فاخرة تدوم طويلاً وتضفي فخامة استثنائية.',
      en: 'Signature floral arrangements presented in opulent velvet cylinder boxes and bespoke transparent acrylic.',
    },
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    seoTitle: {
      ar: 'صناديق زهور مخملية وأكريليك ملكية | متجر غراس فلوريست',
      en: 'Opulent Box Flower Arrangements | Grass Florist Atelier',
    },
    seoDescription: {
      ar: 'تنسيقات زهور راقية في علب مخملية فاخرة تدوم طويلاً مع بطاقة إهداء وتوصيل فوري مبرد.',
      en: 'Velvet and acrylic preserved flower boxes crafted for unforgettable luxury celebrations.',
    },
    featured: true,
    itemCount: 8,
    subcategories: [
      { id: 'velvet-boxes', name: { ar: 'صناديق مخملية دائرية', en: 'Velvet Cylinder Boxes' }, slug: 'velvet-boxes' },
      { id: 'acrylic-boxes', name: { ar: 'صناديق أكريليك شفافة', en: 'Clear Acrylic Boxes' }, slug: 'acrylic-boxes' },
      { id: 'eternal-roses', name: { ar: 'ورد دائم محفوظ لسنوات', en: 'Forever Preserved Roses' }, slug: 'eternal-roses' },
    ],
  },
  {
    id: 'plants',
    name: {
      ar: 'نباتات داخلية وأشجار بونساي',
      en: 'Indoor Plants & Bonsai',
    },
    slug: 'plants',
    description: {
      ar: 'نباتات ظل حية تنقي الهواء وتمنح منزلك ومكتبك حيوية خضراء وأناقة طبيعية دائمة.',
      en: 'Living air-purifying indoor plants and architectural bonsai curated in ceramic artisanal planters.',
    },
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    seoTitle: {
      ar: 'نباتات ظل داخلية وبونساي للمنزل والمكتب | غراس فلوريست',
      en: 'Lush Indoor Plants & Bonsai Trees | Grass Florist Botanic',
    },
    seoDescription: {
      ar: 'اختر من تشكيلة النباتات الداخلية المنقية للهواء مع مراكن فخمة وإرشادات ري مجانية.',
      en: 'Elevate your interior sanctuary with resilient, lush houseplants and Japanese bonsai trees.',
    },
    featured: true,
    itemCount: 6,
    subcategories: [
      { id: 'peace-lily', name: { ar: 'زنبق السلام والمونستيرا', en: 'Peace Lilies & Monsteras' }, slug: 'peace-lily' },
      { id: 'bonsai', name: { ar: 'أشجار بونساي يابانية', en: 'Japanese Bonsai' }, slug: 'bonsai' },
      { id: 'succulents', name: { ar: 'عصاريات ونباتات جلد النمر', en: 'Succulents & Sansevieria' }, slug: 'succulents' },
    ],
  },
  {
    id: 'chocolates-cakes',
    name: {
      ar: 'شوكولاتة سويسرية وكيك فاخر',
      en: 'Chocolates & Artisan Cakes',
    },
    slug: 'chocolates-cakes',
    description: {
      ar: 'تشكيلات حصرية من الشوكولاتة البلجيكية والسويسرية الفاخرة وكيك طازج محضر بأيدي أمهر الطهاة.',
      en: 'Decadent Belgian pralines, Swiss chocolate truffles, and fresh patisserie cakes made to celebrate.',
    },
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    seoTitle: {
      ar: 'شوكولاتة فاخرة وكيك احتفالي مع الزهور | غراس فلوريست',
      en: 'Gourmet Chocolates & Celebratory Cakes | Grass Florist',
    },
    seoDescription: {
      ar: 'أضف لمسة حلاوة استثنائية لهديتك مع علب شوكولاتة وترافلز بلجيكية وكيك طازج فاخر.',
      en: 'Complement your blooms with handcrafted artisan chocolates and celebration cakes.',
    },
    featured: true,
    itemCount: 6,
    subcategories: [
      { id: 'pralines', name: { ar: 'برالين وترافلز سويسري', en: 'Swiss Pralines & Truffles' }, slug: 'pralines' },
      { id: 'artisan-cakes', name: { ar: 'كيك المناسبات الفاخر', en: 'Celebration Cakes' }, slug: 'artisan-cakes' },
    ],
  },
  {
    id: 'gifts-perfumes',
    name: {
      ar: 'عطور شرقية وشموع معطرة',
      en: 'Perfumes & Scented Candles',
    },
    slug: 'gifts-perfumes',
    description: {
      ar: 'نفحات ملكية من دهن العود والمسك الأبيض وشموع الصويا المعطرة لتعطير اللحظات الخاصة.',
      en: 'Royal scents featuring Damascene rose, pure oud oil, and hand-poured botanical soy candles.',
    },
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    seoTitle: {
      ar: 'عطور راقية ودهن عود وشموع معطرة | غراس فلوريست',
      en: 'Luxury Perfumes, Oud & Botanical Candles | Grass Florist',
    },
    seoDescription: {
      ar: 'أرقى العطور والشموع العطرية الفاخرة للإهداء الراقي مع تغليف مميز وبطاقة مخصصة.',
      en: 'Enchanting artisan perfumes and fragrant soy candles designed to accompany fine flowers.',
    },
    featured: false,
    itemCount: 5,
    subcategories: [
      { id: 'oud-perfumes', name: { ar: 'عطور العود والورد الطائفي', en: 'Oud & Taif Rose Fragrances' }, slug: 'oud-perfumes' },
      { id: 'candles', name: { ar: 'شموع الصويا الطبيعية', en: 'Botanical Soy Candles' }, slug: 'candles' },
    ],
  },
  {
    id: 'gift-sets',
    name: {
      ar: 'مجموعات الهدايا المتكاملة',
      en: 'Curated Gift Hampers',
    },
    slug: 'gift-sets',
    description: {
      ar: 'بكجات إهداء متكاملة تجمع بين باقات الورد، الشوكولاتة الفاخرة، والعطور في بوكس إهداء ملكي.',
      en: 'Harmonious gift bundles uniting fresh flowers, gourmet sweets, and fine fragrances in signature gift hampers.',
    },
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    seoTitle: {
      ar: 'بكجات هدايا فخمة متكاملة لجميع المناسبات | غراس فلوريست',
      en: 'Luxury Gift Sets & Floral Hampers | Grass Florist',
    },
    seoDescription: {
      ar: 'وفر عناء الاختيار مع مجموعات الهدايا المتكاملة من غراس فلوريست: زهور، شوكولاتة، وعطور في باقة واحدة.',
      en: 'Effortless luxury gifting: curated combinations of fresh flowers, gourmet treats, and keepsake treasures from Grass Florist.',
    },
    featured: true,
    itemCount: 6,
    subcategories: [
      { id: 'anniversary-sets', name: { ar: 'مجموعات ذكرى الزواج', en: 'Anniversary Hampers' }, slug: 'anniversary-sets' },
      { id: 'birthday-sets', name: { ar: 'مجموعات أعياد الميلاد', en: 'Birthday Celebrations' }, slug: 'birthday-sets' },
      { id: 'newborn-sets', name: { ar: 'مجموعات استقبال المواليد', en: 'New Baby Hampers' }, slug: 'newborn-sets' },
    ],
  },
];
