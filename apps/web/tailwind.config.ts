import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121215',
        surfaceHover: '#18181b',
        border: '#27272a',
        primary: {
          DEFAULT: '#facc15', // GIWA warm amber
          hover: '#eab308'
        }
      }
    }
  },
  plugins: []
}

export default config
