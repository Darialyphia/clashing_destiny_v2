<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useBoardSide,
  useFxEvent,
  useGameState,
  useGameUi,
  useMyPlayer,
  usePlayer
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import Deck from './Deck.vue';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { useKeybordShortcutLabel } from '../composables/useGameKeyboardControls';

const { playerId } = defineProps<{
  playerId: string;
}>();

const isOpened = ref(false);

const player = usePlayer(computed(() => playerId));
const state = useGameState();
const ui = useGameUi();
const board = useBoardSide(computed(() => playerId));
const destinyCards = computed<CardViewModel[]>(() => {
  return board.value.destinyDeck
    .map(cardId => {
      return state.value.entities[cardId] as CardViewModel;
    })
    .sort((a, b) => {
      return a.destinyCost! - b.destinyCost! || a.name.localeCompare(b.name);
    });
});

const close = () => {
  isOpened.value = false;
};
useFxEvent(FX_EVENTS.CARD_DECLARE_PLAY, close);
useFxEvent(FX_EVENTS.CARD_DECLARE_USE_ABILITY, close);
useFxEvent(FX_EVENTS.PRE_PLAYER_PAY_FOR_DESTINY_COST, close);

const myPlayer = useMyPlayer();
const settings = useSettingsStore();
const getKeyLabel = useKeybordShortcutLabel();
</script>

<template>
  <Deck
    :size="player.remainingCardsInDestinyDeck"
    :id="ui.DOMSelectors.destinyDeck(playerId).id"
    :data-keyboard-shortcut="
      player.id === myPlayer.id
        ? getKeyLabel(settings.settings.bindings.toggleDestinyDeck.control)
        : undefined
    "
    data-keyboard-shortcut-centered="true"
    style="--keyboard-shortcut-top: -8px; --keyboard-shortcut-right: 50%"
    @click="isOpened = true"
  />

  <UiModal
    v-model:is-opened="isOpened"
    title="Destiny Deck"
    description=""
    :style="{
      '--ui-modal-size': 'var(--size-xl)'
    }"
  >
    <div class="content" @click="close">
      <header class="mb-4">
        <h2 class="text-center">Destiny Deck</h2>
        <!-- <p class="text-center italic">
          Starting turn
          {{ state.config.MINIMUM_TURN_COUNT_TO_PLAY_DESTINY_CARD + 1 }}, you
          can play 1 destiny card per turn.
        </p> -->
      </header>
      <div class="card-list fancy-scrollbar">
        <div
          v-for="card in destinyCards"
          :key="card.id"
          @click.stop
          :class="{ disabled: !card.canPlay }"
        >
          <GameCard
            :card-id="card.id"
            :actions-offset="10"
            show-disabled-message
            :portal-target="'#destiny-deck-actions-portal'"
          />
        </div>
      </div>
      <div id="destiny-deck-actions-portal" />
      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton text="Close" @click="isOpened = false" />
      </footer>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
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
  grid-template-columns: repeat(
    auto-fill,
    minmax(calc(var(--card-width) * var(--pixel-scale)), 1fr)
  );
  row-gap: var(--size-3);
  justify-items: center;
  grid-auto-rows: min-content;
}

h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}

.disabled {
  filter: brightness(0.75) grayscale(0.3);
}
</style>
