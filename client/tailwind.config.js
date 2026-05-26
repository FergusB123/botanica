/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAFAF7',
        forest: {
          DEFAULT: '#2D4A3E',
          50: '#f0f5f2',
          100: '#d9e8df',
          200: '#b3d1bf',
          300: '#76ae93',
          400: '#4d8f6e',
          500: '#2D4A3E',
          600: '#243d33',
          700: '#1b3027',
          800: '#12221b',
          900: '#09130f',
        },
        terra: {
          DEFAULT: '#C4622D',
          50: '#fdf4ef',
          100: '#fbe3d2',
          200: '#f5bea0',
          300: '#ec9063',
          400: '#e06a30',
          500: '#C4622D',
          600: '#a44e24',
          700: '#863c1c',
          800: '#672e14',
          900: '#4a1e0d',
        },
        sage: {
          DEFAULT: '#7A9E87',
          50: '#f2f6f3',
          100: '#e0ebe4',
          200: '#c0d8c9',
          300: '#9bbdaa',
          400: '#7A9E87',
          500: '#5f856e',
          600: '#4a6b57',
          700: '#3a5444',
          800: '#2b3f33',
          900: '#1b2922',
        },
        bark: '#1A1A16',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 16px rgba(26, 26, 22, 0.06)',
        card: '0 4px 24px rgba(26, 26, 22, 0.08)',
        lifted: '0 8px 32px rgba(26, 26, 22, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGentle: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      }
    },
  },
  plugins: [],
}
