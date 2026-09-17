<script setup lang="ts">
import { useAuth } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { GAME_STATUS } from '@game/api';

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
</script>

<template>
  <div class="client-page">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition as any" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped lang="postcss">
.client-page {
  background:
    url('@/assets/backgrounds/main-menu-overlay.png'),
    url('@/assets/backgrounds/main-menu-fx.png'),
    url('@/assets/backgrounds/main-menu-front.png'),
    url('@/assets/backgrounds/main-menu-middle.png'),
    url('@/assets/backgrounds/main-menu-back.png');
  background-size: cover;
  min-height: 100dvh;
  background-blend-mode: normal, multiply, normal, normal;
}
</style>
