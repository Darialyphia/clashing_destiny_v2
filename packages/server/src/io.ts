import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff
} from '@game/engine/src/game/systems/game-snapshot.system';
import url from 'url';

type SocketData = {
  user: any;
  sessionId: string;
};

export type EmittedEvents = {
  gameInitialState: (
    state: GameStateSnapshot<SerializedPlayerState | SerializedOmniscientState>
  ) => void;
  gameSnapshot: (snapshot: GameStateSnapshot<SnapshotDiff>) => void;
  error: (message: string) => void;
};

export type ReceivedEvents = {
  join: (data: { gameId: string; type: 'spectator' | 'player' }) => void;
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

export const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-type': 'text/plain' });
  res.write('Game server works !');
  res.end();
});
export const io: Ioserver = new Server({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
