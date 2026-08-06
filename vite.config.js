import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use base: './' for root-hosted deploys (Vercel, Netlify).
// For GitHub Pages subpath hosting, set base: '/genai-platform/'.
export default defineConfig({
  plugins: [react()],
  base: './',
})
