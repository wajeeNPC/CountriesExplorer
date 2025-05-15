import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      // Tailor the Tailwind CSS plugin configuration
      darkMode: 'class', // Enable class-based dark mode
      theme: {
        extend: {
          // You can extend the theme here if needed
        }
      }
    }),
  ],
})