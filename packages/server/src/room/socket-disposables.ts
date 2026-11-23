import type { IoSocket } from '../io';

type Disposer = () => void;

/**
 * Collects the teardown functions (listeners, subscriptions...) attached to each socket,
 * so they can all be released when the socket leaves the room.
 */
export class SocketDisposables {
  private disposers = new Map<IoSocket, Disposer[]>();

  add(socket: IoSocket, ...disposers: Disposer[]) {
    if (!this.disposers.has(socket)) {
      this.disposers.set(socket, []);
    }
    this.disposers.get(socket)!.push(...disposers);
  }

  dispose(socket: IoSocket) {
    this.disposers.get(socket)?.forEach(dispose => dispose());
    this.disposers.delete(socket);
  }

  disposeAll() {
    for (const socket of [...this.disposers.keys()]) {
      this.dispose(socket);
    }
  }
}
