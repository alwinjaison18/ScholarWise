/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Modern typography scale following 8-point grid system
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],    // 14px
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],      // 16px - Base reading size
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],       // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],    // 60px
        '7xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],     // 72px
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '0.025em' }],         // 96px
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '0.025em' }],         // 128px
        
        // Semantic font sizes for specific use cases
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],       // Small captions, labels
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],     // Small body text
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],            // Primary body text
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],     // Large body text
        'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],   // Small headings
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],       // Standard headings
        'heading-lg': ['1.875rem', { lineHeight: '1.3', letterSpacing: '0.025em' }],  // Large headings
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],   // Small display
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],         // Display text
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],   // Large display
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '0.025em' }],          // Hero text
      }
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
