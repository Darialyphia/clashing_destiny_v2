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
    <router-view />
  </div>
</template>

<style scoped lang="postcss">
.client-page {
  background: url('@/assets/backgrounds/main-menu.jpg');
  background-size: cover;
  background-attachment: fixed;
  min-height: 100dvh;
}
</style>
