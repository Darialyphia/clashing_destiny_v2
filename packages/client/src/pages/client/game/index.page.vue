<script setup lang="ts">
import { useMe } from '@/auth/composables/useMe';
import PVPGame from '@/game/components/PVPGame.vue';
import { useGameInfos } from '@/game/composables/useGameInfos';
import FancyButton from '@/ui/components/FancyButton.vue';
import { GAME_STATUS } from '@game/api';

definePage({
  name: 'CurrentGame'
});

const { data: me } = useMe();

const { data: gameInfos } = useGameInfos(
  computed(() => me.value?.currentGame?.id ?? null)
);
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
  <div v-else-if="me.currentGame.status === GAME_STATUS.FINISHED">
    <p v-if="gameInfos?.winnerId === me.id">
      Congratulations! You won the game!
    </p>
    <p v-else-if="!gameInfos?.winnerId">The game ended in a draw.</p>
    <p v-else>You lost the game. Better luck next time!</p>

    <RouterLink :to="{ name: 'ClientHome' }" custom v-slot="{ navigate, href }">
      <FancyButton :href="href" text="Back to Home" @click="navigate" />
    </RouterLink>
  </div>
  <PVPGame v-else :key="me?.currentGame?.id" />
</template>
