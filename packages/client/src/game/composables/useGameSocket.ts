import { useAuth } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
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

type ClockStage = {
  max: number;
  remaining: number;
  isActive: boolean;
};

export type PlayerClockState = {
  primary: ClockStage;
  secondary: ClockStage;
  consecutiveTimeouts: number;
  isPenalized: boolean;
};

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
  gameInput: (input: SerializedInput) => void;
};

export const useGameSocket = () => {
  const auth = useAuth();
  const { data: me } = useMe();
  const socketError = ref(null as string | null);

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

  // the game page only mounts once the game server has created the room, so it can be joined right away.
  // joining on every connection puts the player back in the game after a reconnection
  socket.value.on('connect', () => {
    socketError.value = null;
    socket.value.emit('join', {
      gameId: me.value.currentGame!.id as GameId,
      type: 'player'
    });
  });
  socket.value.on('gameInitialState', data => {
    console.log('Received initial game state from server', data);
  });
  socket.value.on('connect_error', err => {
    socketError.value = err.message;
  });
  socket.value.on('error', err => {
    socketError.value = err;
  });

  until(auth.sessionId)
    .toBeTruthy()
    .then(() => {
      socket.value.connect();
    });

  onUnmounted(() => {
    socket.value.disconnect();
  });

  return { socket, socketError };
};
