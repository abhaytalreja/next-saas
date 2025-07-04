const { fontFamily } = require("tailwindcss/defaultTheme")
const designTokens = require("../design-tokens/brand-tokens.json")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Legacy CSS variables for backward compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // NextSaaS Design System Colors
        primary: {
          ...designTokens.tokens.colors.brand.primary,
          DEFAULT: designTokens.tokens.colors.brand.primary[500],
          foreground: "#ffffff",
        },
        secondary: {
          ...designTokens.tokens.colors.brand.secondary,
          DEFAULT: designTokens.tokens.colors.brand.secondary[500],
          foreground: "#ffffff",
        },
        accent: {
          ...designTokens.tokens.colors.brand.accent,
          DEFAULT: designTokens.tokens.colors.brand.accent[500],
          foreground: "#ffffff",
        },
        
        // Semantic colors
        success: designTokens.tokens.colors.semantic.success,
        warning: designTokens.tokens.colors.semantic.warning,
        error: designTokens.tokens.colors.semantic.error,
        destructive: {
          ...designTokens.tokens.colors.semantic.error,
          DEFAULT: designTokens.tokens.colors.semantic.error[500],
          foreground: "#ffffff",
        },
        info: designTokens.tokens.colors.semantic.info,
        
        // Neutral colors
        neutral: designTokens.tokens.colors.neutral,
        
        // Component-specific colors
        muted: {
          DEFAULT: designTokens.tokens.colors.neutral[100],
          foreground: designTokens.tokens.colors.neutral[600],
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: designTokens.tokens.colors.neutral[900],
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: designTokens.tokens.colors.neutral[900],
        },
        
        // Extended brand colors
        extended: designTokens.tokens.colors.extended,
      },
      borderRadius: {
        ...designTokens.tokens.borderRadius,
        // Legacy values for backward compatibility
        lg: "var(--radius, 0.5rem)",
        md: "calc(var(--radius, 0.5rem) - 2px)",
        sm: "calc(var(--radius, 0.5rem) - 4px)",
      },
      fontFamily: {
        sans: designTokens.tokens.typography.fontFamilies.sans,
        serif: designTokens.tokens.typography.fontFamilies.serif,
        mono: designTokens.tokens.typography.fontFamilies.mono,
        display: designTokens.tokens.typography.fontFamilies.display,
      },
      fontSize: designTokens.tokens.typography.fontSizes,
      fontWeight: designTokens.tokens.typography.fontWeights,
      lineHeight: designTokens.tokens.typography.lineHeights,
      letterSpacing: designTokens.tokens.typography.letterSpacing,
      spacing: designTokens.tokens.spacing,
      boxShadow: {
        ...designTokens.tokens.shadows,
        // Custom elevated shadows
        'elevated-card': designTokens.tokens.shadows.elevated,
        'interactive-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        // Legacy animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // NextSaaS animations
        "fadeIn": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slideIn": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "scaleIn": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        // Legacy animations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // NextSaaS animations
        "fade-in": "fadeIn 0.2s ease-out forwards",
        "slide-in": "slideIn 0.3s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
      },
      transitionTimingFunction: {
        'smooth': designTokens.tokens.animation.easing.smooth,
      },
      transitionDuration: designTokens.tokens.animation.duration,
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Conditionally load optional plugins
    ...(function() {
      const plugins = [];
      try {
        plugins.push(require("@tailwindcss/forms"));
      } catch (e) {
        console.warn("@tailwindcss/forms not found, skipping...");
      }
      try {
        plugins.push(require("@tailwindcss/typography"));
      } catch (e) {
        console.warn("@tailwindcss/typography not found, skipping...");
      }
      return plugins;
    })(),
    // Custom plugin for NextSaaS-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            'box-shadow': `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
        },
        '.interactive-hover': {
          'transition': 'all 0.2s cubic-bezier(0.2, 0, 0.13, 1.5)',
          '&:hover': {
            'transform': 'translateY(-1px)',
            'box-shadow': theme('boxShadow.interactive-hover'),
          },
        },
        '.elevated-card': {
          'box-shadow': theme('boxShadow.elevated-card'),
          'border-radius': theme('borderRadius.lg'),
          'background-color': theme('colors.white'),
          'border': `1px solid ${theme('colors.neutral.200')}`,
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}