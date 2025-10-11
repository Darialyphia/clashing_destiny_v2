<script setup lang="ts">
import SpectatorGame from '@/game/components/SpectatorGame.vue';
import { useGameInfos } from '@/game/composables/useGameInfos';
import FancyButton from '@/ui/components/FancyButton.vue';
import { GAME_STATUS, type GameId } from '@game/api';

definePage({
  name: 'WatchGame'
});

const route = useRoute<'WatchGame'>();

const { data: gameInfos, error } = useGameInfos(
  computed(() => route.params.id as GameId)
);
</script>

<template>
  <div v-if="error" class="h-screen flex flex-col items-center justify-center">
    <p class="c-red-6">{{ (error as any).data }}</p>
    <RouterLink :to="{ name: 'ClientHome' }" custom v-slot="{ navigate, href }">
      <FancyButton :href="href" text="Back to Home" @click="navigate" />
    </RouterLink>
  </div>

  <div v-else-if="gameInfos?.status === GAME_STATUS.CANCELLED">
    The game was cancelled.
    <FancyButton text="Back to Home" :to="{ name: 'ClientHome' }" />
  </div>
  <div v-else-if="gameInfos?.status === GAME_STATUS.FINISHED">
    <p>The game has finished</p>
    <RouterLink :to="{ name: 'ClientHome' }" custom v-slot="{ navigate, href }">
      <FancyButton :href="href" text="Back to Home" @click="navigate" />
    </RouterLink>
  </div>
  <SpectatorGame v-else-if="gameInfos" :game="gameInfos" />
</template>
