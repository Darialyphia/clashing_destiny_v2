import 'dotenv/config';
import { container } from './container';
import { RoomManager } from './room-manager';
import { GamesManager } from './games-manager';
import net from 'net';

const PORT = process.env.PORT || 8000;

async function main() {
  net.setDefaultAutoSelectFamilyAttemptTimeout(1000);
  container.resolve<RoomManager>(RoomManager.INJECTION_KEY).init();
  await container.resolve<GamesManager>(GamesManager.INJECTION_KEY).init();

  const httpServer = container.resolve('http');

  const shutdown = async (signal: string) => {
    console.log('shutting down', { signal });
    await container.resolve<RoomManager>(RoomManager.INJECTION_KEY).shutdown();
    httpServer.close(() => process.exit(0));
    process.exit(0);
  };

  try {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    console.error(err);
    await shutdown('ERROR');
  }
}

void main();
