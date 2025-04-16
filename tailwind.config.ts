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
        primary: {
          light: '#92c5c9',  
          DEFAULT: '#69a4a8', 
          dark: '#417378',   
        },
        neutral: {
          100: '#f9f9f9',   
          300: '#e4e4e4',    
          500: '#7a7a7a',   
          900: '#2a2a2a',   
        },
        accent: {
          gold: '#f8b500',    
          success: '#4caf50', 
          warning: '#ff9800', 
          error: '#f44336',  
        },
        transparent: 'transparent',
        current: 'currentColor',
        'white': '#ffffff',
        'purple': '#3f3cbb',
        'midnight': '#121063',
        'metal': '#565584'
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        72: '18rem',
        96: '24rem',
      },
      borderRadius: {
        lg: '0.5rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 4px 8px rgba(0, 0, 0, 0.1)', 
        button: '0 2px 6px rgba(0, 0, 0, 0.1)', 
      },
    },
  },
  plugins: [],
} satisfies Config;
