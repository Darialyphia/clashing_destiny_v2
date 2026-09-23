import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import vueDevTools from 'vite-plugin-vue-devtools';
import autoImport from 'unplugin-auto-import/vite';
import vueRouter from 'unplugin-vue-router/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import unoCSS from 'unocss/vite';
// import icons from 'unplugin-icons/vite';
import markdown, { Mode } from 'vite-plugin-markdown';
import { isCustomElement, transformAssetUrls } from 'vue3-pixi/compiler';
// import assetpackConfig from '@game/assetpack';

const customElements = [
  'viewport',
  'layer',
  'outline-filter',
  'adjustment-filter',
  'camera-3d',
  'container-2d',
  'container-3d',
  'mesh-2d',
  'mesh-3d-2d',
  'simple-mesh-2d',
  'simple-mesh-3d-2d',
  'sprite-2d',
  'sprite-2s',
  'sprite-3d',
  'text-2d',
  'text-2s',
  'text-3d'
];
const prefix = 'pixi-';

// import { AssetPack } from '@assetpack/core';

// function assetpackPlugin(): Plugin {
//   const apConfig = assetpackConfig('./src/assets/', './public/assets/');

//   let mode: ResolvedConfig['command'];
//   let ap: AssetPack | undefined;

//   return {
//     name: 'vite-plugin-assetpack',
//     configResolved(resolvedConfig) {
//       mode = resolvedConfig.command;
//     },
//     buildStart: async () => {
//       if (mode === 'serve') {
//         if (ap) return;
//         ap = new AssetPack(apConfig);
//         void ap.watch();
//       } else {
//         await new AssetPack(apConfig).run();
//       }
//     },
//     buildEnd: async () => {
//       if (ap) {
//         await ap.stop();
//         ap = undefined;
//       }
//     }
//   };
// }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vueRouter({
        extensions: ['.page.vue']
      }),
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        },
        template: {
          compilerOptions: {
            isCustomElement(name) {
              let normalizedName = name.replace(
                /[A-Z]/g,
                m => `-${m.toLowerCase()}`
              );
              if (normalizedName.startsWith('-'))
                normalizedName = normalizedName.slice(1);

              const isPixiElement = customElements.includes(normalizedName);
              const isPrefixElement =
                normalizedName.startsWith(prefix) &&
                customElements.includes(normalizedName.slice(prefix.length));

              return isCustomElement(name) || isPixiElement || isPrefixElement;
            }
          },
          transformAssetUrls
        }
      }),
      VitePWA({
        registerType: 'prompt',
        srcDir: 'src',
        filename: 'sw.ts',
        strategies: 'injectManifest',
        devOptions: {
          enabled: env.VITE_DEV_PWA === 'true',
          type: 'module'
        },
        manifest: {
          name: 'Duelyst Dominion',
          short_name: 'Duelyst',
          description: 'The Duelyst Dominion digital Trading Card Game',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/icon/logo-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon/logo-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon/logo-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,json,png}']
        }
      }),
      vueDevTools(),
      autoImport({
        imports: ['vue', VueRouterAutoImports],
        dts: true,
        eslintrc: {
          enabled: true
        }
      }),
      unoCSS(),
      // icons({}),
      // assetpackPlugin(),
      // @ts-expect-error
      markdown.default({
        mode: [Mode.VUE]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3000
    }
  };
});
