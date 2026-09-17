<script setup lang="ts">
import { useAuth } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { GAME_STATUS } from '@game/api';
import { useMouse, useRafFn, useWindowSize } from '@vueuse/core';

const PARALLAX_MIDDLE_DISTANCE_PX = 30;
const PARALLAX_FRONT_DISTANCE_PX = 100;
const PARALLAX_INERTIA = 3;

definePage({
  name: 'Client',
  meta: {
    requiresAuth: true
  }
});

const router = useRouter();
const auth = useAuth();
const { data: me, error } = useMe();
watch(error, err => {
  if (err) {
    auth.sessionId.value = null;
  }
});

watch(
  me,
  newVal => {
    if (!newVal) return;
    if (
      newVal.currentGame &&
      newVal.currentGame.status !== GAME_STATUS.CANCELLED &&
      newVal.currentGame.status !== GAME_STATUS.FINISHED
    ) {
      router.replace({ name: 'CurrentGame' });
    }
  },
  { immediate: true }
);

const { x: mouseX } = useMouse();
const { width: viewportWidth } = useWindowSize();
const parallaxX = ref(0);

const targetParallaxX = computed(() => {
  if (!viewportWidth.value) return 0;

  return mouseX.value / viewportWidth.value - 0.5;
});

const route = useRoute();

const parallaxFn = useRafFn(({ delta }) => {
  const smoothing = 1 - Math.exp((-PARALLAX_INERTIA * delta) / 1000);
  parallaxX.value += (targetParallaxX.value - parallaxX.value) * smoothing;
});

watchEffect(() => {
  if (route.name === 'ClientHome') {
    parallaxFn.resume();
  } else {
    parallaxFn.pause();
    gsap.to(parallaxX, { value: 0, duration: 0.3 });
  }
});

const parallaxStyle = computed(() => ({
  '--parallax-middle-x': `${-parallaxX.value * PARALLAX_MIDDLE_DISTANCE_PX}px`,
  '--parallax-front-x': `${-parallaxX.value * PARALLAX_FRONT_DISTANCE_PX}px`
}));
</script>

<template>
  <div class="client-page" :style="parallaxStyle">
    <div class="background-layer background-back" />
    <div class="background-layer background-clouds" />
    <div class="background-layer background-middle" />
    <div class="background-layer background-front" />
    <div class="background-layer background-fx" />
    <div class="background-layer background-overlay" />

    <router-view v-slot="{ Component, route }">
      <div class="page-wrapper" :class="route.meta.wrapperClass">
        <component :is="Component" />
      </div>
    </router-view>
  </div>
</template>

<style scoped lang="postcss">
.client-page {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 100dvh;
}

.background-layer {
  position: absolute;
  pointer-events: none;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
  z-index: -1;
}

.background-back {
  background-image: url('@/assets/backgrounds/main-menu-back.png');
  left: -100px;
  right: -100px;
  top: 0;
  bottom: 0;
}

@keyframes clouds-scroll {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 200% 0;
  }
}
.background-clouds {
  background-image: url('@/assets/backgrounds/main-menu-clouds.png');
  background-repeat: repeat-x;
  animation: clouds-scroll 90s linear infinite;
  width: 200vw;
  aspect-ratio: calc(2 * 960) / 540;
  left: 0;
  background-size: contain;
}
.background-middle {
  background-image: url('@/assets/backgrounds/main-menu-middle.png');
  transform: translate3d(var(--parallax-middle-x), 0, 0);
  inset: 0;
}

.background-front {
  background-image: url('@/assets/backgrounds/main-menu-front.png');
  transform: translate3d(var(--parallax-front-x), 0, 0);
  left: -50px;
  right: -50px;
  top: 0;
  bottom: 0;
}

.background-fx {
  background-image: url('@/assets/backgrounds/main-menu-fx.png');
  mix-blend-mode: multiply;
  inset: 0;
}

.background-overlay {
  background-image: url('@/assets/backgrounds/main-menu-overlay.png');
  inset: 0;
}
.page-wrapper {
  position: absolute;
  height: 100dvh;
  width: 100vw;
  overflow-y: hidden;
  transition:
    backdrop-filter 0.75s var(--ease-3),
    opacity 0.75s var(--ease-3);
}
</style>

<style>
.page-blur {
  backdrop-filter: blur(25px) brightness(0.8);
  transition:
    backdrop-filter 0.75s var(--ease-3),
    opacity 0.75s var(--ease-3);
}
</style>
