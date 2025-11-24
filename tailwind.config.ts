import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#e5e7eb',
            
            a: {
              color: '#ec4899',
              '&:hover': {
                color: '#f472b6',
              },
            },
            
            h1: {
              color: '#a855f7',
            },
            h2: {
              color: '#a855f7',
            },
            h3: {
              color: '#a855f7',
            },
            h4: {
              color: '#a855f7',
            },
            
            code: {
              color: '#c084fc',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
            },
            
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            
            pre: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              code: {
                backgroundColor: 'transparent',
                padding: 0,
              },
            },
          },
        },
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
