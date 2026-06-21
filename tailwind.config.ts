import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD166',
        'gold-dim': '#FFB703',
        accent: '#FB8500',
        bg: '#050505',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease forwards',
        'slide-right': 'slide-right 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
      },
    },
  },
  plugins: [],
}
export default config