/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark background stack
        void:    '#070A07',
        surface: '#0D130D',
        raised:  '#131A13',
        rim:     '#1E261E',
        // Volt green — primary brand
        volt: {
          DEFAULT: '#4ADE80',
          dim:     '#22C55E',
          muted:   '#16A34A',
          glow:    'rgba(74,222,128,0.12)',
          '10':    'rgba(74,222,128,0.10)',
          '20':    'rgba(74,222,128,0.20)',
        },
        // Ember — warnings / overdue
        ember: {
          DEFAULT: '#FB923C',
          dim:     '#F97316',
          glow:    'rgba(251,146,60,0.12)',
          '10':    'rgba(251,146,60,0.10)',
        },
        // Health colours
        healthy: { DEFAULT: '#4ADE80', bg: 'rgba(74,222,128,0.10)' },
        monitor: { DEFAULT: '#FCD34D', bg: 'rgba(252,211,77,0.10)'  },
        urgent:  { DEFAULT: '#FB923C', bg: 'rgba(251,146,60,0.10)'  },
        // Legacy aliases so existing classes still compile
        cream:   '#070A07',
        forest:  { DEFAULT: '#4ADE80', 50: 'rgba(74,222,128,0.06)', 100: 'rgba(74,222,128,0.10)', 200: 'rgba(74,222,128,0.20)', 600: '#16A34A' },
        terra:   { DEFAULT: '#FB923C', 50: 'rgba(251,146,60,0.06)',  100: 'rgba(251,146,60,0.10)' },
        sage:    { DEFAULT: '#4ADE80', 50:  'rgba(74,222,128,0.06)', 100: 'rgba(74,222,128,0.10)', 200: 'rgba(74,222,128,0.20)', 500: '#22C55E', 600: '#16A34A', 700: '#15803D' },
        bark:    '#F0FDF4',
        stone:   { 50: '#0D130D', 100: '#1E261E', 200: '#2A362A' },
        amber:   { 50: 'rgba(252,211,77,0.06)', 100: 'rgba(252,211,77,0.10)', 400: '#FCD34D', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
        'terra-50': 'rgba(251,146,60,0.06)',
        'terra-100': 'rgba(251,146,60,0.10)',
        'terra-600': '#EA580C',
        'terra-700': '#C2410C',
      },
      fontFamily: {
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif:   ['"Syne"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft:   '0 2px 16px rgba(0,0,0,0.4)',
        card:   '0 4px 24px rgba(0,0,0,0.5)',
        lifted: '0 8px 40px rgba(0,0,0,0.6)',
        volt:   '0 0 24px rgba(74,222,128,0.15)',
        glow:   '0 0 40px rgba(74,222,128,0.2)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 },                                     to: { opacity: 1 } },
        slideUp:     { from: { opacity: 0, transform: 'translateY(12px)' },      to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGentle: { '0%, 100%': { opacity: 1 },                               '50%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
}
