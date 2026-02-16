<script setup lang="ts">
import {
  useFxEvent,
  useGameClient,
  useGameUi,
  useMyPlayer,
  usePlayer
} from '@/game/composables/useGameClient';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { clamp } from '@game/shared';
import { OnClickOutside } from '@vueuse/components';
import { useElementBounding, useResizeObserver } from '@vueuse/core';
import type { ShallowRef } from 'vue';
import HandCard from './HandCard.vue';

const { playerId } = defineProps<{ playerId: string }>();

const player = usePlayer(playerId);
const ui = useGameUi();
const { client } = useGameClient();

const myPlayer = useMyPlayer();

const isExpanded = computed({
  get() {
    return playerId === myPlayer.value?.id
      ? ui.value.isHandExpanded
      : ui.value.isOpponentHandExpanded;
  },
  set(v) {
    if (playerId === myPlayer.value?.id) {
      ui.value.isHandExpanded = v;
    } else {
      ui.value.isOpponentHandExpanded = v;
    }
  }
});

const isMyHand = computed(() => {
  return playerId === myPlayer.value?.id;
});

onMounted(() => {
  if (!isMyHand.value) return;
  if (playerId === client.value.getActivePlayerId()) {
    isExpanded.value = true;
  }
});

useFxEvent(FX_EVENTS.CARD_ADD_TO_HAND, async () => {
  // const newCard = e.card as SerializedCard;
  // if (newCard.player !== board.value.playerId) return;
  // // @FIXME this can happen on P1T1, this will probaly go away once mulligan is implemented
  // if (board.value.hand.includes(newCard.id)) return;
  // if (isDefined(e.index)) {
  //   board.value.hand.splice(e.index, 0, newCard.id);
  // } else {
  //   board.value.hand.push(newCard.id);
  // }
  // await nextTick();
  // const el = ui.value.DOMSelectors.cardInHand(
  //   newCard.id,
  //   board.value.playerId
  // ).element;
  // if (el) {
  //   await el.animate(
  //     [
  //       { transform: 'translateY(-50%)', opacity: 0 },
  //       { transform: 'none', opacity: 1 }
  //     ],
  //     {
  //       duration: 300,
  //       easing: 'ease-out'
  //     }
  //   ).finished;
  // }
});

const handContainer = useTemplateRef('hand') as Readonly<
  ShallowRef<HTMLElement | null>
>; // somehow we have to cast it because it makes vue-tsc fail, yet it works in IDE...

const handContainerSize = ref({ w: 0, h: 0 });
const handOffsetY = ref(0);
useResizeObserver(handContainer, async () => {
  await nextTick();
  const el = handContainer.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  handContainerSize.value = { w: rect.width, h: rect.height };

  handOffsetY.value = handContainer.value.clientHeight;
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

  return parseFloat(scale) || 1;
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

const handSize = computed(() => player.value.handSize);

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

  return player.value.hand.map((card, i) => {
    return {
      card,
      x: i * step.value + offset,
      y: 0,
      z: i
    };
  });
});

const { width } = useElementBounding(() => ui.value.DOMSelectors.board.element);
const handWidth = ref(width.value * 0.75);
watch(width, v => {
  if (client.value.isPlayingFx) return;
  handWidth.value = v * 0.75;
});
</script>

<template>
  <OnClickOutside
    class="hand-wrapper"
    :options="{ ignore: [`${ui.DOMSelectors.globalActionButtons.selector} *`] }"
    @trigger="isExpanded = false"
  >
    <section
      :id="`hand-${player.id}`"
      class="hand"
      :class="{
        'ui-hidden': !ui.displayedElements.hand,
        'opponent-hand': !isMyHand
      }"
      :style="{
        '--hand-size': player.hand.length,
        '--hand-offset-y': handOffsetY
      }"
      ref="hand"
    >
      <HandCard
        v-for="card in cards"
        :key="card.card.cardId"
        :card-id="card.card.cardId"
        :is-interactive="isMyHand"
        class="hand-card"
        :style="{
          '--x': `${card.x}px`,
          '--y': `${card.y}px`,
          '--z': card.z,
          '--keyboard-shortcut-right': '50%'
        }"
      />
    </section>
  </OnClickOutside>
</template>

<style scoped lang="postcss">
.hand-wrapper {
  position: absolute;
  width: calc(1px * v-bind(handWidth));
  left: 50%;
  transform: translateX(-50%);
  height: 50px;
}
.hand {
  --pixel-scale: 1.5;
  --hover-offset: -20px; /* used in HandCard.vue */
  position: relative;
  z-index: 1;
  width: 100%;
  transition: transform 0.15s var(--ease-elastic-2);
  &.opponent-hand:not(.expanded) {
    position: absolute;
    right: 0;
  }
  &:hover {
    --pixel-scale: 1.5;
    transform: translateY(-290px);
  }
}

.hand-card {
  padding-block: var(--size-3) var(--size-6);
}
</style>
