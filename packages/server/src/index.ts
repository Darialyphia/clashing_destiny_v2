import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { api } from "@game/api";
import { ConvexHttpClient } from "convex/browser";
import type { GameServer } from "./types";
import type { GameId } from "@game/api/src/convex/game/entities/game.entity";

const PORT = process.env.PORT || 8000;

type Game = any; // TODO Replace with Game type once implemented

async function main() {
  const ongoingGames = new Map<string, Game>();
  try {
    const httpServer = createServer();
    const io: GameServer = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    const convexClient = new ConvexHttpClient(process.env.CONVEX_URL!);

    httpServer.listen(PORT);

    io.use(async (socket, next) => {
      try {
        const sessionId = socket.handshake.auth.sessionId;

        // @ts-expect-error
        const user = await client.query(api.auth.me, { sessionId });
        if (!user) return next(new Error("Unauthorized"));

        socket.data.convexClient = convexClient;
        socket.data.user = user;
        socket.data.sessionId = sessionId;
        next();
      } catch (err) {
        console.error(err);
        next(new Error("Unauthorized"));
      }
    });

    io.on("connection", async (socket) => {
      const spectator = socket.handshake.query.spectator;
      const isSpectator = spectator === "true";

      const gameId = socket.handshake.query.gameId as GameId;

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
    await Promise.all(
      [...ongoingGames.values()].map((game) => game.shutdown())
    );
    process.exit(0);
  }
}

main();
