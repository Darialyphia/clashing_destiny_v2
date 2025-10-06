<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import { GAME_STATUS } from '@game/api';

definePage({
  name: 'CurrentGame'
});

const { data: me } = useMe();
</script>

<template>
  <div class="game-page">
    <pre>
      {{ me?.currentGame }}
    </pre>

    <RouterLink
      v-if="me?.currentGame?.status === GAME_STATUS.CANCELLED"
      :to="{ name: 'Matchmaking' }"
    >
      Back to Matchmaking
    </RouterLink>
  </div>
</template>
