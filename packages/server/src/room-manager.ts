import type { Ioserver } from './io';
import { Room, ROOM_EVENTS, type RoomOptions } from './room';
import type { ConvexHttpClient } from 'convex/browser';
import { api, type GameId, type UserId } from '@game/api';
import type { Redis } from '@upstash/redis';
import { deleteGameKeys, REDIS_KEYS, REDIS_TTL_SECONDS } from './redis';
import { HistoryWriter } from './history-writer';
import type { SerializedInput } from '@game/engine/src/input/input-system';

export class RoomManager {
  static INJECTION_KEY = 'roomManager' as const;

  private rooms = new Map<string, Room>();

  private pendingRooms = new Map<string, Promise<Room>>();

  private historyWriters = new Map<string, HistoryWriter>();

  constructor(
    private ctx: { io: Ioserver; convexHttpClient: ConvexHttpClient; redis: Redis }
  ) {}

  init() {
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

  createRoom(id: GameId, options: RoomOptions): Promise<Room> {
    const existing = this.rooms.get(id);
    if (existing) return Promise.resolve(existing);

    // the slot is reserved synchronously so concurrent calls can't create two rooms for the same game
    let pending = this.pendingRooms.get(id);
    if (!pending) {
      pending = this.buildRoom(id, options).finally(() => {
        this.pendingRooms.delete(id);
      });
      this.pendingRooms.set(id, pending);
    }
    return pending;
  }

  private async buildRoom(id: GameId, options: RoomOptions) {
    console.log('[ROOM MANAGER] creating room', id);
    const history = await this.ctx.redis.json.get<SerializedInput[]>(
      REDIS_KEYS.GAME_HISTORY(id)
    );
    if (history) {
      options.initialState.history = history;
    }
    const room = new Room(id, this.ctx.io, options);
    const historyWriter = new HistoryWriter(async inputs => {
      await this.ctx.redis
        .pipeline()
        .json.set(REDIS_KEYS.GAME_HISTORY(id), '$', inputs)
        .expire(REDIS_KEYS.GAME_HISTORY(id), REDIS_TTL_SECONDS)
        .exec();
    });
    this.rooms.set(id, room);
    this.historyWriters.set(id, historyWriter);

    room.once(ROOM_EVENTS.ALL_PLAYERS_JOINED, async () => {
      try {
        await this.ctx.convexHttpClient.mutation(api.games.start, {
          gameId: id,
          apiKey: process.env.CONVEX_API_KEY!
        });
      } catch (err) {
        console.error('[ROOM MANAGER] Failed to start game', id, err);
      }
    });

    room.on(ROOM_EVENTS.INPUT_END, inputs => {
      historyWriter.schedule(inputs);
    });

    room.once(ROOM_EVENTS.GAME_OVER, async ({ winnerId }) => {
      try {
        await this.ctx.convexHttpClient.mutation(api.games.finish, {
          gameId: id,
          winnerId: winnerId as UserId | null,
          apiKey: process.env.CONVEX_API_KEY!
        });
        // @TODO generate game replay from engine snapshots and upload to convex

        // destroying the room waits for pending history writes, so the keys can't be recreated after deletion
        await this.destroyRoom(id);
        await deleteGameKeys(this.ctx.redis, id);
      } catch (err) {
        console.error('[ROOM MANAGER] Failed to finish game', id, err);
      }
    });

    room.on(ROOM_EVENTS.CLOCK_TICK, clocks => {
      this.ctx.io.in(id).emit('clockUpdate', clocks);
    });

    return room;
  }

  async destroyRoom(id: string) {
    await this.pendingRooms.get(id)?.catch(() => undefined);

    const room = this.rooms.get(id);
    if (!room) return;

    const historyWriter = this.historyWriters.get(id);
    this.rooms.delete(id);
    this.historyWriters.delete(id);

    try {
      await room.shutdown();
    } finally {
      await historyWriter?.close();
    }
  }
  hasRoom(id: string) {
    return this.rooms.has(id) || this.pendingRooms.has(id);
  }

  getRoom(id: string) {
    return this.rooms.get(id);
  }

  async shutdown() {
    await Promise.all(Array.from(this.rooms.keys()).map(id => this.destroyRoom(id)));
  }
}
