import { LocalizedString } from './product';

export interface FAQItem {
  id: string;
  category: 'ordering' | 'delivery' | 'flowerCare' | 'payments';
  question: LocalizedString;
  answer: LocalizedString;
}
