import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '@game/engine/src/game/systems/game-snapshot.system';
import type { SerializedInput } from '@game/engine/src/input/input-system';

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

export const httpServer = createServer();
export const io: Ioserver = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
