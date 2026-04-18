<script setup lang="ts">
import { useCard, useFxEvent, useGameUi } from '../composables/useGameClient';
import Card from '@/card/components/Card.vue';
import SmallCard from '@/card/components/SmallCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { waitFor } from '@game/shared';
import { refAutoReset } from '@vueuse/core';
import CardActionsPopover from './CardActionsPopover.vue';
import type { PopoverContentProps } from 'reka-ui';
import { CARD_LOCATIONS } from '@game/engine/src/card/card.enums';
import CardModifiers from './CardModifiers.vue';

const {
  cardId,
  actionsOffset = -50,
  actionsSide,
  actionsAlign = 'center',
  variant = 'default',
  isInteractive = true,
  showDisabledMessage = false,
  showStats = false,
  useActionsPortal = true,
  showModifiers = false,
  showActionEmptyState = true,
  actionsPortalTarget = '#card-actions-portal',
  modifiersPosition = 'top',
  canTilt = false,
  overrides = {}
} = defineProps<{
  cardId: string;
  actionsOffset?: number;
  actionsSide?: PopoverContentProps['side'];
  actionsAlign?: PopoverContentProps['align'];
  variant?: 'default' | 'small';
  isInteractive?: boolean;
  showDisabledMessage?: boolean;
  showModifiers?: boolean;
  showStats?: boolean;
  useActionsPortal?: boolean;
  actionsPortalTarget?: string;
  showActionEmptyState?: boolean;
  modifiersPosition?: 'top' | 'bottom';
  canTilt?: boolean;
  overrides?: Record<string, any>;
}>();

const emit = defineEmits<{
  modifiersMouseEnter: [];
  modifiersMouseLeave: [];
}>();
const card = useCard(computed(() => cardId));
const ui = useGameUi();

const handleClick = () => {
  if (!isInteractive) return;
  ui.value.onCardClick(card.value);
};

const isUsingAbility = refAutoReset(false, 1000);

const onAbilityUse = async (e: { card: string }) => {
  if (e.card !== cardId) return;
  isUsingAbility.value = true;
  await waitFor(1000);
};
useFxEvent(FX_EVENTS.ABILITY_BEFORE_USE, onAbilityUse);
// useFxEvent(FX_EVENTS.CARD_EFFECT_TRIGGERED, onAbilityUse);

const classes = computed(() => {
  return [
    card.value.keywords.map(kw => kw.id.toLowerCase()),
    {
      'can-tilt': canTilt,
      disabled:
        !card.value.canPlay && card.value.location === CARD_LOCATIONS.HAND,
      selected: ui.value.selectedCard?.equals(card.value),
      'is-using-ability': isUsingAbility.value
    }
  ];
});
</script>

<template>
  <div
    class="game-card-container"
    :data-game-card="card.id"
    :data-flip-id="`card_${card.id}`"
    :id="ui.DOMSelectors.cardInHand(card.id, card.player.id).id"
  >
    <CardActionsPopover
      :card-id="card.id"
      :is-interactive="isInteractive"
      :actions-offset="actionsOffset"
      :actions-align="actionsAlign"
      :actions-side="actionsSide"
      :use-portal="useActionsPortal"
      :portal-target="actionsPortalTarget"
      :show-action-empty-state="showActionEmptyState"
    >
      <Card
        v-if="variant === 'default'"
        :is-animated="true"
        :id="card.id"
        :card="{
          id: card.id,
          art: card.art ?? overrides.art,
          name: card.name ?? overrides.name,
          description: card.description ?? overrides.description,
          kind: card.kind ?? overrides.kind,
          rarity: card.rarity ?? overrides.rarity,
          manaCost: card.manaCost ?? overrides.manaCost,
          baseManaCost: card.baseManaCost ?? overrides.baseManaCost,
          hp: card.maxHp ?? overrides.hp,
          atk: card.atk ?? overrides.atk,
          retaliation: card.retaliation ?? overrides.retaliation,
          durability: card.durability ?? overrides.durability,
          abilities: card.abilities
            .filter(ability => !ability.isHiddenOnCard)
            .map(
              a =>
                `@[exhaust]@${a.manaCost ? ` @[mana] ${a.manaCost}@` : ''}:  ${a.description}`
            ),
          jobs: card.jobs ?? overrides.jobs
        }"
        :is-foil="card.isFoil"
        class="game-card big"
        :class="classes"
        :max-tilt-angle="0"
        @click="handleClick"
      />
      <SmallCard
        v-else-if="variant === 'small'"
        :id="card.id"
        :card="{
          id: card.id,
          art: card.art ?? overrides.art,
          kind: card.kind ?? overrides.kind,
          atk: card.atk ?? overrides.atk,
          baseAtk: card.baseAtk ?? overrides.baseAtk,
          hp: card.hp ?? overrides.hp,
          baseMaxHp: card.baseMaxHp ?? overrides.baseMaxHp,
          maxHp: card.maxHp ?? overrides.maxHp,
          durability: card.durability ?? overrides.durability,
          retaliation: card.retaliation ?? overrides.retaliation,
          baseRetaliation: card.baseRetaliation ?? overrides.baseRetaliation
        }"
        class="game-card small"
        :class="classes"
        :show-stats="showStats"
        :is-foil="card.isFoil"
        @click="handleClick"
      />

      <CardModifiers
        v-if="showModifiers"
        :position="modifiersPosition"
        :card="card"
        @modifiers-mouse-enter="emit('modifiersMouseEnter')"
        @modifiers-mouse-leave="emit('modifiersMouseLeave')"
      />

      <!-- <div class="damage" v-if="damageTaken > 0">
        {{ damageTaken }}
      </div> -->
      <p v-if="!card.canPlay && showDisabledMessage" class="disabled-message">
        {{ card.unplayableReason ?? 'You cannot play this card right now.' }}
      </p>
    </CardActionsPopover>
  </div>
