import { Server, Socket } from "socket.io";
import { ConvexHttpClient } from "convex/browser";
import type {
  GameStateSnapshot,
  SerializedPlayerState,
  SnapshotDiff,
} from "@game/engine/src/game/systems/game-snapshot.system";

type SocketData = {
  convexClient: ConvexHttpClient;
  user: any;
  sessionId: string;
};

export type EmittedEvents = {
  gameInitialState: (state: GameStateSnapshot<SerializedPlayerState>) => void;
  gameSnapshot: (snapshot: GameStateSnapshot<SnapshotDiff>) => void;
};

export type ReceivedEvents = {
  joinAsPlayer: (data: { gameId: string }) => void;
  joinAsSpectator: (data: { gameId: string }) => void;
};

export type GameServer = Server<
  ReceivedEvents,
  EmittedEvents,
  Record<string, never>,
  SocketData
>;

export type GameSocket = Socket<
  ReceivedEvents,
  EmittedEvents,
  Record<string, never>,
  SocketData
>;
