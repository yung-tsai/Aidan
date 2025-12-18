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
        // Terminal theme
        "terminal-bg": "hsl(var(--terminal-bg))",
        "terminal-surface": "hsl(var(--terminal-surface))",
        "terminal-text": "hsl(var(--terminal-text))",
        "terminal-glow": "hsl(var(--terminal-glow))",
        "terminal-accent": "hsl(var(--terminal-accent))",
        "terminal-border": "hsl(var(--terminal-border))",
        "terminal-dim": "hsl(var(--terminal-dim))",
        "terminal-muted": "hsl(var(--terminal-muted))",
        // CRT frame
        "crt-frame": "hsl(var(--crt-frame))",
        "crt-bezel": "hsl(var(--crt-bezel))",
        "crt-shadow": "hsl(var(--crt-shadow))",
        // Status colors
        "status-active": "hsl(var(--status-active))",
        "status-warning": "hsl(var(--status-warning))",
        "status-error": "hsl(var(--status-error))",
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
        mono: ['VT323', 'monospace'],
        'ibm': ['IBM Plex Mono', 'monospace'],
        'vt323': ['VT323', 'monospace'],
        'typewriter': ['Special Elite', 'monospace'],
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
        "blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 4px hsl(var(--terminal-glow))",
            opacity: "1",
          },
          "50%": { 
            boxShadow: "0 0 12px hsl(var(--terminal-glow))",
            opacity: "0.8",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blink": "blink 1s step-end infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
