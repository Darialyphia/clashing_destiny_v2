import type { Game } from '@game/engine/src/game/game';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import type { IoSocket } from '../io';
import type { TurnTimers } from './turn-timers';

export type SnapshotViewer =
  | { kind: 'omniscient' }
  | { kind: 'player'; playerId: string };

/**
 * Sends the current game state to the socket, then streams every new snapshot to it.
 * Returns a function that stops the stream.
 */
export const attachViewer = (engine: Game, socket: IoSocket, viewer: SnapshotViewer) => {
  const snapshot =
    viewer.kind === 'omniscient'
      ? engine.snapshotSystem.getLatestOmniscientSnapshot()
      : engine.snapshotSystem.getLatestSnapshotForPlayer(viewer.playerId);

  socket.emit('gameInitialState', {
    snapshot,
    history: engine.inputSystem.serialize()
  });

  const onSnapshot: Parameters<Game['subscribeOmniscient']>[0] = snapshot => {
    socket.emit('gameSnapshot', snapshot);
  };

  return viewer.kind === 'omniscient'
    ? engine.subscribeOmniscient(onSnapshot)
    : engine.subscribeForPlayer(viewer.playerId, onSnapshot);
};

/**
 * Forwards the player's inputs to the engine.
 * Returns a function that stops listening.
 */
export const attachInputRelay = (
  engine: Game,
  turnTimers: TurnTimers,
  socket: IoSocket,
  playerId: string
) => {
  const onInput = async (input: SerializedInput) => {
    turnTimers.recordPlayerInput(playerId);
    // never trust the client with its own identity, otherwise it could play for its opponent
    input.payload.playerId = playerId;
    await engine.inputSystem.dispatch(input);
  };

  socket.on('gameInput', onInput);
  return () => {
    socket.off('gameInput', onInput);
  };
};
