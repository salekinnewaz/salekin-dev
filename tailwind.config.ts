import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        'bg-2': 'var(--color-bg-2)',
        fg: 'var(--color-fg)',
        'fg-2': 'var(--color-fg-2)',
        muted: 'var(--color-muted)',
        accent: 'var(--color-accent)',
        'accent-2': 'var(--color-accent-2)',
        'accent-soft': 'var(--color-accent-soft)',
        card: 'var(--color-card)',
        'card-hover': 'var(--color-card-hover)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
      },
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'mesh-drift': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-3%, 2%, 0) scale(1.05)' },
          '100%': { transform: 'translate3d(2%, -2%, 0) scale(1.02)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(-3px)' },
          '50%': { transform: 'translateY(3px)' },
        },
      },
      animation: {
        blink: 'blink 1s steps(2) infinite',
        'fade-in': 'fadeIn 200ms ease-out both',
        'gradient-pan': 'gradient-pan 8s ease-in-out infinite',
        'mesh-drift': 'mesh-drift 30s ease-in-out infinite alternate',
        marquee: 'marquee 40s linear infinite',
        pulse: 'pulse 2s ease-out infinite',
        'fade-up': 'fade-up 600ms ease both',
        shimmer: 'shimmer 3s linear infinite',
        'float-soft': 'float-soft 4.5s ease-in-out infinite',
      },
      backgroundImage: {
        'accent-gradient':
          'linear-gradient(120deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
        'mesh-radial':
          'radial-gradient(800px 600px at 20% 10%, color-mix(in oklab, var(--color-accent) 30%, transparent), transparent 60%)',
      },
    },
  },
  plugins: [],
};

export default config;
