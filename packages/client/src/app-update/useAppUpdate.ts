import { useRegisterSW } from 'virtual:pwa-register/vue';
import { useConvexQuery } from '@convex-vue/core';
import {
  useDocumentVisibility,
  useEventListener,
  useIntervalFn,
  useTimeoutFn
} from '@vueuse/core';
import { api } from '@game/api';
import { GAME_VERSION, ONE_MINUTE_IN_MS } from '@game/shared';
import { isDownloadProgressMessage } from './download-progress';

/**
 * How long startup may wait for the update check (service worker + API version)
 * before starting the app anyway: slow network, offline, API down...
 * An update that has already started downloading is not subject to it.
 */
const BOOT_CHECK_TIMEOUT_MS = 5000;

/** Single page apps rarely navigate, so the browser rarely checks on its own. */
const PERIODIC_CHECK_INTERVAL_MS = 10 * ONE_MINUTE_IN_MS;
const MIN_DELAY_BETWEEN_VISIBILITY_CHECKS_MS = ONE_MINUTE_IN_MS;

/** Polling while the client and the API disagree and no new client exists yet. */
const DEPLOY_POLL_INTERVAL_MS = 15_000;

/** See `waitForPageToSettle`. */
const PAGE_SETTLED_QUIET_MS = 1000;

/**
 * A player in one of these is never yanked out by a required update:
 * it gets applied when they leave.
 */
const IN_GAME_ROUTES = new Set<string>([
  'CurrentGame',
  'WatchGame',
  'Sandbox',
  'TutorialMission'
]);

export type AppUpdateStatus =
  /** Startup check for a new version, the app isn't mounted yet. */
  | 'checking'
  /** A required update is downloading, it will be applied once done. */
  | 'downloading'
  /** The update is downloaded, the page reloads once the new version takes over. */
  | 'restarting'
  /**
   * Client and API versions differ and no matching client is available yet:
   * one half of a deploy finished before the other.
   */
  | 'waiting-for-deploy'
  | 'ready';

export type AppUpdateNotice =
  /** An optional update is ready, the player chooses when to restart. */
  | 'update-available'
  /** A required update will be applied once the player leaves their game. */
  | 'update-after-game';

/**
 * Resolves once the page has loaded and then gone a moment without fetching
 * anything.
 *
 * Telling the new service worker to take over while the old one is still
 * serving the page's requests (typically right after a reload, with an update
 * already waiting) can make Chrome miss the moment the old one goes idle: it
 * then only activates the new one after a 5 minute fallback timeout.
 */
const waitForPageToSettle = async () => {
  if (document.readyState !== 'complete') {
    await new Promise(resolve =>
      window.addEventListener('load', resolve, { once: true })
    );
  }
  await new Promise<void>(resolve => {
    let timeout: ReturnType<typeof setTimeout>;
    // Entries are added when a request completes, through the worker or not.
    const observer = new PerformanceObserver(() => restartTimeout());
    const restartTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        observer.disconnect();
        resolve();
      }, PAGE_SETTLED_QUIET_MS);
    };
    observer.observe({ type: 'resource' });
    restartTimeout();
  });
};

