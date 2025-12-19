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
    <InspectableCard :card-id="hero.id" :open-delay="150">
      <GameCard
        :card-id="hero.id"
        actions-side="right"
        actions-align="start"
        :actions-offset="0"
        variant="small"
        show-stats
        show-modifiers
      />
    </InspectableCard>

    <div class="runes">
      <div class="rune" style="--bg: url(/assets/ui/card/rune-might.png)">
        {{ player.unlockedRunes.MIGHT ?? 0 }}
      </div>
      <div class="rune" style="--bg: url(/assets/ui/card/rune-focus.png)">
        {{ player.unlockedRunes.FOCUS ?? 0 }}
      </div>
      <div class="rune" style="--bg: url(/assets/ui/card/rune-knowledge.png)">
        {{ player.unlockedRunes.KNOWLEDGE ?? 0 }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  position: relative;
}

.runes {
  position: absolute;
  top: var(--size-8);
  right: var(--size-7);
  display: grid;
  gap: var(--size-2);

  .rune {
    padding-left: calc(20px * var(--pixel-scale));
    height: calc(17px * var(--pixel-scale));
    background-image: var(--bg);
    background-size: contain;
    background-position: top left;
    width: calc(27px * var(--pixel-scale));
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-5);
    color: white;
    -webkit-text-stroke: 6px black;
    paint-order: stroke fill;
  }
}
</style>
