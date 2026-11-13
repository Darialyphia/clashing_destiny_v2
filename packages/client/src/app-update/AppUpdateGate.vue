<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiSpinner from '@/ui/components/UiSpinner.vue';
import { useAppUpdate, type AppUpdateStatus } from './useAppUpdate';

const {
  status,
  downloadProgress,
  notice,
  shouldRenderApp,
  applyUpdate,
  dismissNotice
} = useAppUpdate();

const downloadPercent = computed(() =>
  status.value === 'downloading' && downloadProgress.value !== null
    ? Math.round(downloadProgress.value * 100)
    : null
);

const SCREEN_TEXTS: Record<
  Exclude<AppUpdateStatus, 'ready'>,
  { title: string; description?: string }
> = {
  checking: {
    title: 'Checking for updates'
  },
  downloading: {
    title: 'Downloading update',
    description: 'The game will restart on its own once it is ready.'
  },
  restarting: {
    title: 'Installing update'
  },
  'waiting-for-deploy': {
    title: 'Update in progress',
    description:
      'A new version of the game is being rolled out. This screen will close on its own once it is ready.'
  }
};
const screenTexts = computed(() =>
  status.value === 'ready' ? null : SCREEN_TEXTS[status.value]
);

// Every step resolves on its own, but a network that hangs can leave one
// stuck: after a while without progress, offer a way out.
const STUCK_DELAY_MS = 20_000;
const isStuck = ref(false);
const stuckTimer = useTimeoutFn(
  () => {
    isStuck.value = true;
  },
  STUCK_DELAY_MS,
  { immediate: false }
);
watch(
  [status, downloadPercent],
  ([newStatus]) => {
    isStuck.value = false;
    stuckTimer.stop();
    if (newStatus !== 'ready') stuckTimer.start();
  },
  { immediate: true }
);
const canReload = computed(
  () => status.value === 'waiting-for-deploy' || isStuck.value
);

const reload = () => {
  window.location.reload();
};
</script>

<template>
  <slot v-if="shouldRenderApp" />

  <Transition name="app-update-screen">
    <div
      v-if="screenTexts"
      class="app-update-screen"
      :class="status"
      role="alert"
      aria-live="polite"
    >
      <div class="content">
        <UiSpinner size="8" />
        <p class="title">{{ screenTexts.title }}</p>
        <div
          v-if="downloadPercent !== null"
          class="progress"
          role="progressbar"
          aria-label="Update download"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="downloadPercent"
        >
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${downloadPercent}%` }"
            />
          </div>
          <span class="progress-label">{{ downloadPercent }}%</span>
        </div>
        <p v-if="screenTexts.description" class="description">
          {{ screenTexts.description }}
        </p>
        <FancyButton v-if="canReload" text="Reload" @click="reload" />
      </div>
    </div>
  </Transition>

  <Transition name="app-update-notice">
    <div v-if="notice" class="app-update-notice" role="status">
      <template v-if="notice === 'update-available'">
        <p>A new version of the game is available.</p>
        <div class="actions">
          <FancyButton size="sm" text="Restart" @click="applyUpdate" />
          <FancyButton
            size="sm"
            variant="info"
            text="Later"
            @click="dismissNotice"
          />
        </div>
      </template>
      <template v-else>
        <p>
          A required update is available. It will be installed when you leave
          this game.
        </p>
        <div class="actions">
          <FancyButton
            size="sm"
            variant="info"
            text="OK"
            @click="dismissNotice"
          />
        </div>
      </template>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.app-update-screen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-content: center;
  padding: var(--size-4);
  background-color: var(--surface-1);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-3);
  text-align: center;
  color: var(--primary);
}

/* The startup check is usually over in a blink: only show it if it drags on. */
.checking .content {
  animation: fade-in 0.3s 0.8s both;
}

.title {
  font-family: 'Cinzel Decorative', serif;
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
}

.description {
  max-width: var(--size-content-2);
  color: var(--text-2);
}

.progress {
  display: flex;
  align-items: center;
  gap: var(--size-3);
  width: min(100%, 22rem);
}

.progress-bar {
  flex-grow: 1;
  height: var(--size-2);
  overflow: hidden;
  border: solid 1px var(--border);
  border-radius: var(--radius-pill);
  background-color: var(--surface-3);
}

.progress-fill {
  height: 100%;
  background-color: var(--primary);
  transition: width 0.2s var(--ease-2);
}

.progress-label {
  min-width: 4ch;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.app-update-notice {
  position: fixed;
  right: var(--size-4);
  bottom: var(--size-4);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
  max-width: var(--size-content-1);
  padding: var(--size-3) var(--size-4);
  border: solid 1px var(--border);
  border-radius: var(--radius-2);
  background-color: var(--surface-2);
  box-shadow: var(--shadow-2);

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--size-2);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

.app-update-screen-leave-active,
.app-update-notice-enter-active,
.app-update-notice-leave-active {
  transition: opacity 0.3s var(--ease-2);
}

.app-update-screen-leave-to,
.app-update-notice-enter-from,
.app-update-notice-leave-to {
  opacity: 0;
}
</style>
