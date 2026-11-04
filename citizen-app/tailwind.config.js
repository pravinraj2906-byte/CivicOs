/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CivicOS Primary Navy System (#123B6D)
        civic: {
          50: '#F0F5FA',
          100: '#E1EAF4',
          200: '#C3D5E9',
          300: '#95B6DC',
          400: '#6192CD',
          500: '#3972BE',
          600: '#285AA5',
          700: '#1F4784',
          800: '#183A6B',
          900: '#123B6D', // Official Primary Navy
          950: '#0C2548',
        },
        // CivicOS Saffron Action System (#F28C28)
        saffron: {
          50: '#FEF7EE',
          100: '#FDECD8',
          200: '#FBD6B1',
          300: '#F7B67F',
          400: '#F4944C',
          500: '#F28C28', // Official Saffron
          600: '#D66E14',
          700: '#B25211',
          800: '#8E4114',
          900: '#743714',
        },
        // CivicOS Civic Green System (#168447)
        civicgreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#168447', // Official Civic Green
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Neutral Surface & Text Palette
        surface: {
          bg: '#F7F9FC',
          white: '#FFFFFF',
          text: '#172033',
          muted: '#667085',
          border: '#E4E7EC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'control': '8px',
        'button': '12px',
        'card': '16px',
        'modal': '20px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(18, 59, 109, 0.05), 0 1px 2px -1px rgba(18, 59, 109, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(18, 59, 109, 0.08), 0 2px 6px -1px rgba(18, 59, 109, 0.04)',
        'elevated': '0 12px 32px -4px rgba(18, 59, 109, 0.12)',
        'modal': '0 20px 40px -8px rgba(18, 59, 109, 0.18)',
        'saffron-glow': '0 4px 14px 0 rgba(242, 140, 40, 0.28)',
        'navy-glow': '0 4px 14px 0 rgba(18, 59, 109, 0.22)',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
