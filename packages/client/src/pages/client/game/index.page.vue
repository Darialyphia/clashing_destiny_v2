<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import PVPGame from '@/game/components/PVPGame.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import { GAME_STATUS } from '@game/api';

definePage({
  name: 'CurrentGame'
});

const { data: me } = useMe();
</script>

<template>
  <p v-if="!me">Loading player data...</p>
  <div v-else-if="!me?.currentGame">
    You have no ongoing game.
    <RouterLink :to="{ name: 'ClientHome' }" custom v-slot="{ navigate, href }">
      <FancyButton :href="href" text="Back to Home" @click="navigate" />
    </RouterLink>
  </div>
  <div v-else-if="me.currentGame.status === GAME_STATUS.CANCELLED">
    The game was cancelled.
    <RouterLink :to="{ name: 'ClientHome' }" custom v-slot="{ navigate, href }">
      <FancyButton :href="href" text="Back to Home" @click="navigate" />
    </RouterLink>
  </div>
  <PVPGame v-else :key="me?.currentGame?.id" />
</template>
