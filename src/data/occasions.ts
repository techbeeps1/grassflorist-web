import { LocalizedString } from '@/types/product';

export interface Occasion {
  id: string;
  name: LocalizedString;
  slug: string;
  description: LocalizedString;
  image: string;
  tag: string;
}

export const occasions: Occasion[] = [
  {
    id: 'congratulations',
    name: { ar: 'تهنئة وتبريكات', en: 'Congratulations' },
    slug: 'congratulations',
    description: {
      ar: 'زهور وتنسيقات فاخرة للاحتفال بأجمل الإنجازات والنجاحات.',
      en: 'Celebratory bouquets and luxury gifts to honor significant achievements.',
    },
    image: '/occasions/congratulations.webp',
    tag: 'congratulations',
  },
  {
    id: 'graduation',
    name: { ar: 'تخرج ونجاح', en: 'Graduation' },
    slug: 'graduation',
    description: {
      ar: 'باقات وقبعات تخرج أنيقة تتوج سنوات الجهد والتفوق.',
      en: 'Distinguished graduation flowers and keepsakes crowning academic success.',
    },
    image: '/occasions/graduation.webp',
    tag: 'graduation',
  },
  {
    id: 'anniversary',
    name: { ar: 'ذكرى سنوية', en: 'Anniversary' },
    slug: 'anniversary',
    description: {
      ar: 'تنسيقات رومانسية من الورد الجوري لتوثيق أروع لحظات الحب.',
      en: 'Romantic arrangements of velvety roses celebrating timeless devotion.',
    },
    image: '/occasions/anniversary.webp',
    tag: 'anniversary',
  },
  {
    id: 'wedding',
    name: { ar: 'زفاف وخطوبة', en: 'Wedding' },
    slug: 'wedding',
    description: {
      ar: 'أرقى باقات وتنسيقات العرائس لحفل زفاف أسطوري لا يُنسى.',
      en: 'Opulent bridal florals and heirloom arrangements for your dream wedding.',
    },
    image: '/occasions/wedding.webp',
    tag: 'wedding',
  },
  {
    id: 'housewarming',
    name: { ar: 'منزل مبارك', en: 'Housewarming' },
    slug: 'housewarming',
    description: {
      ar: 'نباتات ظل أنيقة تضفي حيوية ودفئاً على عتبات المنزل الجديد.',
      en: 'Lush indoor greenery and architectural plants blessing a new sanctuary.',
    },
    image: '/occasions/housewarming.webp',
    tag: 'housewarming',
  },
  {
    id: 'thank-you',
    name: { ar: 'شكر وامتنان', en: 'Thank You' },
    slug: 'thank-you',
    description: {
      ar: 'رسائل وردية راقية تعبر عن أصدق مشاعر الشكر والتقدير.',
      en: 'Express genuine gratitude and appreciation with bespoke floral designs.',
    },
    image: '/occasions/thank-you.webp',
    tag: 'thank-you',
  },
  {
    id: 'birthday',
    name: { ar: 'أعياد الميلاد', en: 'Birthday' },
    slug: 'birthday',
    description: {
      ar: 'باقات مبهجة وكيك طازج لصنع مفاجأة استثنائية تسعد القلوب.',
      en: 'Joyful blooms paired with artisan cakes for unforgettable celebrations.',
    },
    image: '/occasions/birthday.webp',
    tag: 'birthday',
  },
];
