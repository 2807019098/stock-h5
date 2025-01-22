import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import dayjs from 'dayjs'
import pkg from './package.json'
import viteCompression from 'vite-plugin-compression'
import { createHtmlPlugin } from 'vite-plugin-html'
import AutoComponents from 'unplugin-vue-components/vite'

const assetsDir = 'assets'

// __APP_INFO__
const { dependencies, devDependencies, name, version } = pkg
const appVersion = dayjs().format('YYYYMMDDHHmm')
const lastBuildTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  version: appVersion,
  lastBuildTime
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }): any => {
  const env = loadEnv(mode, process.cwd())
  console.log(env.VITE_PORT)
  return {
    plugins: [
      vue(),
      vueJsx(),
      // vueDevTools(),
      AutoImport({
        resolvers: [VantResolver()]
      }),
      Components({
        resolvers: [VantResolver()]
      }),
      viteCompression({
        verbose: true, // 默认
        disable: true, //开启压缩(不禁用)，默认
        deleteOriginFile: true, //删除源文件
        threshold: 10240, //压缩前最小文件大小
        algorithm: 'gzip', //压缩算法
        ext: '.gz' //文件类型
      }),
      createHtmlPlugin(),
      AutoComponents({
        dirs: ['./src/components'],
        extensions: ['vue', 'jsx', 'tsx'],
        dts: './src/auto-components.d.ts'
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: Number(env.VITE_PORT),
      host: '0.0.0.0',
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: `http://localhost:${env.VITE_PORT}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path: any) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir,
      sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
      minify: 'terser',
      chunkSizeWarningLimit: 1500,
      terserOptions: {
        compress: {
          keep_infinity: true, // 防止 Infinity 被压缩成 1/0，这可能会导致 Chrome 上的性能问题
          drop_console: env.VITE_BUILD_DROP_CONSOLE === 'true', // 去除 console
          drop_debugger: true // 去除 debugger
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vant: ['vant']
          },
          entryFileNames: ({ name }: any) => `${name}.js`,
          chunkFileNames: ({ name }: any) => `${name}.chunk.js`,
          assetFileNames: ({ name }: any) => `${name}[extname]`
        }
      }
    },
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use './src/styles/variable.scss';`, //sass新版已弃用import
          silenceDeprecations: ['legacy-js-api']
        }
      }
    },
    // 可以查看 CSS 的源码
    devSourcemap: true,
    base: './'
  }
})
