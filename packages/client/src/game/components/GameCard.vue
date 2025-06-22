<script setup lang="ts">
import { unrefElement } from '@vueuse/core';
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

import CardStats from './CardStats.vue';
import CardActions from './CardActions.vue';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import { type DamageType } from '@game/engine/src/utils/damage';
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
const {
  cardId,
  interactive = true,
  autoScale = true,
  deferAutoScaling = false,
  imageOnly = false
} = defineProps<{
  cardId: string;
  interactive?: boolean;
  autoScale?: boolean;
  deferAutoScaling?: boolean;
  imageOnly?: boolean;
}>();

const card = useCard(computed(() => cardId));

const client = useGameClient();

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

  return (
    card.value.canBeTargeted ||
    client.value.ui.selectedManaCostIndices.includes(card.value.indexInHand!)
  );
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

const state = useGameState();
const spriteUrl = computed(() => {
  const card = state.value.entities[cardId] as CardViewModel;
  if (!card) return '';
  return `url(${card.imagePath})`;
});
</script>

<template>
  <CardResizer
    :enabled="autoScale"
    class="game-card"
    ref="card"
    :class="{ 'is-enemy': card.getPlayer().id !== client.playerId }"
    :defer="deferAutoScaling"
  >
    <PopoverRoot v-model:open="isActionsPopoverOpened">
      <PopoverAnchor />
      <div
        v-if="imageOnly"
        class="card sprite"
        :id="card.id"
        :style="{ '--bg': spriteUrl }"
        :class="{
          floating: card.location === 'board',
          exhausted: card.isExhausted,
          disabled: interactive && !card.canPlay && card.location === 'hand',
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
      <Card
        v-else
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
          baseManaCost: card.baseManaCost,
          destinyCost: card.destinyCost,
          baseDestinyCost: card.baseDestinyCost,
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
          disabled: interactive && !card.canPlay && card.location === 'hand',
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

      <CardStats v-if="interactive" :card-id="card.id" class="stats" />

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

.game-card {
  --pixel-scale: 2;
  --floating-amount: 10px;
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  &.damage::after {
    content: attr(data-damage);
    position: absolute;
    top: 0;
    font-size: var(--font-size-11);
    color: red;
    background-size: cover;
    transform: translateZ(30px);
    font-weight: var(--font-weight-9);
    -webkit-text-stroke: 2px black;
    paint-order: fill stroke;
    transition: all 0.3s var(--ease-in-2);
    pointer-events: none;

    @starting-style {
      transform: translateZ(60px) translateY(-50px) scale(15);
      filter: blur(10px);
      opacity: 0;
    }
  }
  &.is-enemy.damage::after {
    rotate: 180deg;
  }
}

.disabled {
  filter: grayscale(0.75);
}

.selected {
  outline: solid 3px cyan;
}

/* .highlighted::after {
  content: '';
  position: absolute;
  inset: 0;
  --glow-hsl: var(--cyan-4-hsl);
  animation: card-glow 2.5s infinite;
} */

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

/* @keyframes horizontal-shaking {
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
} */

.sprite {
  aspect-ratio: var(--card-ratio);
  position: relative;
  background-image: url('/assets/ui/card-board-front.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: var(--bg);
    background-position: center -50;
    background-size: calc(3.5 * 96px);
    background-repeat: no-repeat;
    image-rendering: pixelated;
    transition: transform 0.2s var(--ease-2);
  }
  &:hover::after {
    transform: translateY(-10px);
  }
}

.game-card:has(.sprite.floating) .stats {
  transform: translateZ(var(--floating-amount));
}
</style>
