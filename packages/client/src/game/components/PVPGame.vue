<script setup lang="ts">
import { isDefined } from '@game/shared';
import type { NetworkAdapter } from '@game/engine/src/client/client';
import { useGameSocket } from '../composables/useGameSocket';
import { provideGameClient } from '../composables/useGameClient';
import { useFxAdapter } from '../composables/useFxAdapter';
import { useMe } from '@/auth/composables/useMe';
import GameBoard from './GameBoard.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiModal from '@/ui/components/UiModal.vue';

const { data: me } = useMe();
const { socket, socketError } = useGameSocket();
const networkAdapter: NetworkAdapter = {
  dispatch: input => {
    socket.value.emit('gameInput', input);
  },
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
  playerId: me.value!.id,
  isSpectator: false
});

socket.value.on('gameInitialState', async state => {
  console.log('Received initial game state', state);
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
      teachingMode: me.currentGame?.options.teachingMode || false
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
  <p v-else>Waiting for initial state...</p>
  <UiModal
    :is-opened="isDefined(socketError)"
    title="Connection Error"
    description="''"
  >
    <p v-if="socketError">{{ socketError }}</p>
    <p>Try Refreshing your browser.</p>
  </UiModal>
</template>
