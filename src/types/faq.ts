import { LocalizedString } from './product';

export interface FAQItem {
  id: string;
  category: string;
  question: LocalizedString;
  answer: LocalizedString;
  sort_order?: number;
}
