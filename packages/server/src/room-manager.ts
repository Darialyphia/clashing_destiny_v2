import type { Ioserver } from './io';
import { Room, ROOM_EVENTS, type RoomOptions } from './room';
import type { ConvexHttpClient } from 'convex/browser';
import { api, type GameId, type UserId } from '@game/api';
import type { Redis } from '@upstash/redis';
import { REDIS_KEYS } from './redis';
import type { SerializedInput } from '@game/engine/src/input/input-system';

export class RoomManager {
  static INJECTION_KEY = 'roomManager' as const;

  private rooms = new Map<string, Room>();

  constructor(
    private ctx: { io: Ioserver; convexHttpClient: ConvexHttpClient; redis: Redis }
  ) {
    this.ctx.io.use(async (socket, next) => {
      try {
        const sessionId = socket.handshake.auth.sessionId;
        console.log('[IO] Authenticating socket', sessionId);
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
      console.log(`[IO] Socket connected: ${socket.id}`);
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

  async createRoom(id: GameId, options: RoomOptions) {
    console.log('[ROOM MANAGER] creating room', id);
    const history = await this.ctx.redis.json.get<SerializedInput[]>(
      REDIS_KEYS.GAME_HISTORY(id)
    );
    if (history) {
      options.initialState.history = history;
    }
    const room = new Room(id, this.ctx.io, options);
    this.rooms.set(id, room);

    room.once(ROOM_EVENTS.ALL_PLAYERS_JOINED, async () => {
      await this.ctx.convexHttpClient.mutation(api.games.start, {
        gameId: id,
        apiKey: process.env.CONVEX_API_KEY!
      });
    });

    room.on(ROOM_EVENTS.INPUT_END, async (inputs: SerializedInput[]) => {
      await this.ctx.redis.json.set(REDIS_KEYS.GAME_HISTORY(id), '$', inputs);
    });

    room.once(ROOM_EVENTS.GAME_OVER, async ({ winnerId }) => {
      await this.ctx.convexHttpClient.mutation(api.games.finish, {
        gameId: id,
        winnerId: winnerId as UserId | null,
        apiKey: process.env.CONVEX_API_KEY!
      });
      await this.ctx.redis.del(REDIS_KEYS.GAME_HISTORY(id));
      await this.destroyRoom(id);
      this.ctx.io.in(id).disconnectSockets();
    });

    room.on(ROOM_EVENTS.CLOCK_TICK, clocks => {
      this.ctx.io.in(id).emit('clockUpdate', clocks);
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
