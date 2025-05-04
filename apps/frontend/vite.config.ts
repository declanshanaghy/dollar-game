import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✨ C0sm1c V1t3 C0nf1gur4t10n ✨
export default defineConfig({
  plugins: [react()],
  
  // The logo selection page is only accessible in development mode
  // This is controlled by the import.meta.env.MODE check in App.tsx
  build: {
    // Production optimizations
    minify: 'esbuild',
    sourcemap: false
  },
  
  // 🔮 Env1r0nm3nt v4r14bl3 c0nf1gur4t10n
  envPrefix: 'VITE_', // Only expose env variables prefixed with VITE_
  define: {
    // Make sure process.env is available in the client
    'process.env': {}
  }
})
