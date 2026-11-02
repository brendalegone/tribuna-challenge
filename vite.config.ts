import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

// `npm run build`        → sitio para GitHub Pages (carpeta dist/)
// `npm run build:single` → un único index.html autocontenido (dist-single/), para compartir como archivo
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: mode === 'single' ? { outDir: 'dist-single' } : undefined,
}))
