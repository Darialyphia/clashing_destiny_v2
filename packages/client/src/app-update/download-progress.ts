/**
 * Posted by an installing service worker (sw.ts) to the open pages while it
 * downloads an update, so the update screen can show a progress bar.
 */
export const DOWNLOAD_PROGRESS_MESSAGE = 'APP_UPDATE_DOWNLOAD_PROGRESS';

export type DownloadProgressMessage = {
  type: typeof DOWNLOAD_PROGRESS_MESSAGE;
  /** Bytes downloaded so far. */
  loaded: number;
  /** Bytes to download: files unchanged since the current version aren't. */
  total: number;
};

export const isDownloadProgressMessage = (
  data: unknown
): data is DownloadProgressMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as { type?: unknown }).type === DOWNLOAD_PROGRESS_MESSAGE;
