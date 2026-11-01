import { useAuth } from '@/auth/composables/useAuth';
import { type GameId, type UserId } from '@game/api';
import type {
  GameStateSnapshot,
  SerializedPlayerState,
  SerializedOmniscientState,
  PatchBasedSnapshotDiff
} from '@game/engine/src/game/systems/game-snapshot.system';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { until } from '@vueuse/core';
import { io, type Socket } from 'socket.io-client';
import type { PlayerClockState } from './useGameSocket';

export type ServerToClientEvents = {
  gameInitialState: (data: {
    snapshot: GameStateSnapshot<
      SerializedPlayerState | SerializedOmniscientState
    >;
    history: SerializedInput[];
  }) => void;
  gameSnapshot: (snapshot: GameStateSnapshot<PatchBasedSnapshotDiff>) => void;
  error: (message: string) => void;
  clockUpdate: (
    clocks: Record<UserId, PlayerClockState>
  ) => void;
};

export type ClientToServerEvents = {
  join: (data: { gameId: string; type: 'spectator' | 'player' }) => void;
};

export const useSpectatorSocket = (gameId: GameId) => {
  const auth = useAuth();

  const socket = shallowRef(
    io(import.meta.env.VITE_GAME_SERVER_URL, {
      transports: ['websocket'],
      upgrade: false,
      auth: cb => {
        cb({ sessionId: auth.sessionId.value });
      },
      autoConnect: false
    })
  ) as Ref<Socket<ServerToClientEvents, ClientToServerEvents>>;

  // the watch page only mounts once the game server has created the room, so it can be joined right away.
  // joining on every connection puts the spectator back in the game after a reconnection
  socket.value.on('connect', () => {
    socket.value.emit('join', {
      gameId,
      type: 'spectator'
    });
  });
  socket.value.on('connect_error', err => {
    console.log('socket connect error', err);
  });
  socket.value.on('error', err => {
    console.log('socket error', err);
  });

  until(auth.sessionId)
    .toBeTruthy()
    .then(() => {
      socket.value.connect();
    });

  onUnmounted(() => {
    socket.value.disconnect();
  });

  return socket;
};
