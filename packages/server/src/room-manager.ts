import type { Ioserver } from './io';
import { Room, ROOM_EVENTS, type RoomOptions } from './room';
import type { ConvexHttpClient } from 'convex/browser';
import { api, type GameId } from '@game/api';

export class RoomManager {
  static INJECTION_KEY = 'roomManager' as const;

  private rooms = new Map<string, Room>();

  constructor(private ctx: { io: Ioserver; convexHttpClient: ConvexHttpClient }) {
    this.ctx.io.use(async (socket, next) => {
      try {
        const sessionId = socket.handshake.auth.sessionId;
        console.log('New connection, authenticating...');
        console.log('socket session id:', sessionId);
        const user = await this.ctx.convexHttpClient.query(api.auth.me, {
          sessionId
        } as any);
        if (!user) return next(new Error('Unauthorized'));

        socket.data.user = user;
        socket.data.sessionId = sessionId;
        next();
      } catch (err) {
        console.error(err);
        next(new Error('Unauthorized'));
      }
    });

    this.ctx.io.on('connection', socket => {
      console.log(`Socket connected: ${socket.id}`);
      socket.on('join', async ({ gameId, type }) => {
        console.log(`Socket ${socket.id} joining game ${gameId} as ${type}`);
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
    console.log('creating room', id);
    const room = new Room(id, this.ctx.io, options);
    this.rooms.set(id, room);

    room.once(ROOM_EVENTS.ALL_PLAYERS_JOINED, async () => {
      await this.ctx.convexHttpClient.mutation(api.games.start, {
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

  async shutdown() {
    await Promise.all(Array.from(this.rooms.values()).map(room => room.shutdown()));
  }
}
