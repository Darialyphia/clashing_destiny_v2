import 'dotenv/config';
import { container } from './container';
import { RoomManager } from './room-manager';
import { GamesManager } from './games-manager';
import net from 'net';

const PORT = process.env.PORT || 8000;

async function main() {
  try {
    net.setDefaultAutoSelectFamilyAttemptTimeout(1000);
    container.resolve(RoomManager.INJECTION_KEY);
    container.resolve<GamesManager>(GamesManager.INJECTION_KEY).listen();

    const httpServer = container.resolve('http');
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`Process error: shutting down all ongoing games`);
    console.error(err);
    await container.resolve<RoomManager>(RoomManager.INJECTION_KEY).shutdown();
    process.exit(0);
  }
}

void main();
