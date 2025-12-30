import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 如果部署到GitHub Pages的子路径，需要设置base路径
// 例如：如果仓库名是 'bentley'，则设置为 '/bentley/'
// 如果使用根域名或Firebase Hosting，设置为 '/'
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [vue()],
  base: base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

