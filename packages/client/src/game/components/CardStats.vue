<script setup lang="ts">
import { isDefined } from '@game/shared';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { useCard } from '../composables/useGameClient';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { gameStateRef } from '../composables/gameStateRef';

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

const visibleModifiers = gameStateRef(() => {
  return card.value.modifiers.filter(
    modifier => modifier.icon && modifier.stacks > 0
  );
});
</script>

<template>
  <div v-if="isDisplayed" class="stats" :class="card.kind.toLocaleLowerCase()">
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
            :data-stacks="modifier.stacks > 1 ? modifier.stacks : undefined"
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
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  padding: var(--size-2);
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-9);
  line-height: 1;
  pointer-events: none;
  -webkit-text-stroke: 2px black;
  paint-order: fill stroke;
  --buff-color: var(--green-6);
  --debuff-color: var(--red-6);

  &.minion {
    flex-direction: row;
    justify-content: space-between;
  }
  .buffed {
    color: var(--buff-color);
  }
  .debuffed {
    color: var(--debuff-color);
  }

  .atk {
    background-image: url('/assets/ui/attack.png');
    background-position: left center;
    background-size: 20px;
    padding-left: var(--size-6);
    .minion & {
      padding-left: var(--size-4);
    }
  }

  .spellpower {
    background-image: url('/assets/ui/ability-power.png');
    background-position: left center;
    background-size: 20px;
    padding-left: var(--size-6);
    .minion & {
      padding-left: var(--size-4);
    }
  }

  .hp {
    background-image: url('/assets/ui/hp.png');
    background-position: left center;
    background-size: 20px;
    padding-left: var(--size-6);
    .minion & {
      padding-left: var(--size-4);
    }
  }
}

.modifiers {
  position: absolute;
  top: var(--size-2);
  left: var(--size-2);
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  --pixel-scale: 3;
}

.modifier {
  width: 20px;
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  pointer-events: auto;
  position: relative;
  &::after {
    content: attr(data-stacks);
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: var(--font-size-2);
    color: white;
    paint-order: stroke fill;
    font-weight: var(--font-weight-7);
  }
}
</style>
