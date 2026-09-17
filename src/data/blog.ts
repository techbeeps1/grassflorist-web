import { BlogPost } from '@/types/blog';

export const blogPosts: BlogPost[] = [
  {
    id: 'post-01',
    slug: {
      ar: 'how-to-keep-cut-flowers-fresh-longer',
      en: 'how-to-keep-cut-flowers-fresh-longer',
    },
    title: {
      ar: 'دليل الخبراء: 7 خطوات ذهبية للحفاظ على نضارة باقات الورد لأكثر من 10 أيام',
      en: 'Master Florist Guide: 7 Essential Steps to Extend Flower Vase Life Past 10 Days',
    },
    excerpt: {
      ar: 'تعرف على الطرق العلمية المتبعة في أرقى بوتيكات الزهور لقص السيقان، تغيير الماء، واستخدام المغذيات الطبيعية لإبقاء الزهور يانعة وفواحة.',
      en: 'Learn the scientific practices employed by high-end floral ateliers to trim stems, optimize water hydration, and prevent premature wilting.',
    },
    content: {
      ar: `باقات الزهور الطبيعية ليست مجرد هدية عابرة، بل هي لوحة فنية نابضة بالحياة تضفي على المنزل بهجة لا مثيل لها. للحفاظ على نضارة زهورك لأطول فترة ممكنة، اتبع هذه النصائح الذهبية من خبراء غراس فلوريست:

### 1. تقليم السيقان بزاوية 45 درجة تحت الماء الجاري
عند استلام باقة الزهور، قم بقص 2 إلى 3 سنتيمترات من أسفل كل ساق بزاوية 45 درجة باستخدام مقص حاد أو سكين نظيف. القص المائل يزيد من مساحة السطح الماص للماء ويمنع الساق من الاستقرار بشكل مسطح في قاع الفازة مما يسد قنوات امتصاص الماء.

### 2. إزالة الأوراق السفلية لمنع تكاثر البكتيريا
أي ورقة خضراء تغمر تحت مستوى الماء في الفازة سوف تتحلل وتصبح بيئة خصبة لتكاثر البكتيريا التي تسد الأوعية الدقيقة في ساق الوردة وتسرع ذبولها. احتفظ فقط بالأوراق العلوية القريبة من الزهرة.

### 3. تنظيف الفازة بالماء والصابون قبل الاستخدام
الفازة النظيفة تماماً هي نصف سر طول عمر الزهور. تأكد من غسل الفازة جيداً بالماء الفاتر والصابون للتخلص من أي ترسبات بكتيرية سابقة قبل ملئها بماء بارد ونظيف.

### 4. استخدام كيس غذاء الزهور المرفق
يحتوي غذاء الزهور المرفق مع باقات غراس فلوريست على ثلاثة عناصر أساسية: السكر لتغذية البتلات، منظم حموضة (pH) لتحسين سرعة تدفق الماء، ومثبط بكتيري يمنع تعفن الماء.

### 5. إبعاد الفازة عن مصادر الحرارة والفاكهة
تجنب وضع باقة الزهور تحت أشعة الشمس المباشرة أو بالقرب من فتحات التكييف الحار أو البارد. والأهم من ذلك: لا تضع الزهور بجوار سلة الفواكه، حيث تطلق الفواكه الناضجة (خاصة الموز والتفاح) غاز الإيثيلين الذي يسرع شيخوخة الزهور وذبولها.

باتباع هذه الخطوات البسيطة، ستستمتع بجمال وعبير باقتك الملكية لأيام طويلة تتجاوز الأسبوعين بكل تألق.`,
      en: `Fresh flower bouquets are an exquisite sensory addition to your living space. To ensure your stems remain radiant for ten days or longer, apply these expert protocols from the Grass Florist Atelier:

### 1. Cut Stems at a 45-Degree Angle
Upon receiving your arrangement, snip approximately 2 to 3 centimeters from the base of each stem diagonally using sharp floral shears. Cutting at an angle expands the surface area for hydration uptake and prevents stems from resting flat against the vase bottom.

### 2. Strip Submerged Leaves
Any foliage resting below the waterline will deteriorate, introducing microbial contamination that clogs vascular conduits in the stems. Ensure only clean, bare stems inhabit the vase reservoir.

### 3. Sanitize Your Vessel
A spotless vase is essential. Cleanse glass or ceramic vessels with warm soapy water to eliminate residual bacteria before replenishing with chilled, clean water.

### 4. Administer Floral Nutrients
The preservative sachet included with Grass Florist arrangements supplies sucrose for cellular nourishment, an acidifier to balance water pH, and a gentle antimicrobial agent to suppress bacterial bloom.

### 5. Position Away from Drafts and Ripe Fruit
Shield your blooms from direct sunlight, air-conditioning vents, and fruit bowls. Ripening fruits—especially bananas and apples—emit ethylene gas, which triggers premature floral senescence.`,
    },
    coverImage: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: { ar: 'مها التميمي', en: 'Maha Al-Tamimi' },
      role: { ar: 'كبيرة منسقي الزهور في غراس فلوريست', en: 'Master Floral Designer at Grass Florist' },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    category: { ar: 'العناية بالزهور', en: 'Floral Care' },
    categorySlug: 'flower-care',
    publishedAt: '2026-03-10',
    readTime: 5,
    tags: ['flower-care', 'roses', 'tips', 'lifestyle'],
    seoTitle: {
      ar: 'كيف تحافظ على نضارة باقات الورد لأكثر من 10 أيام | مدونة غراس فلوريست',
      en: 'How to Keep Flower Bouquets Fresh for 10+ Days | Grass Florist Journal',
    },
    seoDescription: {
      ar: 'أفضل الطرق والخطوات العملية لإطالة عمر باقات الورد والزهور الطبيعية في المنزل.',
      en: 'Discover florist-approved techniques to keep cut flower arrangements fresh and vibrant.',
    },
  },
  {
    id: 'post-02',
    slug: {
      ar: 'ultimate-guide-to-choosing-anniversary-flowers',
      en: 'ultimate-guide-to-choosing-anniversary-flowers',
    },
    title: {
      ar: 'الدليل الشامل لاختيار زهور ذكرى الزواج: معاني الألوان وعدد الورود',
      en: 'The Connoisseur’s Guide to Wedding Anniversary Flowers: Color Symbolism & Numbers',
    },
    excerpt: {
      ar: 'من الجوري الأحمر القرمزي إلى أزهار الليليوم البيضاء، اكتشف لغة الزهور الرمزية وكيف تختار الباقة المثالية للاحتفال بشريك حياتك.',
      en: 'From deep crimson roses to delicate white lilies, master the nuanced language of floral varieties and select the ultimate anniversary gesture.',
    },
    content: {
      ar: `تحمل كل زهرة وكل لون في عالم البستنة الملكية رمزية شعرية تعبر عن أعمق مشاعر الحب والولاء والتقدير. إذا كنت تخطط للاحتفال بذكرى زواجك أو مناسبة خاصة مع شريك حياتك، فإليك هذا الدليل لاختيار التنسيق المثالي:

### الورد الجوري الأحمر: رمز الحب والشغف الأبدي
الجوري الأحمر هو الخيار الكلاسيكي الأول لذكرى الزواج، والسر يكمن في دلالته على العاطفة العميقة والالتزام الصادق. اختيار 50 وردة يعبر عن حب راسخ وعطاء غير مشروط، بينما تعبر باقة 25 وردة عن مشاعر التقدير والاحترام المتبادل.

### درجات الوردي والباستيل: الامتنان والرقة
إذا كان شريكك يفضل الألوان الهادئة، فإن درجات الوردي والبلش واللافندر تعبر عن الإعجاب والامتنان لحضورها في حياتك. تتميز باقات الباستيل بقدرتها على نقل مشاعر الدفء المنزلي والسكينة.

### باقات الصناديق المخملية: الفخامة التي تدوم
تعتبر الصناديق المخملية الدائرية خياراً رائعاً لحفلات العشاء والذكرى السنوية، حيث لا تحتاج إلى البحث عن فازة وتظل قطعة ديكور فخمة في غرفة النوم لعدة أيام.

في غراس فلوريست، نسعد بمساعدتك في اختيار التنسيق المخصص مع إضافة الشوكولاتة البلجيكية وبطاقة الإهداء بالخط الديواني الملكي لجعل ليلتكم لا تُنسى.`,
      en: `In the botanical arts, every bloom and tint carries historical and poetic symbolism. For an anniversary, choose with intentional elegance:

### Velvet Crimson Roses: The Emblem of Devotion
Red roses remain the timeless standard for romantic milestones. Fifty stems celebrate profound commitment and enduring admiration, while twenty-five convey sincere gratitude and devotion.

### Blush & Soft Pastels: Tenderness & Grace
For partners who favor subtle palettes, blush garden roses, peonies, and lavender sprays convey quiet romance and domestic serenity.

### Velvet Keepsake Boxes: Opulence and Ease
Hatbox arrangements presented in plush velvet cylinders eliminate the need for vases, providing an instant luxury display piece that graces dressing tables for days.`,
    },
    coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: { ar: 'يوسف الشهري', en: 'Yousef Al-Shehri' },
      role: { ar: 'مستشار الهدايا والبروتوكول', en: 'Gifting & Protocol Consultant' },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    category: { ar: 'أدلة الإهداء', en: 'Gifting Guides' },
    categorySlug: 'gifting-guides',
    publishedAt: '2026-03-05',
    readTime: 4,
    tags: ['anniversary', 'romance', 'gift-ideas', 'roses'],
    seoTitle: {
      ar: 'دليل اختيار زهور ذكرى الزواج ومعاني ألوان الورد | غراس فلوريست',
      en: 'How to Choose Anniversary Flowers | Grass Florist Gifting Guide',
    },
    seoDescription: {
      ar: 'تعرف على معاني ألوان وعدد زهور باقات ذكرى الزواج والارتباط لاختيار الهدية المثالية.',
      en: 'Complete guide to anniversary flowers, rose color meanings, and luxury gifting advice.',
    },
  },
  {
    id: 'post-03',
    slug: {
      ar: 'top-indoor-plants-for-purifying-home-air',
      en: 'top-indoor-plants-for-purifying-home-air',
    },
    title: {
      ar: 'أفضل 5 نباتات داخلية لتنقية هواء المنزل والمكتب وفق دراسات ناسا',
      en: 'Top 5 Indoor Plants for Purifying Home and Office Air According to NASA',
    },
    excerpt: {
      ar: 'استكشف النباتات الخضراء التي تمتص المركبات العضوية وتطلق الأكسجين المنعش مع إرشادات مبسطة للعناية والري.',
      en: 'Discover living houseplants scientifically validated to absorb toxins, produce fresh oxygen, and enhance indoor well-being.',
    },
    content: {
      ar: `قضاء معظم أوقاتنا داخل المنازل والمكاتب المكيفة يجعل جودة الهواء الداخلي أمراً بالغ الأهمية لصحتنا وراحتنا النفسية. أثبتت أبحاث وكالة ناسا للفضاء أن بعض النباتات المنزلية تعمل كفلاتر حيوية طبيعية لتنقية الهواء من المركبات الضارة. إليك أفضل 5 نباتات يمكنك اقتناؤها:

### 1. زنبق السلام (Peace Lily - Spathiphyllum)
نبتة أنيقة بأزهار بيضاء شمعية وأوراق خضراء عريضة. تتميز بقدرتها الاستثنائية على امتصاص خمسة ملوثات رئيسية تشمل البنزين والفورمالديهايد ورابع كلورو الإيثيلين. كما أنها نبتة تخبرك عندما تحتاج إلى الماء من خلال انحناء خفيف في أوراقها.

### 2. نبات جلد النمر (Snake Plant - Sansevieria)
تعتبر النبتة المثالية لغرف النوم لأنها على عكس معظم النباتات تطلق الأكسجين وتمتص ثاني أكسيد الكربون ليلاً. كما أنها قادرة على البقاء لأسابيع دون ري وتتحمل قلة الإضاءة بسهولة.

### 3. نبتة المونستيرا (Monstera Deliciosa)
بأوراقها العريضة المقسمة، تعتبر المونستيرا من أفضل النباتات التي ترفع نسبة الرطوبة الطبيعية في الغرف الجافة المكيفة وتمنح شعوراً رائعاً بالانتعاش الاستوائي.

### 4. نبتة الزاميا (ZZ Plant)
النبتة التي لا تقهر! أوراقها اللامعة تخزن الماء بكفاءة عالية في سيقانها، مما يجعلها مثالية للمكاتب والأشخاص المشغولين دائمي السفر.

في بوتيك غراس فلوريست، نوفر جميع هذه النباتات مغروسة في مراكن سيراميك وحجرية فاخرة جاهزة لتزيين مساحتك بجمال الطبيعة النقي.`,
      en: `Indoor air quality directly impacts cognitive performance and restful sleep. NASA Clean Air research established that living indoor foliage actively absorbs airborne volatile organic compounds.

### 1. Peace Lily (Spathiphyllum)
An architectural powerhouse with glossy leaves and white blossoms that filters benzene, formaldehyde, and ammonia.

### 2. Sansevieria (Snake Plant)
The optimal bedroom companion. Unlike most plants, it converts carbon dioxide into oxygen throughout the nighttime hours.

### 3. Monstera Deliciosa
Its broad foliage increases natural humidity in dry, air-conditioned rooms, creating a soothing sanctuary.

### 4. ZZ Plant (Zamioculcas Zamiifolia)
Virtually indestructible with mirror-gloss foliage that thrives in low light with minimal watering.`,
    },
    coverImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: { ar: 'د. سارة المنصور', en: 'Dr. Sarah Al-Mansoor' },
      role: { ar: 'أخصائية التصميم البيئي والبستنة', en: 'Botanical & Biophilic Design Specialist' },
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    },
    category: { ar: 'نباتات داخلية', en: 'Indoor Botany' },
    categorySlug: 'indoor-plants',
    publishedAt: '2026-02-24',
    readTime: 6,
    tags: ['plants', 'air-purifying', 'wellness', 'decor'],
    seoTitle: {
      ar: 'أفضل 5 نباتات لتنقية هواء المنزل وفق دراسات ناسا | غراس فلوريست',
      en: '5 Best Air-Purifying Indoor Plants | NASA Guide | Grass Florist',
    },
    seoDescription: {
      ar: 'تعرف على النباتات المنزلية المنقية للهواء والمزيلة للسموم وطرق العناية بها.',
      en: 'Top air-purifying indoor plants recommended for healthy home and office environments.',
    },
  },
];
