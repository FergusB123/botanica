/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette
        canvas:  '#FFFFFF',
        card:    '#FAFAF9',
        border:  '#E5E5E2',
        'border-strong': '#C9C9C5',

        // Text
        jet:   '#111111',
        ink:   '#3F3F3C',
        dust:  '#8C8C88',
        ghost: '#F5F5F3',

        // Semantic plant colours (used sparingly)
        grove:   '#15803D',
        leaf:    '#22C55E',
        'leaf-bg': '#F0FDF4',
        gold:    '#D97706',
        'gold-bg': '#FFFBEB',
        crimson: '#DC2626',
        'crimson-bg': '#FEF2F2',
        cerulean: '#0284C7',
        'cerulean-bg': '#F0F9FF',

        // Legacy aliases so older code compiles
        void:    '#111111',
        surface: '#FAFAF9',
        raised:  '#F5F5F3',
        rim:     '#E5E5E2',
        volt:    { DEFAULT: '#15803D', dim: '#166534', muted: '#14532D', glow: 'rgba(21,128,61,0.1)', '10': 'rgba(21,128,61,0.10)', '20': 'rgba(21,128,61,0.20)' },
        ember:   { DEFAULT: '#D97706', dim: '#B45309', glow: 'rgba(217,119,6,0.1)', '10': 'rgba(217,119,6,0.10)' },
        forest:  { DEFAULT: '#15803D', 50: 'rgba(21,128,61,0.05)', 100: 'rgba(21,128,61,0.1)', 200: 'rgba(21,128,61,0.2)', 600: '#166534' },
        terra:   { DEFAULT: '#D97706', 50: 'rgba(217,119,6,0.05)', 100: 'rgba(217,119,6,0.1)', 600: '#92400E', 700: '#78350F' },
        sage:    { DEFAULT: '#22C55E', 50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
        bark:    '#111111',
        cream:   '#FFFFFF',
        stone:   { 50: '#FAFAF9', 100: '#E5E5E2', 200: '#C9C9C5' },
        amber:   { 50: '#FFFBEB', 100: '#FEF3C7', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        card:   '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        lifted: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        inner:  'inset 0 1px 2px rgba(0,0,0,0.06)',
        volt:   'none',
        glow:   'none',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.25s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 },                                to: { opacity: 1 } },
        slideUp:     { from: { opacity: 0, transform: 'translateY(8px)' },  to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGentle: { '0%,100%': { opacity: 1 },                           '50%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
}
