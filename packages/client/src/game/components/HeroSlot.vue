<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useCard,
  useGameClient,
  useGameUi
} from '../composables/useGameClient';
import GameCard from './GameCard.vue';
import { useKeybordShortcutLabel } from '../composables/useGameKeyboardControls';
import { useSettingsStore } from '@/shared/composables/useSettings';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const boardSide = useBoardSide(computed(() => player.id));
const hero = useCard(computed(() => boardSide.value.heroZone.hero));
const { playerId } = useGameClient();
const ui = useGameUi();

const settings = useSettingsStore();
const getKeyLabel = useKeybordShortcutLabel();

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

      <div class="artifacts">
        <InspectableCard
          v-for="artifact in boardSide.heroZone.artifacts"
          :key="artifact"
          :card-id="artifact"
          :open-delay="0"
          side="right"
          @mouseenter="isFullCardPreviewenabled = false"
          @mouseleave="enableFullCardPreview"
        >
          <GameCard :card-id="artifact" variant="small" />
        </InspectableCard>
      </div>
    </InspectableCard>
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  position: relative;
}

.artifacts {
  --pixel-scale: 0.5;
  position: absolute;
  top: var(--size-1);
  right: var(--size-1);
  display: flex;
  flex-direction: column;
  gap: var(--size-1);
}
</style>
