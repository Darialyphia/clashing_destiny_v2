<script setup lang="ts">
import type { NetworkAdapter } from '@game/engine/src/client/client';
import { provideGameClient } from '../composables/useGameClient';
import { useFxAdapter } from '../composables/useFxAdapter';
import GameBoard from './GameBoard.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import type { GameInfos } from '@game/api';
import { useSpectatorSocket } from '../composables/useSpectatorSocket';

const { game } = defineProps<{ game: GameInfos }>();

const socket = useSpectatorSocket(game.id);
const networkAdapter: NetworkAdapter = {
  dispatch: () => {},
  subscribe(cb) {
    socket.value.on('gameSnapshot', cb);
  },
  sync(lastSnapshotId) {
    console.log('TODO: sync snapshots from sandbox worker', lastSnapshotId);
    return Promise.resolve([]);
  }
};

const fxAdapter = useFxAdapter();

const { client } = provideGameClient({
  networkAdapter,
  fxAdapter,
  gameType: 'online',
  playerId: game.players[0].user.id,
  isSpectator: true
});

socket.value.on('gameInitialState', async state => {
  await client.value.initialize(state.snapshot, state.history);
});

const clocks = ref<{
  [playerId: string]: {
    turn: { max: number; remaining: number; isActive: boolean };
    action: { max: number; remaining: number; isActive: boolean };
  };
}>({});

socket.value.on('clockUpdate', updatedClocks => {
  clocks.value = updatedClocks;
});
</script>

<template>
  <GameBoard
    v-if="client.isReady"
    :clocks="clocks"
    :options="{
      teachingMode: true
    }"
  >
    <template #menu>
      <FancyButton
        text="Surrender"
        variant="error"
        class="w-full"
        @click="client.surrender()"
      />
    </template>
  </GameBoard>
</template>
