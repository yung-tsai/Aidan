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
        "chat-bg": "hsl(var(--chat-bg))",
        "input-bg": "hsl(var(--input-bg))",
        "toolbar-bg": "hsl(var(--toolbar-bg))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        "text-divider": "hsl(var(--text-divider))",
        "text-icon": "hsl(var(--text-icon))",
        // Terminal theme
        "terminal-bg": "hsl(var(--terminal-bg))",
        "terminal-surface": "hsl(var(--terminal-surface))",
        "terminal-text": "hsl(var(--terminal-text))",
        "terminal-glow": "hsl(var(--terminal-glow))",
        "terminal-accent": "hsl(var(--terminal-accent))",
        "terminal-border": "hsl(var(--terminal-border))",
        // Paper/Journal theme
        "paper-bg": "hsl(var(--paper-bg))",
        "paper-surface": "hsl(var(--paper-surface))",
        "paper-text": "hsl(var(--paper-text))",
        "paper-lines": "hsl(var(--paper-lines))",
        "paper-accent": "hsl(var(--paper-accent))",
        // Insights page grayscale palette
        "insights-bg": "hsl(0 0% 97%)",
        "insights-dark": "hsl(0 0% 7%)",
        "insights-border": "hsl(0 0% 16%)",
        "insights-gray-dark": "hsl(0 0% 13%)",
        "insights-gray-mid": "hsl(0 0% 27%)",
        "insights-gray-light": "hsl(0 0% 40%)",
        "insights-hover": "hsl(0 0% 94%)",
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
        mono: ['Reddit Mono', 'monospace'],
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
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
