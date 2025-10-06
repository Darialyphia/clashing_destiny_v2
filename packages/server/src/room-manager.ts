import type { Ioserver } from './io';
import { Room, ROOM_EVENTS, type RoomOptions } from './room';
import type { ConvexHttpClient } from 'convex/browser';
import { api, type GameId } from '@game/api';

export class RoomManager {
  static INJECTION_KEY = 'roomManager' as const;

  private rooms = new Map<string, Room>();

  constructor(private ctx: { io: Ioserver; convexHttpclient: ConvexHttpClient }) {
    this.ctx.io.on('connection', socket => {
      socket.on('join', async ({ gameId, type }) => {
        const room = this.getRoom(gameId);
        if (room) {
          await room.join(socket, type);
        } else {
          socket.emit('error', 'Room not found');
        }
      });
    });
  }

  createRoom(id: GameId, options: RoomOptions) {
    const room = new Room(id, this.ctx.io, options);
    this.rooms.set(id, room);

    room.once(ROOM_EVENTS.ALL_PLAYERS_JOINED, async () => {
      await this.ctx.convexHttpclient.mutation(api.games.start, {
        gameId: id,
        apiKey: process.env.CONVEX_API_KEY!
      });
    });
  }

  async destroyRoom(id: string) {
    const room = this.rooms.get(id);
    if (room) {
      await room.shutdown();
      this.rooms.delete(id);
    }
  }

  hasRoom(id: string) {
    return this.rooms.has(id);
  }

  getRoom(id: string) {
    return this.rooms.get(id);
  }
}
