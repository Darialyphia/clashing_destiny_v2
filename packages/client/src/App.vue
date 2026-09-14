<script setup lang="ts">
import { TooltipProvider } from 'reka-ui';
import { provideAuth } from './auth/composables/useAuth';
import SVGFilters from './game/components/SVGFilters.vue';

// const { loaded } = useAssets();
provideAuth();
</script>

<template>
  <!-- <div v-if="!loaded">Loading...</div> -->
  <div>
    <SVGFilters />

    <TooltipProvider :delay-duration="400">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition as any" mode="out-in">
          <div class="page-wrapper" :key="route.fullPath">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </TooltipProvider>
    <div id="card-portal"></div>
    <div id="card-actions-portal"></div>
    <div id="tooltip-portal"></div>
  </div>
</template>

<style lang="postcss">
body:has(
  :is(
    .page-wrapper.slide-left-enter-active,
    .page-wrapper.slide-left-leave-active,
    .page-wrapper.slide-right-enter-active,
    .page-wrapper.slide-right-leave-active
  )
) {
  max-width: 100vw;
  overflow-x: hidden;
}
</style>
e

<style scoped>
#card-portal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
}
#tooltip-portal {
  position: fixed;
  z-index: 11;
  top: 0;
  left: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}

.slide-right-enter-from {
  transform: translateX(-25%) scale(0.75);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(25%) scale(0.75);
  opacity: 0;
}

.slide-left-enter-from {
  transform: translateX(25%) scale(0.75);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-25%) scale(0.75);
  opacity: 0;
}
</style>
