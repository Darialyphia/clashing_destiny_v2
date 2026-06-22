// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///home/loic/web/clashing_destiny_v2/node_modules/vite/dist/node/index.js";
import vue from "file:///home/loic/web/clashing_destiny_v2/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueDevTools from "file:///home/loic/web/clashing_destiny_v2/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import autoImport from "file:///home/loic/web/clashing_destiny_v2/node_modules/unplugin-auto-import/dist/vite.js";
import vueRouter from "file:///home/loic/web/clashing_destiny_v2/node_modules/unplugin-vue-router/dist/vite.js";
import { VueRouterAutoImports } from "file:///home/loic/web/clashing_destiny_v2/node_modules/unplugin-vue-router/dist/index.js";
import unoCSS from "file:///home/loic/web/clashing_destiny_v2/node_modules/unocss/dist/vite.mjs";
import icons from "file:///home/loic/web/clashing_destiny_v2/node_modules/unplugin-icons/dist/vite.js";
import markdown, { Mode } from "file:///home/loic/web/clashing_destiny_v2/node_modules/vite-plugin-markdown/dist/index.js";
import { isCustomElement, transformAssetUrls } from "file:///home/loic/web/clashing_destiny_v2/node_modules/vue3-pixi/dist/compiler.js";
var __vite_injected_original_import_meta_url = "file:///home/loic/web/clashing_destiny_v2/packages/client/vite.config.ts";
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
var vite_config_default = defineConfig({
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
    vueDevTools(),
    autoImport({
      imports: ["vue", VueRouterAutoImports],
      dts: true,
      eslintrc: {
        enabled: true
      }
    }),
    unoCSS(),
    icons({}),
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
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9sb2ljL3dlYi9jbGFzaGluZ19kZXN0aW55X3YyL3BhY2thZ2VzL2NsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvbG9pYy93ZWIvY2xhc2hpbmdfZGVzdGlueV92Mi9wYWNrYWdlcy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvbG9pYy93ZWIvY2xhc2hpbmdfZGVzdGlueV92Mi9wYWNrYWdlcy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuXG5pbXBvcnQgdnVlRGV2VG9vbHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzJztcbmltcG9ydCBhdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IHZ1ZVJvdXRlciBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyL3ZpdGUnO1xuaW1wb3J0IHsgVnVlUm91dGVyQXV0b0ltcG9ydHMgfSBmcm9tICd1bnBsdWdpbi12dWUtcm91dGVyJztcbmltcG9ydCB1bm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IGljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnO1xuaW1wb3J0IG1hcmtkb3duLCB7IE1vZGUgfSBmcm9tICd2aXRlLXBsdWdpbi1tYXJrZG93bic7XG5pbXBvcnQgeyBpc0N1c3RvbUVsZW1lbnQsIHRyYW5zZm9ybUFzc2V0VXJscyB9IGZyb20gJ3Z1ZTMtcGl4aS9jb21waWxlcic7XG5cbi8vIGltcG9ydCBhc3NldHBhY2tDb25maWcgZnJvbSAnQGdhbWUvYXNzZXRwYWNrJztcblxuY29uc3QgY3VzdG9tRWxlbWVudHMgPSBbXG4gICd2aWV3cG9ydCcsXG4gICdsYXllcicsXG4gICdvdXRsaW5lLWZpbHRlcicsXG4gICdhZGp1c3RtZW50LWZpbHRlcicsXG4gICdjYW1lcmEtM2QnLFxuICAnY29udGFpbmVyLTJkJyxcbiAgJ2NvbnRhaW5lci0zZCcsXG4gICdtZXNoLTJkJyxcbiAgJ21lc2gtM2QtMmQnLFxuICAnc2ltcGxlLW1lc2gtMmQnLFxuICAnc2ltcGxlLW1lc2gtM2QtMmQnLFxuICAnc3ByaXRlLTJkJyxcbiAgJ3Nwcml0ZS0ycycsXG4gICdzcHJpdGUtM2QnLFxuICAndGV4dC0yZCcsXG4gICd0ZXh0LTJzJyxcbiAgJ3RleHQtM2QnXG5dO1xuY29uc3QgcHJlZml4ID0gJ3BpeGktJztcblxuLy8gaW1wb3J0IHsgQXNzZXRQYWNrIH0gZnJvbSAnQGFzc2V0cGFjay9jb3JlJztcblxuLy8gZnVuY3Rpb24gYXNzZXRwYWNrUGx1Z2luKCk6IFBsdWdpbiB7XG4vLyAgIGNvbnN0IGFwQ29uZmlnID0gYXNzZXRwYWNrQ29uZmlnKCcuL3NyYy9hc3NldHMvJywgJy4vcHVibGljL2Fzc2V0cy8nKTtcblxuLy8gICBsZXQgbW9kZTogUmVzb2x2ZWRDb25maWdbJ2NvbW1hbmQnXTtcbi8vICAgbGV0IGFwOiBBc3NldFBhY2sgfCB1bmRlZmluZWQ7XG5cbi8vICAgcmV0dXJuIHtcbi8vICAgICBuYW1lOiAndml0ZS1wbHVnaW4tYXNzZXRwYWNrJyxcbi8vICAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZykge1xuLy8gICAgICAgbW9kZSA9IHJlc29sdmVkQ29uZmlnLmNvbW1hbmQ7XG4vLyAgICAgfSxcbi8vICAgICBidWlsZFN0YXJ0OiBhc3luYyAoKSA9PiB7XG4vLyAgICAgICBpZiAobW9kZSA9PT0gJ3NlcnZlJykge1xuLy8gICAgICAgICBpZiAoYXApIHJldHVybjtcbi8vICAgICAgICAgYXAgPSBuZXcgQXNzZXRQYWNrKGFwQ29uZmlnKTtcbi8vICAgICAgICAgdm9pZCBhcC53YXRjaCgpO1xuLy8gICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgYXdhaXQgbmV3IEFzc2V0UGFjayhhcENvbmZpZykucnVuKCk7XG4vLyAgICAgICB9XG4vLyAgICAgfSxcbi8vICAgICBidWlsZEVuZDogYXN5bmMgKCkgPT4ge1xuLy8gICAgICAgaWYgKGFwKSB7XG4vLyAgICAgICAgIGF3YWl0IGFwLnN0b3AoKTtcbi8vICAgICAgICAgYXAgPSB1bmRlZmluZWQ7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9O1xuLy8gfVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlUm91dGVyKHtcbiAgICAgIGV4dGVuc2lvbnM6IFsnLnBhZ2UudnVlJ11cbiAgICB9KSxcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGRlZmluZU1vZGVsOiB0cnVlLFxuICAgICAgICBwcm9wc0Rlc3RydWN0dXJlOiB0cnVlXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgaXNDdXN0b21FbGVtZW50KG5hbWUpIHtcbiAgICAgICAgICAgIGxldCBub3JtYWxpemVkTmFtZSA9IG5hbWUucmVwbGFjZShcbiAgICAgICAgICAgICAgL1tBLVpdL2csXG4gICAgICAgICAgICAgIG0gPT4gYC0ke20udG9Mb3dlckNhc2UoKX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgoJy0nKSlcbiAgICAgICAgICAgICAgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVkTmFtZS5zbGljZSgxKTtcblxuICAgICAgICAgICAgY29uc3QgaXNQaXhpRWxlbWVudCA9IGN1c3RvbUVsZW1lbnRzLmluY2x1ZGVzKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJlZml4RWxlbWVudCA9XG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgocHJlZml4KSAmJlxuICAgICAgICAgICAgICBjdXN0b21FbGVtZW50cy5pbmNsdWRlcyhub3JtYWxpemVkTmFtZS5zbGljZShwcmVmaXgubGVuZ3RoKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBpc0N1c3RvbUVsZW1lbnQobmFtZSkgfHwgaXNQaXhpRWxlbWVudCB8fCBpc1ByZWZpeEVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm1Bc3NldFVybHNcbiAgICAgIH1cbiAgICB9KSxcbiAgICB2dWVEZXZUb29scygpLFxuICAgIGF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogWyd2dWUnLCBWdWVSb3V0ZXJBdXRvSW1wb3J0c10sXG4gICAgICBkdHM6IHRydWUsXG4gICAgICBlc2xpbnRyYzoge1xuICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICB9XG4gICAgfSksXG4gICAgdW5vQ1NTKCksXG4gICAgaWNvbnMoe30pLFxuICAgIC8vIGFzc2V0cGFja1BsdWdpbigpLFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBtYXJrZG93bi5kZWZhdWx0KHtcbiAgICAgIG1vZGU6IFtNb2RlLlZVRV1cbiAgICB9KVxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VSxTQUFTLGVBQWUsV0FBVztBQUUzVyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFFaEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsNEJBQTRCO0FBQ3JDLE9BQU8sWUFBWTtBQUNuQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxZQUFZLFlBQVk7QUFDL0IsU0FBUyxpQkFBaUIsMEJBQTBCO0FBWndKLElBQU0sMkNBQTJDO0FBZ0I3UCxJQUFNLGlCQUFpQjtBQUFBLEVBQ3JCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBQ0EsSUFBTSxTQUFTO0FBaUNmLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQSxNQUNSLFlBQVksQ0FBQyxXQUFXO0FBQUEsSUFDMUIsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBLFFBQ04sYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsTUFDcEI7QUFBQSxNQUNBLFVBQVU7QUFBQSxRQUNSLGlCQUFpQjtBQUFBLFVBQ2YsZ0JBQWdCLE1BQU07QUFDcEIsZ0JBQUksaUJBQWlCLEtBQUs7QUFBQSxjQUN4QjtBQUFBLGNBQ0EsT0FBSyxJQUFJLEVBQUUsWUFBWSxDQUFDO0FBQUEsWUFDMUI7QUFDQSxnQkFBSSxlQUFlLFdBQVcsR0FBRztBQUMvQiwrQkFBaUIsZUFBZSxNQUFNLENBQUM7QUFFekMsa0JBQU0sZ0JBQWdCLGVBQWUsU0FBUyxjQUFjO0FBQzVELGtCQUFNLGtCQUNKLGVBQWUsV0FBVyxNQUFNLEtBQ2hDLGVBQWUsU0FBUyxlQUFlLE1BQU0sT0FBTyxNQUFNLENBQUM7QUFFN0QsbUJBQU8sZ0JBQWdCLElBQUksS0FBSyxpQkFBaUI7QUFBQSxVQUNuRDtBQUFBLFFBQ0Y7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLE1BQ1QsU0FBUyxDQUFDLE9BQU8sb0JBQW9CO0FBQUEsTUFDckMsS0FBSztBQUFBLE1BQ0wsVUFBVTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELE9BQU87QUFBQSxJQUNQLE1BQU0sQ0FBQyxDQUFDO0FBQUE7QUFBQTtBQUFBLElBR1IsU0FBUyxRQUFRO0FBQUEsTUFDZixNQUFNLENBQUMsS0FBSyxHQUFHO0FBQUEsSUFDakIsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
