import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        "background-end": "hsl(var(--background-end))",
        foreground: "hsl(var(--foreground))",
        // Braun device colors
        "device-body": "hsl(var(--device-body))",
        "device-face": "hsl(var(--device-face))",
        "device-inset": "hsl(var(--device-inset))",
        "device-shadow": "hsl(var(--device-shadow))",
        // Display colors
        "display-bg": "hsl(var(--display-bg))",
        "display-text": "hsl(var(--display-text))",
        "display-dim": "hsl(var(--display-dim))",
        // Control colors
        "control-bg": "hsl(var(--control-bg))",
        "control-border": "hsl(var(--control-border))",
        "control-active": "hsl(var(--control-active))",
        // Accent
        "braun-orange": "hsl(var(--braun-orange))",
        "braun-orange-glow": "hsl(var(--braun-orange-glow))",
        // Legacy terminal mappings
        "terminal-bg": "hsl(var(--terminal-bg))",
        "terminal-surface": "hsl(var(--terminal-surface))",
        "terminal-text": "hsl(var(--terminal-text))",
        "terminal-glow": "hsl(var(--terminal-glow))",
        "terminal-accent": "hsl(var(--terminal-accent))",
        "terminal-border": "hsl(var(--terminal-border))",
        "terminal-dim": "hsl(var(--terminal-dim))",
        "terminal-muted": "hsl(var(--terminal-muted))",
        "terminal-highlight": "hsl(var(--terminal-highlight))",
        "status-active": "hsl(var(--status-active))",
        "status-warning": "hsl(var(--status-warning))",
        "status-error": "hsl(var(--status-error))",
        "status-success": "hsl(var(--status-success))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        mono: ['Space Mono', 'Monaco', 'Inconsolata', 'monospace'],
        'dm': ['DM Sans', 'sans-serif'],
        'space': ['Space Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "breathe": {
          "0%, 100%": { 
            transform: "scale(1)",
            opacity: "0.6",
          },
          "50%": { 
            transform: "scale(1.15)",
            opacity: "1",
          },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 hsl(var(--braun-orange) / 0)",
          },
          "50%": { 
            boxShadow: "0 0 0 12px hsl(var(--braun-orange) / 0.15)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "breathe": "breathe 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
