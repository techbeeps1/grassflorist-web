import { Tajawal } from 'next/font/google';

export const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

// Backward compatibility alias
export const cairo = tajawal;
export const poppins = tajawal;
export const cormorantGaramond = tajawal;
export const plusJakartaSans = tajawal;
