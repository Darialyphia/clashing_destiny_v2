<script setup lang="ts">
import type { NetworkAdapter } from '@game/engine/src/client/client';
import { useGameSocket } from '../composables/useGameSocket';
import { provideGameClient } from '../composables/useGameClient';
import { useFxAdapter } from '../composables/useFxAdapter';
import { useMe } from '@/auth/composables/useMe';
import GameBoard from './GameBoard.vue';

const { data: me } = useMe();
const socket = useGameSocket();
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
  playerId: me.value!.id
});

socket.value.on('gameInitialState', async state => {
  await client.value.initialize(state.snapshot, state.history);
});
</script>

<template>
  <GameBoard v-if="client.isReady" />
</template>