export const useAppUpdate = () => {
  const route = useRoute();

  // ---- Service worker ----

  // Only a service worker that already controls the page can serve stale files.
  // Without one (first visit, dev without PWA, unsupported browser), this page
  // came straight from the network.
  const hasController = !!navigator.serviceWorker?.controller;

  const registration = shallowRef<ServiceWorkerRegistration>();
  const isSwCheckDone = ref(!hasController);
  const isDownloading = ref(false);
  /** From 0 to 1, null until the installing worker reports it (sw.ts). */
  const downloadProgress = ref<number | null>(null);
  const trackedWorkers = new WeakSet<ServiceWorker>();

  useEventListener(
    navigator.serviceWorker,
    'message',
    (event: MessageEvent) => {
      if (!isDownloadProgressMessage(event.data)) return;
      const { loaded, total } = event.data;
      downloadProgress.value = total > 0 ? Math.min(loaded / total, 1) : null;
    }
  );

  const trackInstallingWorker = (worker: ServiceWorker) => {
    // The very first install isn't an update.
    if (!navigator.serviceWorker.controller || trackedWorkers.has(worker)) {
      return;
    }
    trackedWorkers.add(worker);
    isDownloading.value = true;
    downloadProgress.value = null;

    // Stays true while installed-but-waiting: from there `needRefresh` takes over.
    const onStateChange = () => {
      if (worker.state === 'redundant' || worker.state === 'activated') {
        isDownloading.value = false;
        worker.removeEventListener('statechange', onStateChange);
      }
    };
    worker.addEventListener('statechange', onStateChange);
  };

  // Overlapping checks (timer, tab focus, deploy polling) share the same one.
  let pendingCheck: Promise<void> | undefined;
  const checkForUpdate = () => {
    pendingCheck ??= (async () => {
      const r = registration.value;
      if (!r) return;
      try {
        await r.update();
      } catch {
        // Offline, or the new service worker script failed to load: try again later.
      }
      if (r.installing) trackInstallingWorker(r.installing);
    })().finally(() => {
      pendingCheck = undefined;
    });
    return pendingCheck;
  };

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    // Register right away instead of waiting for the window load event.
    immediate: true,
    async onRegisteredSW(_swUrl, r) {
      if (!r) {
        isSwCheckDone.value = true;
        return;
      }
      registration.value = r;
      r.addEventListener('updatefound', () => {
        if (r.installing) trackInstallingWorker(r.installing);
      });
      if (r.installing) trackInstallingWorker(r.installing);

      // Registering doesn't check for a new version by itself. Unless one is
      // already waiting (downloaded during a previous session): no need to
      // look further, and a check would only delay applying it.
      if (!r.waiting) await checkForUpdate();
      isSwCheckDone.value = true;
    },
    onRegisterError() {
      isSwCheckDone.value = true;
    }
  });

  // ---- API version ----

  const versionQuery = useConvexQuery(api.meta.version, {});
  // The library rejects this promise on error even when nobody awaits it.
  versionQuery.suspense().catch(() => {});
  // An error means an API without `meta.version`, or one that is unreachable:
  // nothing to compare against, so we don't block on it.
  const isVersionKnown = computed(
    () => versionQuery.data.value !== undefined || !!versionQuery.error.value
  );
  const isVersionMismatch = computed(() => {
    const apiVersion = versionQuery.data.value?.gameVersion;
    return apiVersion !== undefined && apiVersion !== GAME_VERSION;
  });

  // ---- Boot ----

  const isBooting = ref(true);
  const isBootTimedOut = ref(false);
  useTimeoutFn(() => {
    isBootTimedOut.value = true;
  }, BOOT_CHECK_TIMEOUT_MS);

  watchEffect(() => {
    if (!isBooting.value) return;
    // An update found at startup is always applied before the app starts.
    // Booting only ends here if it fails to install.
    if (isDownloading.value || needRefresh.value) return;

    const isCheckDone = isSwCheckDone.value && isVersionKnown.value;
    if (isCheckDone || isBootTimedOut.value) {
      isBooting.value = false;
    }
  });

  // Latched: once mounted, the app stays mounted and update screens cover it.
  const shouldRenderApp = ref(false);

  // Only defer for games the player is actually in. After a reload on a game
  // page, the app isn't mounted yet: an update now interrupts nothing.
  const isInGame = computed(
    () => shouldRenderApp.value && IN_GAME_ROUTES.has(route.name as string)
  );

  const mustUpdate = computed(
    () => isBooting.value || (isVersionMismatch.value && !isInGame.value)
  );

  // ---- Applying ----

  const isRestarting = ref(false);
  const applyUpdate = async () => {
    if (isRestarting.value) return;
    isRestarting.value = true;
    await waitForPageToSettle();
    // Tells the waiting service worker to take over. vite-plugin-pwa reloads
    // the page once it does. This is the only reload in the whole flow: never
    // reload because versions differ, that's how reload loops happen.
    await updateServiceWorker();
  };

  watchEffect(() => {
    if (needRefresh.value && mustUpdate.value) void applyUpdate();
  });

  // ---- Status ----

  const status = computed<AppUpdateStatus>(() => {
    if (isRestarting.value) return 'restarting';
    if (!mustUpdate.value) return 'ready';

    if (isDownloading.value) return 'downloading';
    if (isBooting.value) return 'checking';
    return 'waiting-for-deploy';
  });

  watchEffect(() => {
    if (status.value === 'ready') shouldRenderApp.value = true;
  });

  const pendingNotice = computed<AppUpdateNotice | null>(() => {
    if (status.value !== 'ready') return null;
    if (isVersionMismatch.value && isInGame.value) return 'update-after-game';
    if (needRefresh.value) return 'update-available';
    return null;
  });
  // Dismissing hides that notice only: a different one still shows up.
  const dismissedNotice = ref<AppUpdateNotice | null>(null);
  const notice = computed(() =>
    pendingNotice.value === dismissedNotice.value ? null : pendingNotice.value
  );
  const dismissNotice = () => {
    dismissedNotice.value = pendingNotice.value;
  };

  // ---- Checking for updates during the session ----

  useIntervalFn(checkForUpdate, PERIODIC_CHECK_INTERVAL_MS);

  const visibility = useDocumentVisibility();
  let lastVisibilityCheck = Date.now();
  watch(visibility, value => {
    if (value !== 'visible') return;
    if (
      Date.now() - lastVisibilityCheck <
      MIN_DELAY_BETWEEN_VISIBILITY_CHECKS_MS
    ) {
      return;
    }
    lastVisibilityCheck = Date.now();
    void checkForUpdate();
  });

  // If the client is the outdated half, this picks up the new build as soon as
  // it's published. If the API is, the version query updates on its own once
  // the API is deployed.
  const deployPoll = useIntervalFn(checkForUpdate, DEPLOY_POLL_INTERVAL_MS, {
    immediate: false,
    immediateCallback: true
  });
  watch(
    () => status.value === 'waiting-for-deploy',
    isWaiting => {
      if (isWaiting) deployPoll.resume();
      else deployPoll.pause();
    }
  );

  return {
    status,
    downloadProgress,
    notice,
    shouldRenderApp,
    applyUpdate,
    dismissNotice
  };
};
