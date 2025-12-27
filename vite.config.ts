import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署配置
  // 如果部署到子路径（如 username.github.io/repo-name），需要设置 base
  // 如果部署到根路径（如 username.github.io），base 应该为 '/'
  base: process.env.GITHUB_PAGES === 'true' ? '/wechat-md/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
})

