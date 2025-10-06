import 'dotenv/config';
import { api } from '@game/api';
import { httpServer, io } from './io';
import { container } from './container';
import { RoomManager } from './room-manager';
import { GamesManager } from './games-manager';

const PORT = process.env.PORT || 8000;

async function main() {
  try {
    io.use(async (socket, next) => {
      try {
        const sessionId = socket.handshake.auth.sessionId;

        // @ts-expect-error
        const user = await client.query(api.auth.me, { sessionId });
        if (!user) return next(new Error('Unauthorized'));

        socket.data.user = user;
        socket.data.sessionId = sessionId;
        next();
      } catch (err) {
        console.error(err);
        next(new Error('Unauthorized'));
      }
    });
    container.resolve<GamesManager>(GamesManager.INJECTION_KEY).listen();

    httpServer.listen(PORT);
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error(`Process error: shutting down all ongoing games`);
    console.error(err);
    await container.resolve<RoomManager>(RoomManager.INJECTION_KEY).shutdown();
    process.exit(0);
  }
}

void main();
