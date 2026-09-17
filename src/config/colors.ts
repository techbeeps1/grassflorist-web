/**
 * GRASS Florist — Centralized Color Library & Design Tokens
 * 
 * This file serves as the single source of truth for all brand colors, neutrals,
 * surfaces, typography tints, status indicators, and gradient schemes across the application.
 * 
 * Usage in TypeScript / React:
 * ```ts
 * import { colors } from '@/config/colors';
 * const primaryColor = colors.primary.DEFAULT;
 * ```
 * 
 * Usage in Tailwind CSS:
 * All tokens here are synchronized with `globals.css` and can be used directly as utility classes:
 * - `bg-primary`, `text-primary`, `border-primary`
 * - `bg-sand-50`, `bg-sand-100`, `bg-sand-200`, `border-sand-300`, `text-sand-800`
 * - `bg-surface-subtle`, `text-text-main`, `border-border`
 */

export const colors = {
  // ==========================================
  // 1. PRIMARY PALETTE (Forest & Botanical Greens)
  // ==========================================
  primary: {
    DEFAULT: '#435849',       // Core brand forest green (buttons, active states, key icons)
    hover: '#344539',         // Deep forest green on hover / active press
    dark: '#2D3F33',          // Dark botanical tone for dark modals and high-contrast accents
    darkHover: '#202E25',     // Deepest botanical hover
    light: '#EBF1ED',         // Soft pastel mint background for badges and highlights
    muted: '#6D8675',         // Muted botanical green for secondary accents
    subtle: '#F2F6F3',        // Ultra-light mint tint
    border: '#435849',        // Primary border highlight
  },

  // ==========================================
  // 2. SECONDARY PALETTE (Warm Sand Gold & Champagne)
  // ==========================================
  secondary: {
    DEFAULT: '#CEB8A8',       // Warm champagne / camel tone
    hover: '#BD9E8A',         // Richer champagne on hover
    light: '#FAF3ED',         // Soft glowing warm cream
    muted: '#D8C3B5',         // Muted champagne sand
    border: '#D5C6B5',        // Warm champagne border
  },

  // ==========================================
  // 3. ACCENT PALETTE (Terracotta, Bronze & Warm Brown)
  // ==========================================
  accent: {
    DEFAULT: '#B08E77',       // Warm terracotta / bronze accent
    hover: '#987760',         // Deep bronze hover
    light: '#F7EFE8',         // Light bronze blush
    brown: '#8C6D58',         // Artisanal warm brown (icons, badges)
    gold: '#D4AF37',          // Metallic luxury gold
    rating: '#F5A623',        // Review star gold
  },

  // ==========================================
  // 4. SAND & NEUTRALS (Full Soft Sand Palette Scale)
  // ==========================================
  sand: {
    50: '#FAF7F2',            // Warm off-white / base subtle surface
    100: '#FAF3ED',           // Light sand cream (banner gradient start)
    150: '#F4ECE2',           // Neutral sand mid-tone (banner gradient mid)
    200: '#EFE7DC',           // Signature Grass sand base (announcement bar, footer bg)
    250: '#EAE0D3',           // Rich sand tone (banner gradient end)
    300: '#E4D8CB',           // Standard container & section borders
    350: '#E2D5C4',           // Card and divider borders
    400: '#D5C6B5',           // Interactive input and checkbox borders
    500: '#A6998E',           // Input placeholders and soft captions
    600: '#8C8075',           // Subdued meta info, timestamps, helper text
    700: '#5C524B',           // Main body paragraph text (high readability warm charcoal)
    800: '#25211E',           // Primary dark text (headings, title banners)
    900: '#1E1915',           // Deepest warm espresso black (bold typography)
  },

  // ==========================================
  // 5. SURFACES & BACKGROUNDS
  // ==========================================
  surface: {
    DEFAULT: '#FFFFFF',       // Pure white base for cards, inputs, and modals
    pure: '#FFFFFF',          // Pure white
    card: '#FDFBF7',          // Warm elevated card surface
    subtle: '#FAF7F2',        // Subtle warm background for sections
    sand: '#EFE7DC',          // Sand surface (announcement bar, footer)
    warm: '#F4ECE1',          // Warm pill toggle backgrounds
    dark: '#1E1915',          // Dark mode / high-contrast modal background
  },

  // ==========================================
  // 6. TYPOGRAPHY (Text Shades)
  // ==========================================
  text: {
    main: '#1E1915',          // Deep warm black (H1, H2, titles)
    heading: '#25211E',       // Primary heading dark tone
    body: '#5C524B',          // Warm readable body text
    secondary: '#5C524B',     // Secondary label & caption text
    muted: '#8C8075',         // Subdued & inactive labels
    placeholder: '#A6998E',   // Form placeholder text
    inverse: '#FFFFFF',       // White text on dark/colored backgrounds
  },

  // ==========================================
  // 7. BORDERS & DIVIDERS
  // ==========================================
  border: {
    DEFAULT: '#E4D8CB',       // Standard section & card border
    light: '#EFE6DB',         // Subtle container border
    subtle: '#EFE8DE',        // Ultra-light modal and card border
    sand: '#E2D5C4',          // Sand accent divider
    input: '#E2D8CC',         // Form input border
    focus: '#435849',         // Focused input / active border
  },

  // ==========================================
  // 8. SEMANTIC & STATUS COLORS
  // ==========================================
  semantic: {
    success: {
      DEFAULT: '#435849',     // Botanical green success
      bg: '#EBF1ED',          // Light success badge background
      border: '#D1E0D6',      // Success border
      text: '#2D3F33',        // Dark success text
    },
    warning: {
      DEFAULT: '#BA8038',     // Warm amber warning
      bg: '#FFF8EB',          // Light warning background
      border: '#FDE68A',      // Warning border
      text: '#92400E',        // Dark warning text
    },
    error: {
      DEFAULT: '#C6565F',     // Rose crimson error
      bg: '#FDF2F2',          // Light error background
      border: '#FECACA',      // Error border
      text: '#991B1B',        // Dark error text
    },
    info: {
      DEFAULT: '#3B82F6',     // Info blue
      bg: '#EFF6FF',          // Light info background
      border: '#BFDBFE',      // Info border
      text: '#1E40AF',        // Dark info text
    },
  },

  // ==========================================
  // 9. OTHER & SPECIALTY COLORS
  // ==========================================
  other: {
    whatsapp: '#25D366',      // WhatsApp brand green
    whatsappDark: '#1EBE5D',  // WhatsApp hover shade
    starGold: '#F5A623',      // Rating stars gold
    overlay: 'rgba(30, 25, 21, 0.45)', // Modal backdrop overlay
    cardShadow: 'rgba(45, 36, 28, 0.07)', // Warm luxury card shadow
    gradients: {
      sandVipBanner: 'linear-gradient(to right, #FAF3ED, #F4ECE2, #EAE0D3)',
      heroSubtle: 'linear-gradient(180deg, #FAF7F2 0%, #FFFFFF 100%)',
      botanicalGlow: 'radial-gradient(circle, rgba(67, 88, 73, 0.08) 0%, transparent 70%)',
    },
  },
} as const;

export type ColorLibrary = typeof colors;

/**
 * Utility helper to apply alpha opacity to a 6-digit hex color
 * Example: `withOpacity(colors.primary.DEFAULT, 0.15)` -> `rgba(67, 88, 73, 0.15)`
 */
export function withOpacity(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
