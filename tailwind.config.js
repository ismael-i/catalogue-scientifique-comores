// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { opacity: '0.95' },
          '90%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-115px) scale(1.05)', opacity: '0' },
        },
        indeterminate: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(280%)' },
        },
        floatGlass: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(3px, -4px) rotate(2deg)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 2s ease-in infinite',
        indeterminate: 'indeterminate 1.4s ease-in-out infinite',
        floatGlass: 'floatGlass 3.2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
