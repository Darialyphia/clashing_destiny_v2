<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import { GAME_STATUS } from '@game/api';

definePage({
  name: 'Client',
  meta: {
    requiresAuth: true
  }
});

const { data: me } = useMe();

const router = useRouter();

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
