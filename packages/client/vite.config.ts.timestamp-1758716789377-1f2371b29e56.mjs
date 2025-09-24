// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///C:/dev/clashing_destiny_v2/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/dev/clashing_destiny_v2/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueDevTools from "file:///C:/dev/clashing_destiny_v2/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import autoImport from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-auto-import/dist/vite.js";
import vueRouter from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-vue-router/dist/vite.js";
import { VueRouterAutoImports } from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-vue-router/dist/index.js";
import unoCSS from "file:///C:/dev/clashing_destiny_v2/node_modules/unocss/dist/vite.mjs";
import icons from "file:///C:/dev/clashing_destiny_v2/node_modules/unplugin-icons/dist/vite.js";
import markdown, { Mode } from "file:///C:/dev/clashing_destiny_v2/node_modules/vite-plugin-markdown/dist/index.js";
import { isCustomElement, transformAssetUrls } from "file:///C:/dev/clashing_destiny_v2/node_modules/vue3-pixi/dist/compiler.js";
import assetpackConfig from "file:///C:/dev/clashing_destiny_v2/configs/assetpack/assetpack.config.js";
import { AssetPack } from "file:///C:/dev/clashing_destiny_v2/node_modules/@assetpack/core/dist/es/index.js";
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
function assetpackPlugin() {
  const apConfig = assetpackConfig("./src/assets/", "./public/assets/");
  let mode;
  let ap;
  return {
    name: "vite-plugin-assetpack",
    configResolved(resolvedConfig) {
      mode = resolvedConfig.command;
    },
    buildStart: async () => {
      if (mode === "serve") {
        if (ap) return;
        ap = new AssetPack(apConfig);
        void ap.watch();
      } else {
        await new AssetPack(apConfig).run();
      }
    },
    buildEnd: async () => {
      if (ap) {
        await ap.stop();
        ap = void 0;
      }
    }
  };
}
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
    assetpackPlugin(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxkZXZcXFxcY2xhc2hpbmdfZGVzdGlueV92MlxcXFxwYWNrYWdlc1xcXFxjbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXGRldlxcXFxjbGFzaGluZ19kZXN0aW55X3YyXFxcXHBhY2thZ2VzXFxcXGNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovZGV2L2NsYXNoaW5nX2Rlc3RpbnlfdjIvcGFja2FnZXMvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xuXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbiwgUmVzb2x2ZWRDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcblxuaW1wb3J0IHZ1ZURldlRvb2xzIGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZS1kZXZ0b29scyc7XG5pbXBvcnQgYXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCB2dWVSb3V0ZXIgZnJvbSAndW5wbHVnaW4tdnVlLXJvdXRlci92aXRlJztcbmltcG9ydCB7IFZ1ZVJvdXRlckF1dG9JbXBvcnRzIH0gZnJvbSAndW5wbHVnaW4tdnVlLXJvdXRlcic7XG5pbXBvcnQgdW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbmltcG9ydCBpY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJztcbmltcG9ydCBtYXJrZG93biwgeyBNb2RlIH0gZnJvbSAndml0ZS1wbHVnaW4tbWFya2Rvd24nO1xuaW1wb3J0IHsgaXNDdXN0b21FbGVtZW50LCB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tICd2dWUzLXBpeGkvY29tcGlsZXInO1xuLy9AdHMtZXhwZWN0LWVycm9yIG5vIHR5cGVzIGZvciB0aGlzIHBhY2thZ2VcbmltcG9ydCBhc3NldHBhY2tDb25maWcgZnJvbSAnQGdhbWUvYXNzZXRwYWNrJztcblxuY29uc3QgY3VzdG9tRWxlbWVudHMgPSBbXG4gICd2aWV3cG9ydCcsXG4gICdsYXllcicsXG4gICdvdXRsaW5lLWZpbHRlcicsXG4gICdhZGp1c3RtZW50LWZpbHRlcicsXG4gICdjYW1lcmEtM2QnLFxuICAnY29udGFpbmVyLTJkJyxcbiAgJ2NvbnRhaW5lci0zZCcsXG4gICdtZXNoLTJkJyxcbiAgJ21lc2gtM2QtMmQnLFxuICAnc2ltcGxlLW1lc2gtMmQnLFxuICAnc2ltcGxlLW1lc2gtM2QtMmQnLFxuICAnc3ByaXRlLTJkJyxcbiAgJ3Nwcml0ZS0ycycsXG4gICdzcHJpdGUtM2QnLFxuICAndGV4dC0yZCcsXG4gICd0ZXh0LTJzJyxcbiAgJ3RleHQtM2QnXG5dO1xuY29uc3QgcHJlZml4ID0gJ3BpeGktJztcblxuaW1wb3J0IHsgQXNzZXRQYWNrIH0gZnJvbSAnQGFzc2V0cGFjay9jb3JlJztcblxuZnVuY3Rpb24gYXNzZXRwYWNrUGx1Z2luKCk6IFBsdWdpbiB7XG4gIGNvbnN0IGFwQ29uZmlnID0gYXNzZXRwYWNrQ29uZmlnKCcuL3NyYy9hc3NldHMvJywgJy4vcHVibGljL2Fzc2V0cy8nKTtcblxuICBsZXQgbW9kZTogUmVzb2x2ZWRDb25maWdbJ2NvbW1hbmQnXTtcbiAgbGV0IGFwOiBBc3NldFBhY2sgfCB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tYXNzZXRwYWNrJyxcbiAgICBjb25maWdSZXNvbHZlZChyZXNvbHZlZENvbmZpZykge1xuICAgICAgbW9kZSA9IHJlc29sdmVkQ29uZmlnLmNvbW1hbmQ7XG4gICAgfSxcbiAgICBidWlsZFN0YXJ0OiBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAobW9kZSA9PT0gJ3NlcnZlJykge1xuICAgICAgICBpZiAoYXApIHJldHVybjtcbiAgICAgICAgYXAgPSBuZXcgQXNzZXRQYWNrKGFwQ29uZmlnKTtcbiAgICAgICAgdm9pZCBhcC53YXRjaCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgbmV3IEFzc2V0UGFjayhhcENvbmZpZykucnVuKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBidWlsZEVuZDogYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKGFwKSB7XG4gICAgICAgIGF3YWl0IGFwLnN0b3AoKTtcbiAgICAgICAgYXAgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlUm91dGVyKHtcbiAgICAgIGV4dGVuc2lvbnM6IFsnLnBhZ2UudnVlJ11cbiAgICB9KSxcbiAgICB2dWUoe1xuICAgICAgc2NyaXB0OiB7XG4gICAgICAgIGRlZmluZU1vZGVsOiB0cnVlLFxuICAgICAgICBwcm9wc0Rlc3RydWN0dXJlOiB0cnVlXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGU6IHtcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgaXNDdXN0b21FbGVtZW50KG5hbWUpIHtcbiAgICAgICAgICAgIGxldCBub3JtYWxpemVkTmFtZSA9IG5hbWUucmVwbGFjZShcbiAgICAgICAgICAgICAgL1tBLVpdL2csXG4gICAgICAgICAgICAgIG0gPT4gYC0ke20udG9Mb3dlckNhc2UoKX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgoJy0nKSlcbiAgICAgICAgICAgICAgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVkTmFtZS5zbGljZSgxKTtcblxuICAgICAgICAgICAgY29uc3QgaXNQaXhpRWxlbWVudCA9IGN1c3RvbUVsZW1lbnRzLmluY2x1ZGVzKG5vcm1hbGl6ZWROYW1lKTtcbiAgICAgICAgICAgIGNvbnN0IGlzUHJlZml4RWxlbWVudCA9XG4gICAgICAgICAgICAgIG5vcm1hbGl6ZWROYW1lLnN0YXJ0c1dpdGgocHJlZml4KSAmJlxuICAgICAgICAgICAgICBjdXN0b21FbGVtZW50cy5pbmNsdWRlcyhub3JtYWxpemVkTmFtZS5zbGljZShwcmVmaXgubGVuZ3RoKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBpc0N1c3RvbUVsZW1lbnQobmFtZSkgfHwgaXNQaXhpRWxlbWVudCB8fCBpc1ByZWZpeEVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm1Bc3NldFVybHNcbiAgICAgIH1cbiAgICB9KSxcbiAgICB2dWVEZXZUb29scygpLFxuICAgIGF1dG9JbXBvcnQoe1xuICAgICAgaW1wb3J0czogWyd2dWUnLCBWdWVSb3V0ZXJBdXRvSW1wb3J0c10sXG4gICAgICBkdHM6IHRydWUsXG4gICAgICBlc2xpbnRyYzoge1xuICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICB9XG4gICAgfSksXG4gICAgdW5vQ1NTKCksXG4gICAgaWNvbnMoe30pLFxuICAgIGFzc2V0cGFja1BsdWdpbigpLFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBtYXJrZG93bi5kZWZhdWx0KHtcbiAgICAgIG1vZGU6IFtNb2RlLlZVRV1cbiAgICB9KVxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVCxTQUFTLGVBQWUsV0FBVztBQUU3VixTQUFTLG9CQUE0QztBQUNyRCxPQUFPLFNBQVM7QUFF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
