import {
  addPlugins,
  cleanupOutdatedCaches,
  getCacheKeyForURL,
  precacheAndRoute,
  type PrecacheEntry
} from 'workbox-precaching';
import type { WorkboxPlugin } from 'workbox-core';
import {
  DOWNLOAD_PROGRESS_MESSAGE,
  type DownloadProgressMessage
} from './app-update/download-progress';

declare let self: ServiceWorkerGlobalScope & {
  addEventListener: any;
  skipWaiting: any;
  Notification: any;
};

self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/** `bytes` is added at build time, see `manifestTransforms` in vite.config.ts. */
type ManifestEntry = PrecacheEntry & { bytes?: number };

const PROGRESS_REPORT_INTERVAL_MS = 100;

/**
 * Tells the open pages how much of the update has been downloaded while this
 * worker installs, for the update screen's progress bar.
 *
 * Counts the bytes written to the precache, as they stream in, out of the size
 * of the files that weren't cached yet: unchanged files aren't downloaded again.
 */
const createDownloadProgressPlugin = (
  manifest: Array<ManifestEntry | string>
): WorkboxPlugin => {
  let total: Promise<number> | undefined;
  let loaded = 0;
  let lastReportAt = 0;

  const computeTotal = async () => {
    let bytes = 0;
    for (const entry of manifest) {
      if (typeof entry === 'string' || !entry.bytes) continue;
      const cacheKey = getCacheKeyForURL(entry.url);
      if (cacheKey && !(await caches.match(cacheKey))) bytes += entry.bytes;
    }
    return bytes;
  };

  const report = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastReportAt < PROGRESS_REPORT_INTERVAL_MS) return;
    lastReportAt = now;

    const totalBytes = await total;
    if (!totalBytes) return;
    const message: DownloadProgressMessage = {
      type: DOWNLOAD_PROGRESS_MESSAGE,
      loaded: Math.min(loaded, totalBytes),
      total: totalBytes
    };
    // The pages are still controlled by the previous worker, hence `includeUncontrolled`.
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });
    clients.forEach(client => client.postMessage(message));
  };

  return {
    async requestWillFetch({ request, event }) {
      // Before the first download: what's already cached is what's left out.
      if (event?.type === 'install') await (total ??= computeTotal());
      return request;
    },
    async fetchDidSucceed({ response, event }) {
      if (event?.type !== 'install' || !response.body) return response;
      const counter = new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          loaded += chunk.byteLength;
          void report();
          controller.enqueue(chunk);
        },
        flush() {
          void report(true);
        }
      });
      return new Response(response.body.pipeThrough(counter), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
  };
};

if (import.meta.env.PROD) {
  // self.__WB_MANIFEST is default injection point. Workbox replaces it with the
  // file list at build time and requires it to appear exactly once.
  const manifest = self.__WB_MANIFEST;
  precacheAndRoute(manifest);
  addPlugins([createDownloadProgressPlugin(manifest)]);

  // clean old assets
  cleanupOutdatedCaches();

  // to allow work offline
  // registerRoute(
  //   new NavigationRoute(createHandlerBoundToURL('index.html'), {
  //     // /.well-known must reach the server: it holds assetlinks.json, which
  //     // proves domain ownership for the Android TWA
  //     denylist: [new RegExp('/api'), new RegExp('^/\\.well-known/')]
  //   })
  // );
}
