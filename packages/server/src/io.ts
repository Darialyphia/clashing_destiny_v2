import { Server, Socket } from 'socket.io';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '@game/engine/src/game/systems/game-snapshot.system';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import type { HttpServer } from './http';
import type { UserId } from '@game/api';

type SocketData = {
  user: any;
  sessionId: string;
};

export type EmittedEvents = {
  gameInitialState: (data: {
    snapshot: GameStateSnapshot<SerializedPlayerState | SerializedOmniscientState>;
    history: SerializedInput[];
  }) => void;
  gameSnapshot: (snapshot: GameStateSnapshot<SnapshotDiff>) => void;
  clockUpdate: (
    clocks: Record<
      UserId,
      {
        turn: { max: number; remaining: number; isActive: boolean };
        action: { max: number; remaining: number; isActive: boolean };
      }
    >
  ) => void;
  error: (message: string) => void;
};

export type ReceivedEvents = {
  join: (data: { gameId: string; type: 'spectator' | 'player' }) => void;
  gameInput: (input: SerializedInput) => void;
};

export type Ioserver = Server<
  ReceivedEvents,
  EmittedEvents,
  Record<string, never>,
  SocketData
>;

export type IoSocket = Socket<
  ReceivedEvents,
  EmittedEvents,
  Record<string, never>,
  SocketData
>;

export const io = ({ http }: { http: HttpServer }) => {
  const ioServer: Ioserver = new Server(http, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  return ioServer;
};
