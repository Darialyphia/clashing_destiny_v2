import { useAuth } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { type GameId } from '@game/api';
import type {
  GameStateSnapshot,
  SerializedPlayerState,
  SerializedOmniscientState,
  SnapshotDiff
} from '@game/engine/src/game/systems/game-snapshot.system';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { until } from '@vueuse/core';
import { io, type Socket } from 'socket.io-client';

export type ServerToClientEvents = {
  gameInitialState: (data: {
    snapshot: GameStateSnapshot<
      SerializedPlayerState | SerializedOmniscientState
    >;
    history: SerializedInput[];
  }) => void;
  gameSnapshot: (snapshot: GameStateSnapshot<SnapshotDiff>) => void;
  error: (message: string) => void;
};

export type ClientToServerEvents = {
  join: (data: { gameId: string; type: 'spectator' | 'player' }) => void;
  gameInput: (input: SerializedInput) => void;
};

export const useGameSocket = () => {
  const auth = useAuth();
  const { data: me } = useMe();

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

  until(auth.sessionId)
    .toBeTruthy()
    .then(() => {
      socket.value.connect();

      // @HACK to give time to the game server to register the game room.
      // This should be fixed by adding a new status to the game : CREATED => WAITING_FOR_PLAYERS
      setTimeout(() => {
        socket.value.emit('join', {
          gameId: me.value.currentGame!.id as GameId,
          type: 'player'
        });
      }, 2000);

      socket.value.on('connect_error', err => {
        console.log('socket connect error', err);
      });
      socket.value.on('error', err => {
        console.log('socket error', err);
      });
    });

  onUnmounted(() => {
    socket.value.disconnect();
  });

  return socket;
};
