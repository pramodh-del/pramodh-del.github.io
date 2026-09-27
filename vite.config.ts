import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `base: './'` keeps every asset path relative, so the same build works on
// GitHub Pages (any sub-path), Netlify, Vercel or a plain file server.
// `--mode single` inlines everything into one index.html for a portable preview.
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    base: './',
    plugins: [react(), ...(single ? [viteSingleFile()] : [])],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      assetsInlineLimit: single ? 100_000_000 : 4096,
      rollupOptions: single
        ? undefined
        : {
            output: {
              manualChunks(id: string) {
                if (!id.includes('node_modules')) return undefined
                if (/[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react'
                if (/[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
                if (/[\\/](gsap|lenis)[\\/]/.test(id)) return 'gsap'
                return undefined
              },
            },
          },
    },
  }
})
