<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useCard,
  useGameClient,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { useKeybordShortcutLabel } from '../composables/useGameKeyboardControls';
import { useSettingsStore } from '@/shared/composables/useSettings';
import InspectableCard from '@/card/components/InspectableCard.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { type Rune, RUNES } from '@game/engine/src/card/card.enums';
import { assets } from '@/assets';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const hero = useCard(computed(() => boardSide.value.heroZone.hero));
const { client, playerId } = useGameClient();
const ui = useGameUi();

const settings = useSettingsStore();
const getKeyLabel = useKeybordShortcutLabel();
const myPlayer = useMyPlayer();

const canGainRune = computed(() => {
  return (
    player.id === playerId.value && myPlayer.value.canPerformResourceAction
  );
});

const gainRune = (rune: Rune) => {
  client.value.gainRune(rune);
};

const isFullCardPreviewenabled = ref(true);
const enableFullCardPreview = () => {
  setTimeout(() => {
    isFullCardPreviewenabled.value = true;
  }, 100);
};
</script>

<template>
  <div
    class="hero-slot"
    :class="{ opponent: playerId !== player.id }"
    :id="ui.DOMSelectors.hero(player.id).id"
    :data-keyboard-shortcut="
      player.id === playerId
        ? getKeyLabel(settings.settings.bindings.interactHero.control)
        : undefined
    "
    data-keyboard-shortcut-centered="true"
    style="--keyboard-shortcut-top: -8px; --keyboard-shortcut-right: 50%"
    ref="card"
  >
    <InspectableCard
      :card-id="hero.id"
      :open-delay="150"
      :enabled="isFullCardPreviewenabled"
      side="right"
    >
      <GameCard
        :card-id="hero.id"
        actions-side="right"
        actions-align="start"
        :actions-offset="0"
        variant="small"
        show-stats
        show-modifiers
        @modifiers-mouse-enter="isFullCardPreviewenabled = false"
        @modifiers-mouse-leave="enableFullCardPreview"
      />
    </InspectableCard>

    <div
      class="resources"
      @mouseenter="isFullCardPreviewenabled = false"
      @mouseleave="enableFullCardPreview"
    >
      <UiSimpleTooltip>
        <template #trigger>
          <div class="text-right text-3 text-bold">
            {{ player.remainingTotalResourceActions }} /
            {{ player.maxResourceActionPerTurn }}
          </div>
        </template>
        You have {{ player.remainingTotalResourceActions }} resource actions
        left this turn.
      </UiSimpleTooltip>
      <UiSimpleTooltip :disabled="!canGainRune">
        <template #trigger>
          <button
            class="rune"
            :style="{ '--bg': assets['ui/card/rune-might'].css }"
            :disabled="!canGainRune"
            @click="gainRune(RUNES.MIGHT)"
          >
            {{ player.unlockedRunes.MIGHT ?? 0 }}
          </button>
        </template>
        Gain a Might Rune.
      </UiSimpleTooltip>
      <UiSimpleTooltip :disabled="!canGainRune">
        <template #trigger>
          <button
            class="rune"
            :style="{ '--bg': assets['ui/card/rune-focus'].css }"
            :disabled="!canGainRune"
            @click="gainRune(RUNES.FOCUS)"
          >
            {{ player.unlockedRunes.FOCUS ?? 0 }}
          </button>
        </template>
        Gain a Focus Rune.
      </UiSimpleTooltip>
      <UiSimpleTooltip :disabled="!canGainRune">
        <template #trigger>
          <button
            class="rune"
            :style="{ '--bg': assets['ui/card/rune-knowledge'].css }"
            :disabled="!canGainRune"
            @click="gainRune(RUNES.KNOWLEDGE)"
          >
            {{ player.unlockedRunes.KNOWLEDGE ?? 0 }}
          </button>
        </template>
        Gain a Knowledge Rune.
      </UiSimpleTooltip>
      <UiSimpleTooltip :disabled="!canGainRune">
        <template #trigger>
          <button
            class="rune"
            :style="{ '--bg': assets['ui/card/rune-resonance'].css }"
            :disabled="!canGainRune"
            @click="gainRune(RUNES.RESONANCE)"
          >
            {{ player.unlockedRunes.RESONANCE ?? 0 }}
          </button>
        </template>
        Gain a Resonance Rune.
      </UiSimpleTooltip>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  position: relative;
}

.resources {
  position: absolute;
  top: var(--size-6);
  right: var(--size-7);
  display: grid;
  gap: var(--size-2);
  color: white;
  -webkit-text-stroke: 6px black;
  paint-order: stroke fill;

  .rune {
    padding-left: calc(20px * var(--pixel-scale));
    height: calc(17px * var(--pixel-scale));
    background-image: var(--bg);
    background-size: contain;
    background-position: top left;
    width: calc(27px * var(--pixel-scale));
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-5);
    &:not(:disabled):hover {
      filter: brightness(1.5);
    }
  }
}
</style>
