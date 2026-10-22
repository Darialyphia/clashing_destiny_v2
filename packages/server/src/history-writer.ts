import type { SerializedInput } from '@game/engine/src/input/input-system';

type WriteHistory = (history: SerializedInput[]) => Promise<unknown>;

/**
 * Persists the full input history, keeping at most one write in flight.
 * While a write is in flight, newer histories replace the pending one (latest wins).
 * The history only ever grows, so this guarantees that an older history can never overwrite a newer one.
 */
export class HistoryWriter {
  private pending: SerializedInput[] | null = null;

  private inFlight: Promise<void> | null = null;

  private closed = false;

  constructor(private write: WriteHistory) {}

  schedule(history: SerializedInput[]) {
    if (this.closed) return;

    this.pending = history;
    if (!this.inFlight) {
      this.inFlight = this.drain();
    }
  }

  flush() {
    return this.inFlight ?? Promise.resolve();
  }

  // stops accepting new histories, and resolves once the pending one has been written
  close() {
    this.closed = true;
    return this.flush();
  }

  private async drain() {
    try {
      while (this.pending) {
        const history = this.pending;
        this.pending = null;
        try {
          await this.write(history);
        } catch (err) {
          console.error('[HISTORY WRITER] Failed to persist history', err);
        }
      }
    } finally {
      this.inFlight = null;
    }
  }
}
