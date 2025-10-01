<script setup lang="ts">
import { isDefined } from '@game/shared';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedGame } from '@game/engine/src/game/game';
import type { Nullable } from '@game/shared';
import { useFxEvent } from '../composables/useGameClient';
import UiModal from '@/ui/components/UiModal.vue';
import UiButton from '@/ui/components/UiButton.vue';

const error = ref(
  null as Nullable<{
    error: string;
    isFatal: boolean;
    debugDump: SerializedGame;
  }>
);
useFxEvent(FX_EVENTS.ERROR, async e => {
  error.value = e;
});

const router = useRouter();
</script>

<template>
  <UiModal
    :is-opened="isDefined(error)"
    :closable="false"
    title="We hit a snag !"
    description=""
  >
    <div v-if="error?.isFatal">
      <p>The game encountered the following error :</p>
      <code class="block my-4 max-h-13 overflow-auto">
        {{ error?.error }}
        {{ error.debugDump }}
      </code>
      <p>This error is fatal, the game cannot continue.</p>
      <UiButton
        class="error-button"
        @click="
          () => {
            console.log(error?.debugDump);
            router.push({ name: 'Home' });
          }
        "
      >
        Send Crash Report
      </UiButton>
    </div>
    <div v-else>
      <p>
        The game received an illegal action. If the issue persist, try
        restarting the game.
      </p>
      <code class="block my-4">
        {{ error?.error }}
      </code>

      <UiButton
        class="error-button"
        @click="
          () => {
            error = null;
          }
        "
      >
        Dismiss
      </UiButton>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
code {
  white-space: pre;
  width: var(--size-md);
}
</style>
