<script setup lang="ts">
import { useAuth } from '@/auth/composables/useAuth';
import { useCurrentGameRedirect, useMe } from '@/auth/composables/useMe';
import PlayerMatchmakingStatus from '@/player/components/PlayerMatchmakingStatus.vue';
import ClientParallaxBackground from './ClientParallaxBackground.vue';

definePage({
  name: 'Client',
  meta: {
    requiresAuth: true
  }
});

const auth = useAuth();
const { error } = useMe();
watch(error, err => {
  if (err) {
    auth.sessionId.value = null;
  }
});

useCurrentGameRedirect();
</script>

<template>
  <ClientParallaxBackground>
    <router-view v-slot="{ Component, route }">
      <div class="page-wrapper" :class="route.meta.wrapperClass">
        <Transition mode="out-in">
          <div :key="route.path">
            <component :is="Component" />
          </div>
        </Transition>
      </div>
    </router-view>

    <div class="absolute bottom-4 left-4">
      <PlayerMatchmakingStatus />
    </div>
  </ClientParallaxBackground>
</template>

<style scoped lang="postcss">
.page-wrapper {
  position: absolute;
  height: 100dvh;
  width: 100vw;
  overflow-y: hidden;
  transition:
    backdrop-filter 0.75s var(--ease-3),
    opacity 0.75s var(--ease-3);
}

.page-blur {
  backdrop-filter: blur(25px) brightness(0.8);
  transition:
    backdrop-filter 0.75s var(--ease-3),
    opacity 0.75s var(--ease-3);
}
</style>
