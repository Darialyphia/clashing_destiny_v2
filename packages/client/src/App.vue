<script setup lang="ts">
import { TooltipProvider } from 'reka-ui';

// const { loaded } = useAssets();
</script>

<template>
  <!-- <div v-if="!loaded">Loading...</div> -->
  <div>
    <TooltipProvider :delay-duration="400">
      <RouterView name="ui" />
    </TooltipProvider>
    <div id="card-portal"></div>
    <div id="card-actions-portal"></div>
    <div id="tooltip-portal"></div>
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
