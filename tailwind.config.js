/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cartoon: {
          pink: '#FF6B9D',
          blue: '#4ECDC4',
          yellow: '#FFE66D',
          purple: '#A78BFA',
          orange: '#FF8C42',
          green: '#6BCB77',
        }
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      }
    },
  },
  plugins: [],
}
