<script setup lang="ts">
import { TooltipProvider } from 'reka-ui';
import { provideAuth } from './auth/composables/useAuth';

// const { loaded } = useAssets();
provideAuth();
</script>

<template>
  <!-- <div v-if="!loaded">Loading...</div> -->
  <div>
    <TooltipProvider :delay-duration="400">
      <RouterView />
    </TooltipProvider>
    <div id="card-portal"></div>
    <div id="card-actions-portal"></div>
    <div id="tooltip-portal"></div>
  </div>
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
  top: 0;
  left: 0;
}
#tooltip-portal {
  position: fixed;
  z-index: 11;
  top: 0;
  left: 0;
}
</style>
