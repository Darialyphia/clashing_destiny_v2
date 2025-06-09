<script setup lang="ts">
import { isDefined } from '@game/shared';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { useGameClient } from '../composables/useGameClient';

const { card } = defineProps<{ card: CardViewModel }>();

const isDisplayed = computed(() => {
  if (card.location !== 'board') return false;
  return (
    card.kind === CARD_KINDS.HERO ||
    card.kind === CARD_KINDS.MINION ||
    card.kind === CARD_KINDS.ARTIFACT
  );
});

const client = useGameClient();
</script>

<template>
  <div
    v-if="isDisplayed"
    class="stats"
    :class="{ flipped: card.getPlayer().id !== client.playerId }"
  >
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
</style>
