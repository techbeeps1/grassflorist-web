export const theme = {
  colors: {
    // Brand Core - Inspired by Soft Sand & Botanical Refinement
    primary: '#435849', // Refined Botanical Olive-Sage (Strong contrast for buttons & interactive states)
    primaryHover: '#334438',
    primaryLight: '#EBF1EC', // Pastel Sage Dew
    primaryMuted: '#6D8675',

    secondary: '#CEB8A8', // Dusty Rose-Sand (Soft Sand Swatch 5)
    secondaryHover: '#BD9E8A',
    secondaryLight: '#FAF3ED', // Soft Blush Petal
    secondaryMuted: '#D8C3B5',

    accent: '#B08E77', // Warm Sandstone / Terracotta
    accentHover: '#987760',
    accentLight: '#F7EFE8',

    blush: '#F9F0EB', // Soft delicate blush
    peach: '#FAF3EB', // Soft warm peach
    lavender: '#F4EFF6', // Subtle muted lavender whisper

    // Surfaces & Neutrals - Clean Base + Soft Sand Pastel Alternations
    background: '#FFFFFF', // Clean White canvas
    backgroundAlt: '#EFE7DC', // Soft Sand Cream Wash
    surface: '#FFFFFF', // Crisp clean cards
    surfaceSubtle: '#FAF7F2', // Warm Alabaster Silk
    surfaceElevated: '#FFFFFF',
    surfaceSand: '#EFE7DC', // Deeper Soft Sand Accent Surface

    // Typography - Dark Rich Contrast for Headings (WCAG AAA)
    text: '#201B18', // Dark Warm Espresso Charcoal
    textSecondary: '#5A5049', // Warm Earth Grey
    textMuted: '#877C74', // Soft Stone Taupe
    textInverse: '#FFFFFF',

    // Borders & Dividers - Soft Sand
    border: '#E4D8CB', // Soft Sand Border
    borderLight: '#EFE6DB',
    borderSand: '#E2D5C4',
    borderFocus: '#435849',

    // Semantic States
    success: '#4A7C59',
    successBg: '#EFF7F2',
    warning: '#BA8038',
    warningBg: '#FAF3EA',
    error: '#C6565F',
    errorBg: '#FAF0F1',
    info: '#4B778D',
    infoBg: '#F0F6F9',
  },

  typography: {
    heading: 'var(--font-heading), serif',
    body: 'var(--font-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    arabic: 'var(--font-arabic), -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, sans-serif',
  },

  radius: {
    none: '0px',
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.875rem',
    xl: '1.25rem',
    '2xl': '1.75rem',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(15, 76, 58, 0.04)',
    card: '0 4px 20px -2px rgba(22, 25, 29, 0.05), 0 2px 6px -1px rgba(22, 25, 29, 0.02)',
    hover: '0 12px 30px -4px rgba(15, 76, 58, 0.12), 0 4px 10px -2px rgba(22, 25, 29, 0.04)',
    elevated: '0 20px 40px -8px rgba(15, 76, 58, 0.15)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  layout: {
    container: '1280px',
    headerHeightDesktop: '80px',
    headerHeightMobile: '64px',
    announcementHeight: '36px',
  },
} as const;

export type Theme = typeof theme;
