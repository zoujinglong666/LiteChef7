import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import Uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import UniPages from '@uni-helper/vite-plugin-uni-pages';
import UniPlatform from '@uni-helper/vite-plugin-uni-platform';
import UniManifest from '@uni-helper/vite-plugin-uni-manifest';
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts';
import ViteRestart from 'vite-plugin-restart';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import legacy from '@vitejs/plugin-legacy';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

// 复制 cloudfunctions 和字体到输出目录
function copyAssets() {
  return {
    name: 'copy-assets',
    closeBundle() {
      const fs = require('fs')
      const path = require('path')
      
      // 复制 cloudfunctions
      const cfSrc = path.resolve(process.cwd(), 'cloudfunctions')
      const cfDest = path.resolve(process.cwd(), 'dist/dev/mp-weixin/cloudfunctions')
      if (fs.existsSync(cfSrc)) {
        if (!fs.existsSync(cfDest)) fs.mkdirSync(cfDest, { recursive: true })
        fs.readdirSync(cfSrc).forEach(item => {
          const srcPath = path.join(cfSrc, item)
          const destPath = path.join(cfDest, item)
          if (fs.statSync(srcPath).isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true })
            fs.readdirSync(srcPath).forEach(sub => fs.copyFileSync(path.join(srcPath, sub), path.join(destPath, sub)))
          } else {
            fs.copyFileSync(srcPath, destPath)
          }
        })
        console.log('✅ cloudfunctions 已复制')
      }
      
      // 复制字体到 static
      const fontsSrc = path.resolve(process.cwd(), 'src/static/fonts')
      const fontsDest = path.resolve(process.cwd(), 'dist/dev/mp-weixin/static/fonts')
      if (fs.existsSync(fontsSrc)) {
        if (!fs.existsSync(fontsDest)) fs.mkdirSync(fontsDest, { recursive: true })
        fs.readdirSync(fontsSrc).forEach(f => {
          fs.copyFileSync(path.join(fontsSrc, f), path.join(fontsDest, f))
        })
        console.log('✅ 字体已复制')
      }
    }
  }
}

// https://vitejs.dev/config/
export default async({ mode }) => {
  // docs: https://unocss.dev/
  const UnoCSS = (await import('unocss/vite')).default;
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'));
  const {
    VITE_APP_PORT,
    VITE_SERVER_BASEURL,
    VITE_DELETE_CONSOLE,
    VITE_SHOW_SOURCEMAP,
    VITE_PROXY_ENABLED,
    VITE_PROXY_PREFIX,
  } = env;
  const { UNI_PLATFORM } = process.env
  return defineConfig({
    // 配置别名
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },
    // 插件注意： Unixx需要在Uni()之前引入
    plugins: [
      process.env.UNI_PLATFORM === 'h5' &&
        legacy({
          targets: [
            '> 0%',
            'Chrome > 4',
            'Android >= 4',
            'IOS >= 7',
            'not ie <= 6',
            'Firefox ESR',
          ],
          renderLegacyChunks: true,
      }),
      // uni-app pages配置 会根据route配置，自动生成路由
      UniPages({
        // 排除组件文件
        exclude: ['**/components/**/**.*'],
        // 'json5' | 'json' | 'yaml' | 'yml', 具体使用参看文档：https://uni-helper.js.org/vite-plugin-uni-pages
        routeBlockLang: 'json5',
        dts: 'src/types/uni-pages.d.ts',
        // 配置分包目录
        subPackages: ['src/sub-pages'],
      }),
      UniPlatform(),
      UniLayouts(),
      UniManifest(),
      Uni(),
      UnoCSS(),
      AutoImport({
        imports: [
          'vue',
          'uni-app',
          {
            from: 'uni-mini-router',
            imports: ['createRouter', 'useRouter', 'useRoute'],
          },
        ],
        dts: 'src/types/auto-import.d.ts',
        eslintrc: { enabled: true, globalsPropValue: true },
        vueTemplate: true,
      }),
      vueSetupExtend(),

      ViteRestart({
        restart: ['vite.config.ts'],
      }),
      
      copyAssets(),
    ],
    define: {
      __UNI_PLATFORM__: JSON.stringify(UNI_PLATFORM),
    },
    // 开发配置
    server: {
      host: '0.0.0.0',
      hmr: true,
      port: Number.parseInt(VITE_APP_PORT, 10),
      // h5端配置跨域配置，配置文件.env进行开启关闭
      proxy: JSON.parse(VITE_PROXY_ENABLED)
        ? {
            [VITE_PROXY_PREFIX]: {
              target: VITE_SERVER_BASEURL,
              changeOrigin: true,
              rewrite: (path) => path.replace(new RegExp(`^${VITE_PROXY_PREFIX}`), ''),
            },
          }
        : undefined,
    },
    // 构建配置
    build: {
      sourcemap: JSON.parse(VITE_SHOW_SOURCEMAP),
      target: 'es6',
      // 开发环境不用压缩
      minify: mode === 'development' ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: JSON.parse(VITE_DELETE_CONSOLE),
          drop_debugger: true,
        },
      },
    },
  });
};
