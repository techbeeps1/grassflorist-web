import { LocalizedString } from '@/types/product';

export interface Testimonial {
  id: string;
  name: LocalizedString;
  city: LocalizedString;
  avatar: string;
  rating: number;
  comment: LocalizedString;
  occasion: LocalizedString;
  verified: boolean;
  productName: LocalizedString;
}

export const testimonials: Testimonial[] = [
  {
    id: 't-01',
    name: { ar: 'سارة الدوسري', en: 'Sara Al-Dossary' },
    city: { ar: 'الرياض', en: 'Riyadh' },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: {
      ar: 'طلبت باقة الجوري القرمزي لذكرى زواجي، وصلت في سيارة مبردة خلال أقل من ساعتين وكان التغليف والبطاقة المكتوبة بخط اليد قمة في الفخامة والذوق.',
      en: 'Ordered the Royal Crimson roses for my anniversary. Delivered in a chilled vehicle in under two hours. The handwritten card calligraphy and presentation were beyond exquisite.',
    },
    occasion: { ar: 'ذكرى زواج', en: 'Wedding Anniversary' },
    verified: true,
    productName: { ar: 'باقة الجوري الملكي القرمزي', en: 'Royal Crimson Grand Rose Bouquet' },
  },
  {
    id: 't-02',
    name: { ar: 'عبدالله السبيعي', en: 'Abdullah Al-Subaie' },
    city: { ar: 'جدة', en: 'Jeddah' },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: {
      ar: 'أفضل تجربة طلب زهور أونلاين في السعودية بلا منازع. الشوكولاتة البلجيكية كانت طازجة والورد بقي نضراً لأكثر من أسبوع في المنزل.',
      en: 'Undoubtedly the premier online floral experience in Saudi Arabia. The Belgian chocolates were decadent and the roses stayed vibrant for over eight days at home.',
    },
    occasion: { ar: 'عيد ميلاد', en: 'Birthday' },
    verified: true,
    productName: { ar: 'مجموعة الإمبراطورة الملكية', en: 'The Royal Empress Gift Hamper' },
  },
  {
    id: 't-03',
    name: { ar: 'ريم القحطاني', en: 'Reem Al-Qahtani' },
    city: { ar: 'الخبر', en: 'Khobar' },
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: {
      ar: 'أرسلت نبتة الأوركيد الأبيض لافتتاح عيادة صديقتي، كانت حديث الحضور لجودتها والوعاء السيراميكي المميز. شكراً فلوريل على الاحترافية العالية.',
      en: 'Sent the White Orchid for my friend’s clinic opening. It was the centerpiece of admiration. Thank you Florelle for your unmatched sophistication.',
    },
    occasion: { ar: 'افتتاح وتهنئة', en: 'Clinic Opening & Congratulations' },
    verified: true,
    productName: { ar: 'أوركيد فالينوبسيس الأبيض الملكي', en: 'Royal Cascade White Phalaenopsis' },
  },
  {
    id: 't-04',
    name: { ar: 'فيصل الشمري', en: 'Faisal Al-Shammari' },
    city: { ar: 'الرياض', en: 'Riyadh' },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: {
      ar: 'الاهتمام بالتفاصيل يجعلك تشعر أنك تشتري من أرقى دور الأزياء والزهور في باريس. التوصيل كان دقيقاً في الموعد المحدد تماماً.',
      en: 'The attention to detail makes you feel like you are purchasing from a haute couture atelier in Paris. Punctual delivery to the exact minute.',
    },
    occasion: { ar: 'ترقية وظيفية', en: 'Executive Promotion' },
    verified: true,
    productName: { ar: 'صندوق الأوركيد والورد المخملي', en: 'Emerald Velvet Cylinder Roses' },
  },
  {
    id: 't-05',
    name: { ar: 'نورة الغامدي', en: 'Noura Al-Ghamdi' },
    city: { ar: 'جدة', en: 'Jeddah' },
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: {
      ar: 'أجمل باقة ورد استلمتها على الإطلاق، التنسيق فاق كل التوقعات والورود بقيت يانعة ورائحتها تملأ المكان لأيام عديدة.',
      en: 'The most stunning arrangement I have ever received. The floral artistry surpassed all expectations and the stems remained fresh for days.',
    },
    occasion: { ar: 'هدية شكر وامتنان', en: 'Gratitude & Celebration' },
    verified: true,
    productName: { ar: 'باقة لافندر وسبرينغ باستيل', en: 'Pastel Spring Symphony' },
  },
  {
    id: 't-06',
    name: { ar: 'خالد بن منصور', en: 'Khalid Bin Mansour' },
    city: { ar: 'الدمام', en: 'Dammam' },
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    comment: {
      ar: 'خدمة راقية وسرعة استجابة مذهلة. التوصيل في سيارة مبردة حافظ على كل بتلة كأنها قُطفت قبل دقائق معدودة.',
      en: 'Impeccable service and rapid delivery. The chilled transport ensured every petal looked as if it had been picked just minutes ago.',
    },
    occasion: { ar: 'مناسبة خاصة', en: 'Private Gala' },
    verified: true,
    productName: { ar: 'تنسيق أوركيد فاخر', en: 'Imperial Orchid Centerpiece' },
  },
];

