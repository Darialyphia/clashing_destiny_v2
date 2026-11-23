import type { IoSocket } from '../io';
import type { SocketDisposables } from './socket-disposables';

export type RoomMemberType = 'player' | 'spectator';

/**
 * Tracks which sockets are in the room and in which role.
 * - only the game's players can join as players, everyone else can spectate
 * - a reconnecting player replaces their previous socket
 * - members are removed when their socket disconnects
 */
export class RoomMembership {
  // keyed by user id, so a player only ever has one socket in the room
  private players = new Map<string, IoSocket>();

  private spectators = new Set<IoSocket>();

  constructor(
    private roomId: string,
    private allowedPlayerIds: string[],
    private disposables: SocketDisposables
  ) {}

  get isFull() {
    return this.players.size === this.allowedPlayerIds.length;
  }

  has(socket: IoSocket) {
    return this.players.get(socket.data.user.id) === socket || this.spectators.has(socket);
  }

  get members():Array<{ socket: IoSocket; type: RoomMemberType }> {
    return [
      ...[...this.players.values()].map(socket => ({ socket, type: 'player' as const })),
      ...[...this.spectators].map(socket => ({ socket, type: 'spectator' as const }))
    ];
  }

  /**
   * Returns whether the socket was added.
   */
  async addPlayer(socket: IoSocket) {
    const userId = socket.data.user.id;
    if (!this.allowedPlayerIds.includes(userId)) {
      console.error('Room is full, cannot join as player');
      return false;
    }

    const previousSocket = this.players.get(userId);
    if (previousSocket === socket) return false;
    // the player reconnected before the server noticed their previous socket was gone
    if (previousSocket) {
      await this.remove(previousSocket);
    }

    if (this.isFull) {
      console.error('Room is full, cannot join as player');
      return false;
    }

    await socket.join(this.roomId);
    this.players.set(userId, socket);
    this.removeOnDisconnect(socket);

    return true;
  }

  /**
   * Returns whether the socket was added.
   */
  async addSpectator(socket: IoSocket) {
    if (this.allowedPlayerIds.includes(socket.data.user.id)) return false;

    await socket.join(this.roomId);
    this.spectators.add(socket);
    this.removeOnDisconnect(socket);

    return true;
  }

  async remove(socket: IoSocket) {
    // a reconnected player may already have replaced this socket
    if (this.players.get(socket.data.user.id) === socket) {
      this.players.delete(socket.data.user.id);
    }
    this.spectators.delete(socket);
    this.disposables.dispose(socket);
    await socket.leave(this.roomId);
  }

  private removeOnDisconnect(socket: IoSocket) {
    const onDisconnect = async () => {
      await this.remove(socket);
    };
    socket.on('disconnect', onDisconnect);
    this.disposables.add(socket, () => socket.off('disconnect', onDisconnect));
  }
}