</template>

<style scoped lang="postcss">
/* @keyframes card-glow {
  0%,
  80%,
  100% {
    box-shadow: 0 0 10px hsl(var(--glow-hsl) / 0.25);
  }
  40% {
    box-shadow: 0 0 30px hsl(var(--glow-hsl) / 0.75);
  }
} */

/* .highlighted::after {
  content: '';
  position: absolute;
  inset: 0;
  --glow-hsl: var(--cyan-4-hsl);
  animation: card-glow 2.5s infinite;
  } */

.selected {
  box-shadow: 0 0 0.5rem hsl(200 100% 50% / 0.75);
}
@keyframes card-damage-taken {
  0% {
    opacity: 0;
    transform: scale(5);
  }
  30%,
  75% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-5rem);
  }
}

.game-card-container {
  position: relative;
  transform: translateZ(1px);
}

.game-card {
  transition:
    filter 0.3s var(--ease-2),
    transform 0.3s var(--ease-2),
    rotate 0.3s var(--ease-2);
  position: relative;

  &.small {
    --pixel-scale: 1;
  }
  &.exhausted {
    filter: grayscale(0.25) brightness(0.8);
    &.can-tilt {
      rotate: 5deg;
    }
  }
  &.targetable {
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: hsl(200 100% 50% / 0.25);
    }
  }
}

@keyframes card-attack {
  to {
    transform: rotateY(1turn);
  }
}

.is-attacking {
  animation: card-attack 0.2s var(--ease-in-2) forwards;
}

@keyframes horizontal-shaking {
  0% {
    transform: translateX(0);
  }
  16%,
  48%,
  80% {
    transform: translateX(10px);
  }
  32%,
  64% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
  }
}
.is-taking-damage {
  animation: horizontal-shaking 0.5s linear forwards;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: hsl(0 100% 60% / 0.65);
    mix-blend-mode: overlay;
    pointer-events: none;
  }
}
.damage {
  z-index: 1;
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: grid;
  place-items: center;
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-9);
  color: var(--red-9);
  -webkit-text-stroke: 8px black;
  paint-order: stroke fill;
  animation: card-damage-taken 1s linear forwards;
}

@keyframes ability-glow {
  0%,
  100% {
    box-shadow: 0 0 0 yellow;
  }
  50% {
    box-shadow: 0 0 1.5rem yellow;
  }
}
.is-using-ability {
  filter: brightness(1.5) !important;
  animation: ability-glow 1s ease-in-out;
}

.disabled-message {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
  background: hsl(0 0% 0% / 0.65);
  color: hsl(0 0% 100% / 0.9);
  font-size: var(--font-size--2);
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-pill);
  width: max-content;
  max-width: 80%;
  text-align: center;
  pointer-events: none;
  font-style: italic;
}

@keyframes fleeting {
  0%,
  20%,
  80%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.65;
  }
}
.fleeting {
  animation: fleeting 5s var(--ease-3) infinite;
}
</style>
