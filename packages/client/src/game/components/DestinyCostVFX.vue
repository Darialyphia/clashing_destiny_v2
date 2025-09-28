<script setup lang="ts">
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { useFxEvent, useGameUi } from '../composables/useGameClient';
import { waitFor } from '@game/shared';
import GameCard from './GameCard.vue';
import { useDissolveVFX } from '../composables/useDissolve';
import { Flip } from 'gsap/Flip';

const isDisplayed = ref(false);
const cards = ref<{ card: string; flipState: any }[]>([]);
const root = useTemplateRef('root');
const disolve = useDissolveVFX();
const ui = useGameUi();

useFxEvent(FX_EVENTS.PRE_PLAYER_PAY_FOR_DESTINY_COST, async e => {
  cards.value = e.cards.map(card => ({
    card: card.card,
    flipState: Flip.getState(
      ui.value.getCardDOMSelectorInDestinyZone(card.card, e.player.id)
    )
  }));
  await nextTick();
});
useFxEvent(FX_EVENTS.PLAYER_PAY_FOR_DESTINY_COST, async () => {
  isDisplayed.value = true;
  if (!cards.value.length) return;

  cards.value.forEach(card => {
    const el = root.value!.querySelector(
      ui.value.getCardDOMSelector(card.card)
    );

    Flip.from(card.flipState, {
      duration: 0.5,
      ease: Power3.easeOut,
      absolute: true,
      scale: true,
      targets: el
    });
  });

  await waitFor(500);

  const cardEls = root.value!.querySelectorAll('.card');
  cardEls.forEach(el => {
    disolve.play(el as HTMLElement, 1500);
  });
  await waitFor(1500);
  cards.value = [];
  isDisplayed.value = false;
});
</script>

<template>
  <div class="destiny-cost-vfx" v-if="cards.length" ref="root">
    <GameCard
      v-for="card in cards"
      :key="card.card"
      :card-id="card.card"
      :interactive="false"
      :auto-scale="false"
    />
  </div>
</template>

<style scoped lang="postcss">
.destiny-cost-vfx {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--size-3);
  opacity: 0;
  transition: opacity 2s ease-in-out;

  @starting-style {
    opacity: 1;
  }
}
</style>
