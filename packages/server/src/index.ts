import 'dotenv/config';
import { api } from '@game/api';
import type { GameId } from '@game/api/src/convex/game/entities/game.entity';
import { httpServer, io } from './io';

const PORT = process.env.PORT || 8000;

type Game = any; // TODO Replace with Game type once implemented

async function main() {
  try {
    httpServer.listen(PORT);

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

    io.on('connection', async socket => {
      if (!isSpectator) {
        // handlePlayerSocket(io, socket, ongoingGames, gameId);
      } else {
        // handleSpectatorSocket(io, socket, ongoingGames, gameId);
      }
    });

    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error(`Process error: shutting down all ongoing games`);
    console.error(err);
    // @TODO gracefully shutdown all ongoing games
    process.exit(0);
  }
}

void main();
