import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change '/medicine-tracker/' to your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/medicine-tracker/',
})
