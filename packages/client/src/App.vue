<script setup lang="ts">
import { External } from 'vue3-pixi';
import { useAssets } from './shared/composables/useAssets';
import PixiApp from './PixiApp.vue';
import { TooltipProvider } from 'reka-ui';

// const { loaded } = useAssets();

const uiRoot = document.getElementById('#app');
</script>

<template>
  <!-- <div v-if="!loaded">Loading...</div> -->
  <div>
    <TooltipProvider :delay-duration="400">
      <RouterView name="ui" />
    </TooltipProvider>
    <div id="card-portal" />
  </div>
  <!-- <PixiApp v-else>
    <RouterView name="scene" />
    <External :root="uiRoot!" id="ui-root">
      <TooltipProvider :delay-duration="400">
        <RouterView name="ui" />
      </TooltipProvider>
      <div id="card-portal" />
    </External>
  </PixiApp> -->
</template>

<style>
#ui-root {
  position: absolute;
  inset: 0;
  /* pointer-events: none; */
}

#card-portal {
  position: fixed;
  z-index: 10;
}
</style>
