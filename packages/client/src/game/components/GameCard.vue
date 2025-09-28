<script setup lang="ts">
import {
  useCard,
  useFxEvent,
  useGameUi,
  useMyPlayer
} from '../composables/useGameClient';
import Card from '@/card/components/Card.vue';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent,
  type PopoverContentProps
} from 'reka-ui';
import CardActions from './CardActions.vue';
import SmallCard from '@/card/components/SmallCard.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { waitFor } from '@game/shared';
import { refAutoReset } from '@vueuse/core';

const {
  cardId,
  actionsOffset = -50,
  actionsSide,
  variant = 'default',
  isInteractive = true,
  showDisabledMessage = false,
  showStats = false
} = defineProps<{
  cardId: string;
  actionsOffset?: number;
  actionsSide?: PopoverContentProps['side'];
  variant?: 'default' | 'small';
  isInteractive?: boolean;
  showDisabledMessage?: boolean;
  showStats?: boolean;
}>();

const card = useCard(computed(() => cardId));
const ui = useGameUi();

const isActionsPopoverOpened = computed({
  get() {
    if (!ui.value.selectedCard) return false;
    return ui.value.selectedCard.equals(card.value);
  },
  set(value) {
    if (value) {
      ui.value.select(card.value);
    } else {
      ui.value.unselect();
    }
  }
});

const isTargetable = computed(() => {
  return (
    card.value.canBeTargeted ||
    ui.value.selectedManaCostIndices.includes(card.value.indexInHand!)
  );
});

const myPlayer = useMyPlayer();

const handleClick = () => {
  if (!isInteractive) return;
  ui.value.onCardClick(card.value);
};

const isAttacking = refAutoReset(false, 500);
const isTakingDamage = refAutoReset(false, 500);
const isUsingAbility = refAutoReset(false, 1000);
const onAttack = async (e: { card: string }) => {
  if (e.card !== cardId) return;
  isAttacking.value = true;
};

const onTakeDamage = async (e: { card: string }) => {
  if (e.card !== cardId) return;
  isTakingDamage.value = true;
  await waitFor(500);
};

const waitForAttackDone = async () => {
  await waitFor(200);
};

const onAbilityUse = async (e: { card: string }) => {
  if (!isInteractive) return;
  if (e.card !== cardId) return;
  isUsingAbility.value = true;
  await waitFor(1000);
};
useFxEvent(FX_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE, onAttack);
useFxEvent(FX_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE, waitForAttackDone);
useFxEvent(FX_EVENTS.HERO_BEFORE_DEAL_COMBAT_DAMAGE, onAttack);
useFxEvent(FX_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE, waitForAttackDone);
useFxEvent(FX_EVENTS.MINION_BEFORE_TAKE_DAMAGE, onTakeDamage);
useFxEvent(FX_EVENTS.HERO_BEFORE_TAKE_DAMAGE, onTakeDamage);
useFxEvent(FX_EVENTS.ABILITY_BEFORE_USE, onAbilityUse);
useFxEvent(FX_EVENTS.CARD_EFFECT_TRIGGERED, onAbilityUse);

const classes = computed(() => {
  return {
    exhausted: isInteractive && card.value.isExhausted,
    disabled: !card.value.canPlay && card.value.location === 'hand',
    selected: ui.value.selectedCard?.equals(card.value),
    targetable: isTargetable.value,
    flipped: !myPlayer.value.equals(card.value.player),
    'is-attacking': isAttacking.value,
    'is-taking-damage': isTakingDamage.value,
    'is-using-ability': isUsingAbility.value
  };
});
</script>

<template>
  <PopoverRoot v-model:open="isActionsPopoverOpened" v-if="cardId">
    <PopoverAnchor>
      <div class="relative">
        <Card
          v-if="variant === 'default'"
          :is-animated="false"
          :id="card.id"
          :card="{
            id: card.id,
            name: card.name,
            unlockedSpellSchools: card.unlockedSpellSchools,
            spellSchool: card.spellSchool,
            description: card.description,
            image: card.imagePath,
            kind: card.kind,
            level: card.level,
            rarity: card.rarity,
            speed: card.speed,
            manaCost: card.manaCost,
            baseManaCost: card.baseManaCost,
            destinyCost: card.destinyCost,
            baseDestinyCost: card.baseDestinyCost,
            atk: card.atk,
            hp: card.hp,
            spellpower: card.spellpower,
            durability: card.durability,
            abilities: card.abilities
              .filter(ability => !ability.isHiddenOnCard)
              .map(ability => `@[${ability.speed}]@ ${ability.description}`),
            jobs: card.jobs
          }"
          class="game-card big"
          :class="classes"
          @click="handleClick"
        />
        <SmallCard
          v-else-if="variant === 'small'"
          :id="card.id"
          :card="{
            id: card.id,
            image: card.imagePath,
            kind: card.kind,
            atk: card.atk,
            hp: card.hp,
            durability: card.durability
          }"
          class="game-card small"
          :class="classes"
          :show-stats="showStats"
          @click="handleClick"
        />
        <p v-if="!card.canPlay && showDisabledMessage" class="disabled-message">
          You cannot play this card right now.
        </p>
      </div>
    </PopoverAnchor>

    <PopoverPortal
      :disabled="
        card.location === 'hand' ||
        card.location === 'discardPile' ||
        card.location === 'banishPile' ||
        card.location === 'destinyDeck'
      "
    >
      <PopoverContent :side-offset="actionsOffset" :side="actionsSide">
        <CardActions :card="card" v-model:is-opened="isActionsPopoverOpened" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
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
  filter: brightnes(1.2);
}

.game-card {
  transition: all 0.3s var(--ease-2);
  position: relative;

  &.exhausted {
    filter: grayscale(0.4) brightness(0.8);
    transform: none;
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

.flipped:deep(.image) {
  scale: -1 1;
}

.big.flipped:deep(.image) {
  translate: -100% 0;
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
</style>
