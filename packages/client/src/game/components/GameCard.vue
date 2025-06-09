<script setup lang="ts">
import { unrefElement, useResizeObserver } from '@vueuse/core';
import {
  useCard,
  useFxEvent,
  useGameClient,
  useGameState
} from '../composables/useGameClient';
import Card from '@/card/components/Card.vue';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import CardResizer from './CardResizer.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/game-interaction.system';
import { COMBAT_STEPS } from '@game/engine/src/game/phases/combat.phase';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import CardStats from './CardStats.vue';
import CardActions from './CardActions.vue';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { Damage, type DamageType } from '@game/engine/src/utils/damage';
const {
  cardId,
  interactive = true,
  autoScale = true
} = defineProps<{
  cardId: string;
  interactive?: boolean;
  autoScale?: boolean;
}>();

const card = useCard(computed(() => cardId));

const client = useGameClient();
const state = useGameState();
const isActionsPopoverOpened = computed({
  get() {
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(card.value);
  },
  set(value) {
    if (value) {
      client.value.ui.select(card.value);
    } else {
      client.value.ui.unselect();
    }
  }
});

const isTargetable = computed(() => {
  if (!interactive) return false;

  const canSelect =
    state.value.interaction.state ===
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
    state.value.interaction.ctx.elligibleCards.some(id => id === cardId);

  const canAttack =
    state.value.interaction.state === INTERACTION_STATES.IDLE &&
    state.value.phase.state === GAME_PHASES.ATTACK &&
    state.value.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET &&
    state.value.phase.ctx.potentialTargets.some(id => id === cardId);

  return canSelect || canAttack;
});

const cardComponent = useTemplateRef('card');
const cardElement = computed(() => unrefElement(cardComponent));

const onTakeDamage = async (e: {
  card: SerializedCard;
  damage: {
    type: DamageType;
    amount: number;
  };
}) => {
  if (e.card.id !== cardId || !cardElement.value || e.damage.amount <= 0) {
    return;
  }

  card.value.update(e.card);

  cardElement.value.classList.add('damage');
  cardElement.value.dataset.damage = `HP -${e.damage.amount}`;
  setTimeout(() => {
    cardElement.value?.classList.remove('damage');
    delete cardElement.value?.dataset.damage;
  }, 1750);

  const keyframes: Keyframe[] = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' }
  ];

  await cardElement.value?.animate(keyframes, {
    duration: 500,
    easing: 'ease-in-out',
    iterations: 1
  }).finished;
};
useFxEvent(FX_EVENTS.MINION_AFTER_TAKE_DAMAGE, onTakeDamage);
useFxEvent(FX_EVENTS.HERO_AFTER_TAKE_DAMAGE, onTakeDamage);
</script>

<template>
  <CardResizer :enabled="autoScale" class="game-card" ref="card">
    <PopoverRoot v-model:open="isActionsPopoverOpened">
      <PopoverAnchor />
      <Card
        :id="card.id"
        :card="{
          id: card.id,
          name: card.name,
          affinity: card.affinity,
          description: card.description,
          image: card.imagePath,
          kind: card.kind,
          level: card.level,
          rarity: card.rarity,
          manaCost: card.manaCost,
          destinyCost: card.destinyCost,
          atk: card.atk,
          hp: card.hp,
          spellpower: card.spellpower,
          durability: card.durability,
          subKind: card.subKind,
          uinlockableAffinities: card.unlockableAffinities,
          abilities: card.abilities.map(ability => ability.description)
        }"
        class="card"
        :class="{
          floating: card.location === 'board',
          exhausted: card.isExhausted,
          disabled: !card.canPlay && card.location === 'hand',
          selected: client.ui.selectedCard?.equals(card),
          targetable: isTargetable
        }"
        @click="
          () => {
            if (!interactive) return;
            client.ui.onCardClick(card);
          }
        "
      />
      <CardStats v-if="interactive" :card="card" />

      <PopoverPortal :disabled="card.location === 'hand'">
        <PopoverContent :side-offset="-50" v-if="interactive">
          <CardActions
            :card="card"
            v-model:is-opened="isActionsPopoverOpened"
          />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </CardResizer>
</template>

<style scoped lang="postcss">
@keyframes card-glow {
  0%,
  80%,
  100% {
    box-shadow: 0 0 10px hsl(var(--glow-hsl) / 0.25);
  }
  40% {
    box-shadow: 0 0 30px hsl(var(--glow-hsl) / 0.75);
  }
}

.game-card {
  --pixel-scale: 2;
  --floating-amount: 10px;
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  &.damage::after {
    content: attr(data-damage);
    position: absolute;
    top: 0;
    font-size: var(--font-size-12);
    color: red;
    background-size: cover;
    transform: translateZ(30px);
    font-weight: var(--font-weight-9);
    -webkit-text-stroke: 2px black;
    paint-order: fill stroke;
    transition: all 0.3s var(--ease-in-2);
    @starting-style {
      transform: translateZ(60px) translateY(-50px) scale(15);
      filter: blur(10px);
      opacity: 0;
    }
  }
}

.disabled {
  filter: grayscale(0.75);
}

.selected {
  outline: solid 3px cyan;
}

.highlighted::after {
  content: '';
  position: absolute;
  inset: 0;
  --glow-hsl: var(--cyan-4-hsl);
  animation: card-glow 2.5s infinite;
}

.card {
  transition: all 0.3s var(--ease-2);
  &.floating {
    transform: translateZ(var(--floating-amount));
  }
  &.exhausted {
    filter: grayscale(0.5);
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

@keyframes horizontal-shaking {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
