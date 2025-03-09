import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: parseInt(env.VITE_PORT || 3889),
      host: '0.0.0.0',
      open: false,
      cors: true,
      proxy: {
        // 配置API代理
        '/api': {
          target: env.VITE_API_ENDPOINT,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      // 构建配置
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      // 减小构建体积
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      // 分块策略
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'ai-service': [
              './src/services/aiService.js',
              './src/services/documentService.js'
            ],
            'wps-api': [
              './src/utils/wpsApi.js'
            ]
          }
        }
      }
    },
    // 预览配置
    preview: {
      port: 8080,
      open: false,
      cors: true
    },
    // 定义环境变量
    define: {
      __VUE_OPTIONS_API__: false,
      __DEV__: mode === 'development',
      __PROD__: mode === 'production'
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  }
})
