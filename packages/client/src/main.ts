import './styles/global.css';
// @ts-ignore
import 'open-props/postcss/style';
// @ts-ignore
import 'open-props/colors-hsl';

import { createApp } from 'vue';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import App from './App.vue';
// import { useAssetsProvider } from './shared/composables/useAssets';
import gsap from 'gsap';
import { MotionPathPlugin, Flip } from 'gsap/all';
import { createConvexVue } from '@convex-vue/core';

gsap.install(window);
gsap.registerPlugin(MotionPathPlugin);
gsap.registerPlugin(Flip);

const app = createApp(App);

const router = createRouter({
  history: createWebHistory(),
  routes
});

const pinia = createPinia();
const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL
});

app.use(router);
app.use(convexVue);
app.use(pinia);
app.use(autoAnimatePlugin);
// app.use({
//   install(app) {
//     // We are registering global providers here so they can be automatically passed to the vue-pixi renderer which inherits the vue app provides.
//     const assets = useAssetsProvider(app);
//     // assets.load();
//   }
// });
app.mount('#app');

if (import.meta.hot) {
  handleHotUpdate(router);
}
