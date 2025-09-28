<script setup lang="ts">
import {
  useFxEvent,
  useGameState,
  useGameUi,
  useMyBoard
} from '@/game/composables/useGameClient';
import GameCard from '@/game/components/GameCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import { clamp, isDefined } from '@game/shared';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  INTERACTION_STATES,
  type InteractionState
} from '@game/engine/src/game/systems/game-interaction.system';
import { OnClickOutside } from '@vueuse/components';
import { useResizeObserver } from '@vueuse/core';
import type { ShallowRef } from 'vue';

const state = useGameState();
const myBoard = useMyBoard();
const ui = useGameUi();

useFxEvent(FX_EVENTS.CARD_ADD_TO_HAND, async e => {
  const newCard = e.card as SerializedCard;
  if (newCard.player !== myBoard.value.playerId) return;

  // @FIXME this can happen on P1T1, this will probaly go away once mulligan is implemented
  if (myBoard.value.hand.includes(newCard.id)) return;

  if (isDefined(e.index)) {
    myBoard.value.hand.splice(e.index, 0, newCard.id);
  } else {
    myBoard.value.hand.push(newCard.id);
  }
  await nextTick();

  const el = ui.value.DOMSelectors.cardInHand(
    newCard.id,
    myBoard.value.playerId
  ).element;

  if (el) {
    await el.animate(
      [
        { transform: 'translateY(-50%)', opacity: 0 },
        { transform: 'none', opacity: 1 }
      ],
      {
        duration: 300,
        easing: 'ease-out'
      }
    ).finished;
  }
});

const isInteractionActive = computed(() => {
  return (
    state.value.interaction.state === INTERACTION_STATES.PLAYING_CARD ||
    state.value.interaction.state === INTERACTION_STATES.USING_ABILITY
  );
});

const handContainer = useTemplateRef('hand') as Readonly<
  ShallowRef<HTMLElement | null>
>; // somehow we have to cast it because it makes vue-tsc fail, yet it works in IDE...

const handContainerSize = ref({ w: 0, h: 0 });
const handOffsetY = ref(0);
useResizeObserver(handContainer, () => {
  const el = handContainer.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  handContainerSize.value = { w: rect.width, h: rect.height };
  handOffsetY.value =
    handContainer.value.scrollHeight - handContainer.value.clientHeight;
});

const pixelScale = computed(() => {
  let el = handContainer.value;
  if (!el) return 1;
  let scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  while (!scale) {
    if (!el.parentElement) return 1;
    el = el.parentElement;
    scale = getComputedStyle(el).getPropertyValue('--pixel-scale');
  }

  return parseInt(scale) || 1;
});

const cardW = computed(() => {
  return (
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--card-width-unitless'
      )
    ) * pixelScale.value
  );
});

const handSize = computed(() => myBoard.value.hand.length);

const MAX_FAN_ANGLE = 15;
const MAX_FAN_SAG = 150;

const tOf = (i: number, n: number) => {
  // map i=0..n-1 to t in [-1, 1]
  const half = (n - 1) / 2;
  return n <= 1 ? 0 : (i - half) / Math.max(half, 1);
};
const overlapRatio = computed(() => {
  if (handSize.value <= 1) return 0;
  const r = (cardW.value - step.value) / cardW.value; // 0..1
  return clamp(r, 0.3, 1);
});

const fanSag = computed(() => overlapRatio.value * MAX_FAN_SAG);

const rotDeg = (i: number) => tOf(i, handSize.value) * (MAX_FAN_ANGLE / 2);

const yOffset = (i: number) => {
  const t = tOf(i, handSize.value);
  return fanSag.value * t * t;
};

const step = computed(() => {
  if (handSize.value <= 1) return 0;
  const natural =
    (handContainerSize.value.w - cardW.value) / (handSize.value - 1);
  return clamp(natural, 0, cardW.value);
});

const cards = computed(() => {
  if (handSize.value === 0) return [];
  const usedSpan = cardW.value + (handSize.value - 1) * step.value;
  const offset = (handContainerSize.value.w - usedSpan) / 2;

  return myBoard.value.hand.map((cardId, i) => ({
    card: state.value.entities[cardId] as CardViewModel,
    x: offset + i * step.value,
    y: yOffset(i),
    rot: rotDeg(i),
    z: i
  }));
});

watch(
  () => state.value.interaction,
  interaction => {
    const relevantStates: InteractionState[] = [
      INTERACTION_STATES.USING_ABILITY,
      INTERACTION_STATES.PLAYING_CARD
    ];
    if (!relevantStates.includes(interaction.state)) return;

    if (interaction.ctx.player !== myBoard.value.playerId) return;

    ui.value.isHandExpanded = true;
  }
);
</script>

<template>
  <OnClickOutside @trigger="ui.isHandExpanded = false">
    <section
      :id="`hand-${myBoard.playerId}`"
      class="hand"
      :class="{
        'ui-hidden': !ui.displayedElements.hand,
        'interaction-active': isInteractionActive,
        expanded: ui.isHandExpanded
      }"
      :style="{
        '--hand-size': myBoard.hand.length,
        '--hand-offset-y': handOffsetY
      }"
      ref="hand"
    >
      <div
        class="hand-card"
        v-for="(card, index) in cards"
        :key="card.card.id"
        :class="{
          selected: ui.selectedCard?.equals(card.card),
          disabled: !card.card.canPlay
        }"
        :data-keyboard-shortcut="ui.isHandExpanded ? index + 1 : undefined"
        data-keyboard-shortcut-centered="true"
        :style="{
          '--x': `${card.x}px`,
          '--y': `${card.y}px`,
          '--z': card.z,
          '--angle': `${card.rot}deg`,
          '--keyboard-shortcut-right': '50%'
        }"
        @click="ui.isHandExpanded = true"
      >
        <GameCard
          :card-id="card.card.id"
          actions-side="top"
          :actions-offset="15"
          :is-interactive="ui.isHandExpanded"
          show-disabled-message
        />
      </div>
    </section>
  </OnClickOutside>
</template>

<style scoped lang="postcss">
.hand {
  --pixel-scale: 2;
  position: relative;
  z-index: 1;
  height: 100%;
  width: 30%;
  /* background-color: blue; */
  &.expanded {
    left: 50%;
    width: 80%;
    transform: translateX(-50%);
  }
}

.hand-card {
  position: absolute;
  left: 0;
  --hover-offset: 0px;
  --offset-y: var(--hover-offset);
  --rot-scale: 0;
  --_y: var(--offset-y);
  transform-origin: 50% 100%;
  transform: translateX(var(--x)) translateY(var(--_y))
    rotate(calc(var(--angle) * var(--rot-scale)));
  z-index: var(--z);
  transition: transform 0.2s var(--ease-2);
  pointer-events: auto;

  .hand.expanded & {
    --rot-scale: 1;
    --_y: calc(var(--y) + var(--offset-y));
    --offset-y: calc(var(--hover-offset) - 1px * var(--hand-offset-y));
  }

  &:hover {
    --hover-offset: -150px;
    z-index: var(--hand-size);
  }
  .hand.expanded &:hover,
  &.selected {
    --hover-offset: -30px;
    --rot-scale: 0;
    --_y: var(--offset-y);
  }
  &.disabled {
    filter: brightness(0.75) grayscale(0.3);
  }
}
</style>
