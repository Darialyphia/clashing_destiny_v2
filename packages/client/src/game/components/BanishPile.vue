<script setup lang="ts">
import Pile from './Pile.vue';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useBoardSide,
  useFxEvent,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { useKeybordShortcutLabel } from '../composables/useGameKeyboardControls';

const { player } = defineProps<{
  player: string;
}>();

const board = useBoardSide(computed(() => player));
const isOpened = ref(false);

const close = () => {
  isOpened.value = false;
};
useFxEvent(FX_EVENTS.CARD_DECLARE_PLAY, close);
useFxEvent(FX_EVENTS.CARD_DECLARE_USE_ABILITY, close);

const ui = useGameUi();

const myPlayer = useMyPlayer();
const settings = useSettingsStore();
const getKeyLabel = useKeybordShortcutLabel();
</script>

<template>
  <Pile
    :size="board.banishPile.length"
    v-slot="{ index }"
    class="banish-pile"
    :id="ui.DOMSelectors.banishPile(player).id"
    :data-keyboard-shortcut="
      player === myPlayer.id
        ? getKeyLabel(settings.settings.bindings.toggleBanishPile.control)
        : getKeyLabel(
            settings.settings.bindings.toggleOpponentBanishPile.control
          )
    "
    data-keyboard-shortcut-centered="true"
    style="--keyboard-shortcut-top: -8px; --keyboard-shortcut-right: 50%"
    @click="isOpened = true"
  >
    <GameCard
      :card-id="board.banishPile[index]"
      :is-interactive="false"
      variant="small"
    />
  </Pile>

  <UiModal
    v-model:is-opened="isOpened"
    :title="
      myPlayer.id === player ? 'Your Banish Pile' : 'Opponent Banish Pile'
    "
    description=""
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content" @click="close">
      <header>
        <h2 class="text-center">
          {{
            myPlayer.id === player ? 'Your Banish Pile' : 'Opponent Banish Pile'
          }}
        </h2>
      </header>
      <div class="card-list fancy-scrollbar">
        <div
          v-for="card in board.banishPile.toReversed()"
          :key="card"
          @click.stop
        >
          <GameCard :card-id="card" :actions-offset="10" />
        </div>
      </div>
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton text="Close" @click="isOpened = false" />
      </footer>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.banish-pile {
  height: var(--card-small-height);
  width: var(--card-small-width);
}

.content {
  height: 80dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  &.is-showing-board .card-list {
    visibility: hidden;
  }
}

.card-list {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: var(--size-3);
  justify-items: center;
  grid-auto-rows: min-content;
}

h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}
</style>
