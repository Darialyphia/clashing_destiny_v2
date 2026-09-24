// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "file:///C:/dev/clashing_destiny_v2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/dev/clashing_destiny_v2/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///C:/dev/clashing_destiny_v2/node_modules/vite-plugin-pwa/dist/index.js";
import vueDevTools from "file:///C:/dev/clashing_destiny_v2/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import autoImport from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-auto-import/dist/vite.js";
import vueRouter from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-vue-router/dist/vite.js";
import { VueRouterAutoImports } from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-vue-router/dist/index.js";
import unoCSS from "file:///C:/dev/clashing_destiny_v2/node_modules/unocss/dist/vite.mjs";
import markdown, { Mode } from "file:///C:/dev/clashing_destiny_v2/node_modules/vite-plugin-markdown/dist/index.js";
import { isCustomElement, transformAssetUrls } from "file:///C:/dev/clashing_destiny_v2/node_modules/vue3-pixi/dist/compiler.js";
var __vite_injected_original_import_meta_url = "file:///C:/dev/clashing_destiny_v2/packages/client/vite.config.ts";
var customElements = [
  "viewport",
  "layer",
  "outline-filter",
  "adjustment-filter",
  "camera-3d",
  "container-2d",
  "container-3d",
  "mesh-2d",
  "mesh-3d-2d",
  "simple-mesh-2d",
  "simple-mesh-3d-2d",
  "sprite-2d",
  "sprite-2s",
  "sprite-3d",
  "text-2d",
  "text-2s",
  "text-3d"
];
var prefix = "pixi-";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vueRouter({
        extensions: [".page.vue"]
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
                (m) => `-${m.toLowerCase()}`
              );
              if (normalizedName.startsWith("-"))
                normalizedName = normalizedName.slice(1);
              const isPixiElement = customElements.includes(normalizedName);
              const isPrefixElement = normalizedName.startsWith(prefix) && customElements.includes(normalizedName.slice(prefix.length));
              return isCustomElement(name) || isPixiElement || isPrefixElement;
            }
          },
          transformAssetUrls
        }
      }),
      VitePWA({
        registerType: "prompt",
        srcDir: "src",
        filename: "sw.ts",
        strategies: "injectManifest",
        injectManifest: {
          maximumFileSizeToCacheInBytes: 4e6
        },
        devOptions: {
          enabled: env.VITE_DEV_PWA === "true",
          type: "module"
        },
        manifest: {
          name: "Duelyst Dominion",
          short_name: "Duelyst",
          description: "The Duelyst Dominion digital Trading Card Game",
          theme_color: "#ffffff",
          display: "standalone",
          orientation: "landscape",
          icons: [
            {
              src: "/icon/logo-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/icon/logo-512x512.png",
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: "/icon/logo-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,json,png}"]
        }
      }),
      vueDevTools(),
      autoImport({
        imports: ["vue", VueRouterAutoImports],
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
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    },
    server: {
      port: 3e3
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxkZXZcXFxcY2xhc2hpbmdfZGVzdGlueV92MlxcXFxwYWNrYWdlc1xcXFxjbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXGRldlxcXFxjbGFzaGluZ19kZXN0aW55X3YyXFxcXHBhY2thZ2VzXFxcXGNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovZGV2L2NsYXNoaW5nX2Rlc3RpbnlfdjIvcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnO1xuaW1wb3J0IGF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSc7XG5pbXBvcnQgdnVlUm91dGVyIGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXIvdml0ZSc7XG5pbXBvcnQgeyBWdWVSb3V0ZXJBdXRvSW1wb3J0cyB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1yb3V0ZXInO1xuaW1wb3J0IHVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSc7XG4vLyBpbXBvcnQgaWNvbnMgZnJvbSAndW5wbHVnaW4taWNvbnMvdml0ZSc7XG5pbXBvcnQgbWFya2Rvd24sIHsgTW9kZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1hcmtkb3duJztcbmltcG9ydCB7IGlzQ3VzdG9tRWxlbWVudCwgdHJhbnNmb3JtQXNzZXRVcmxzIH0gZnJvbSAndnVlMy1waXhpL2NvbXBpbGVyJztcbi8vIGltcG9ydCBhc3NldHBhY2tDb25maWcgZnJvbSAnQGdhbWUvYXNzZXRwYWNrJztcblxuY29uc3QgY3VzdG9tRWxlbWVudHMgPSBbXG4gICd2aWV3cG9ydCcsXG4gICdsYXllcicsXG4gICdvdXRsaW5lLWZpbHRlcicsXG4gICdhZGp1c3RtZW50LWZpbHRlcicsXG4gICdjYW1lcmEtM2QnLFxuICAnY29udGFpbmVyLTJkJyxcbiAgJ2NvbnRhaW5lci0zZCcsXG4gICdtZXNoLTJkJyxcbiAgJ21lc2gtM2QtMmQnLFxuICAnc2ltcGxlLW1lc2gtMmQnLFxuICAnc2ltcGxlLW1lc2gtM2QtMmQnLFxuICAnc3ByaXRlLTJkJyxcbiAgJ3Nwcml0ZS0ycycsXG4gICdzcHJpdGUtM2QnLFxuICAndGV4dC0yZCcsXG4gICd0ZXh0LTJzJyxcbiAgJ3RleHQtM2QnXG5dO1xuY29uc3QgcHJlZml4ID0gJ3BpeGktJztcblxuLy8gaW1wb3J0IHsgQXNzZXRQYWNrIH0gZnJvbSAnQGFzc2V0cGFjay9jb3JlJztcblxuLy8gZnVuY3Rpb24gYXNzZXRwYWNrUGx1Z2luKCk6IFBsdWdpbiB7XG4vLyAgIGNvbnN0IGFwQ29uZmlnID0gYXNzZXRwYWNrQ29uZmlnKCcuL3NyYy9hc3NldHMvJywgJy4vcHVibGljL2Fzc2V0cy8nKTtcblxuLy8gICBsZXQgbW9kZTogUmVzb2x2ZWRDb25maWdbJ2NvbW1hbmQnXTtcbi8vICAgbGV0IGFwOiBBc3NldFBhY2sgfCB1bmRlZmluZWQ7XG5cbi8vICAgcmV0dXJuIHtcbi8vICAgICBuYW1lOiAndml0ZS1wbHVnaW4tYXNzZXRwYWNrJyxcbi8vICAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZykge1xuLy8gICAgICAgbW9kZSA9IHJlc29sdmVkQ29uZmlnLmNvbW1hbmQ7XG4vLyAgICAgfSxcbi8vICAgICBidWlsZFN0YXJ0OiBhc3luYyAoKSA9PiB7XG4vLyAgICAgICBpZiAobW9kZSA9PT0gJ3NlcnZlJykge1xuLy8gICAgICAgICBpZiAoYXApIHJldHVybjtcbi8vICAgICAgICAgYXAgPSBuZXcgQXNzZXRQYWNrKGFwQ29uZmlnKTtcbi8vICAgICAgICAgdm9pZCBhcC53YXRjaCgpO1xuLy8gICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgYXdhaXQgbmV3IEFzc2V0UGFjayhhcENvbmZpZykucnVuKCk7XG4vLyAgICAgICB9XG4vLyAgICAgfSxcbi8vICAgICBidWlsZEVuZDogYXN5bmMgKCkgPT4ge1xuLy8gICAgICAgaWYgKGFwKSB7XG4vLyAgICAgICAgIGF3YWl0IGFwLnN0b3AoKTtcbi8vICAgICAgICAgYXAgPSB1bmRlZmluZWQ7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9O1xuLy8gfVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB2dWVSb3V0ZXIoe1xuICAgICAgICBleHRlbnNpb25zOiBbJy5wYWdlLnZ1ZSddXG4gICAgICB9KSxcbiAgICAgIHZ1ZSh7XG4gICAgICAgIHNjcmlwdDoge1xuICAgICAgICAgIGRlZmluZU1vZGVsOiB0cnVlLFxuICAgICAgICAgIHByb3BzRGVzdHJ1Y3R1cmU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGlzQ3VzdG9tRWxlbWVudChuYW1lKSB7XG4gICAgICAgICAgICAgIGxldCBub3JtYWxpemVkTmFtZSA9IG5hbWUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAvW0EtWl0vZyxcbiAgICAgICAgICAgICAgICBtID0+IGAtJHttLnRvTG93ZXJDYXNlKCl9YFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZE5hbWUuc3RhcnRzV2l0aCgnLScpKVxuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplZE5hbWUuc2xpY2UoMSk7XG5cbiAgICAgICAgICAgICAgY29uc3QgaXNQaXhpRWxlbWVudCA9IGN1c3RvbUVsZW1lbnRzLmluY2x1ZGVzKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgICAgICAgICAgY29uc3QgaXNQcmVmaXhFbGVtZW50ID1cbiAgICAgICAgICAgICAgICBub3JtYWxpemVkTmFtZS5zdGFydHNXaXRoKHByZWZpeCkgJiZcbiAgICAgICAgICAgICAgICBjdXN0b21FbGVtZW50cy5pbmNsdWRlcyhub3JtYWxpemVkTmFtZS5zbGljZShwcmVmaXgubGVuZ3RoKSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGlzQ3VzdG9tRWxlbWVudChuYW1lKSB8fCBpc1BpeGlFbGVtZW50IHx8IGlzUHJlZml4RWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHRyYW5zZm9ybUFzc2V0VXJsc1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIFZpdGVQV0Eoe1xuICAgICAgICByZWdpc3RlclR5cGU6ICdwcm9tcHQnLFxuICAgICAgICBzcmNEaXI6ICdzcmMnLFxuICAgICAgICBmaWxlbmFtZTogJ3N3LnRzJyxcbiAgICAgICAgc3RyYXRlZ2llczogJ2luamVjdE1hbmlmZXN0JyxcbiAgICAgICAgaW5qZWN0TWFuaWZlc3Q6IHtcbiAgICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogNDAwMDAwMFxuICAgICAgICB9LFxuICAgICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgICAgZW5hYmxlZDogZW52LlZJVEVfREVWX1BXQSA9PT0gJ3RydWUnLFxuICAgICAgICAgIHR5cGU6ICdtb2R1bGUnXG4gICAgICAgIH0sXG4gICAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgICAgbmFtZTogJ0R1ZWx5c3QgRG9taW5pb24nLFxuICAgICAgICAgIHNob3J0X25hbWU6ICdEdWVseXN0JyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBEdWVseXN0IERvbWluaW9uIGRpZ2l0YWwgVHJhZGluZyBDYXJkIEdhbWUnLFxuICAgICAgICAgIHRoZW1lX2NvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICAgIG9yaWVudGF0aW9uOiAnbGFuZHNjYXBlJyxcbiAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzcmM6ICcvaWNvbi9sb2dvLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNyYzogJy9pY29uL2xvZ28tNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3JjOiAnL2ljb24vbG9nby01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAgd29ya2JveDoge1xuICAgICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxqc29uLHBuZ30nXVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIHZ1ZURldlRvb2xzKCksXG4gICAgICBhdXRvSW1wb3J0KHtcbiAgICAgICAgaW1wb3J0czogWyd2dWUnLCBWdWVSb3V0ZXJBdXRvSW1wb3J0c10sXG4gICAgICAgIGR0czogdHJ1ZSxcbiAgICAgICAgZXNsaW50cmM6IHtcbiAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgdW5vQ1NTKCksXG4gICAgICAvLyBpY29ucyh7fSksXG4gICAgICAvLyBhc3NldHBhY2tQbHVnaW4oKSxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIG1hcmtkb3duLmRlZmF1bHQoe1xuICAgICAgICBtb2RlOiBbTW9kZS5WVUVdXG4gICAgICB9KVxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcbiAgICAgIH1cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMFxuICAgIH1cbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVCxTQUFTLGVBQWUsV0FBVztBQUM3VixTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZUFBZTtBQUN0QixTQUFTLDRCQUE0QjtBQUNyQyxPQUFPLFlBQVk7QUFFbkIsT0FBTyxZQUFZLFlBQVk7QUFDL0IsU0FBUyxpQkFBaUIsMEJBQTBCO0FBWGlKLElBQU0sMkNBQTJDO0FBY3RQLElBQU0saUJBQWlCO0FBQUEsRUFDckI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxF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
