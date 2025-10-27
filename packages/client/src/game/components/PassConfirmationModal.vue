<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import { useGameClient, useGameUi } from '../composables/useGameClient';
import FancyButton from '@/ui/components/FancyButton.vue';

const ui = useGameUi();
const { client } = useGameClient();
</script>

<template>
  <UiModal
    v-model:is-opened="ui.isPassConfirmationModalOpened"
    title="Confirm Pass"
    description="Are you sure you want to pass your turn?"
  >
    <div class="surface text-center">
      <h3 class="text-5 my-4">Pass for turn ?</h3>
      <p class="text-3">
        There seems to be some more actions that you can take. Are you sure you
        want to pass your turn ?
      </p>
      <footer class="flex gap-5 justify-center my-4">
        <FancyButton
          text="No"
          variant="error"
          @click="ui.isPassConfirmationModalOpened = false"
        />
        <FancyButton
          text="Yes"
          variant="primary"
          @click="
            () => {
              client.pass();
              ui.isPassConfirmationModalOpened = false;
            }
          "
        />

        <FancyButton
          text="Yes, don't ask again"
          variant="primary"
          @click="
            () => {
              client.pass();
              ui.isPassConfirmationModalOpened = false;
              ui.shouldBypassConfirmation = true;
            }
          "
        />
      </footer>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
p {
  text-wrap: balance;
}
</style>
