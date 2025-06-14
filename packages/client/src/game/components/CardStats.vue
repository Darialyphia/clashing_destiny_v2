<script setup lang="ts">
import { isDefined } from '@game/shared';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { useCard, useGameClient } from '../composables/useGameClient';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { cardId } = defineProps<{ cardId: string }>();

const card = useCard(computed(() => cardId));
const isDisplayed = computed(() => {
  if (card.value.location !== 'board') return false;
  return (
    card.value.kind === CARD_KINDS.HERO ||
    card.value.kind === CARD_KINDS.MINION ||
    card.value.kind === CARD_KINDS.ARTIFACT
  );
});

const client = useGameClient();

const visibleModifiers = computed(() =>
  card.value.getModifiers().filter(modifier => modifier.icon)
);
</script>

<template>
  <div
    v-if="isDisplayed"
    class="stats"
    :class="{ flipped: card.getPlayer().id !== client.playerId }"
  >
    <div class="modifiers">
      <UiSimpleTooltip
        v-for="modifier in visibleModifiers"
        :key="modifier.id"
        use-portal
        side="left"
      >
        <template #trigger>
          <div
            :style="{ '--bg': `url(/assets/icons/${modifier.icon}.png)` }"
            :alt="modifier.name"
            class="modifier"
          />
        </template>

        <div class="font-7">{{ modifier.name }}</div>
        {{ modifier.description }}
      </UiSimpleTooltip>
    </div>
    <div
      class="atk"
      v-if="isDefined(card.atk)"
      :class="{
        buffed: card.baseAtk! < card.atk,
        debuffed: card.baseAtk! > card.atk
      }"
    >
      {{ card.atk }}
    </div>
    <div
      class="spellpower"
      v-if="isDefined(card.spellpower)"
      :class="{
        buffed: card.baseSpellpower! < card.spellpower,
        debuffed: card.baseSpellpower! > card.spellpower
      }"
    >
      {{ card.spellpower }}
    </div>
    <div
      class="hp"
      v-if="isDefined(card.hp)"
      :class="{
        buffed: card.baseMaxHp! < card.hp,
        debuffed: card.baseMaxHp! > card.hp
      }"
    >
      {{ card.hp }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
.stats {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, hsl(0 0 0 / 0.5));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  padding: var(--size-3);
  font-size: var(--font-size-10);
  font-weight: var(--font-weight-9);
  line-height: 1;
  pointer-events: none;
  -webkit-text-stroke: 4px black;
  paint-order: fill stroke;
  --buff-color: var(--green-6);
  --debuff-color: var(--red-6);

  .buffed {
    color: var(--buff-color);
  }
  .debuffed {
    color: var(--debuff-color);
  }

  &.flipped {
    rotate: 180deg;
    justify-content: flex-start;
  }
  .game-card:has(.card.floating) & {
    transform: translateZ(var(--floating-amount));
  }

  .atk {
    background-image: url('/assets/ui/attack.png');
    background-position: left center;
    background-size: 60px;
    padding-left: var(--size-10);
  }

  .spellpower {
    background-image: url('/assets/ui/ability-power.png');
    background-position: left center;
    background-size: 60px;
    padding-left: var(--size-10);
  }

  .hp {
    background-image: url('/assets/ui/hp.png');
    background-position: left center;
    background-size: 60px;
    padding-left: var(--size-10);
  }
}

.modifiers {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  padding: var(--size-5);
  --pixel-scale: 3;
  .stats.flipped & {
    bottom: unset;
    top: 0;
  }
}

.modifier {
  width: calc(var(--pixel-scale) * 20px);
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  pointer-events: auto;
}
</style>
