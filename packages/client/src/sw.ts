import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope & {
  addEventListener: any;
  skipWaiting: any;
  Notification: any;
};

self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

if (import.meta.env.PROD) {
  // self.__WB_MANIFEST is default injection point
  precacheAndRoute(self.__WB_MANIFEST);

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
