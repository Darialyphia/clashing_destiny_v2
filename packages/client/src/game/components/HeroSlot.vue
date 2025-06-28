<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useCard,
  useFxEvent,
  useGameClient
} from '../composables/useGameClient';
import UnlockedAffinities from './UnlockedAffinities.vue';
import EquipedArtifacts from './EquipedArtifacts.vue';
import CardStats from './CardStats.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { DamageType } from '@game/engine/src/utils/damage';

const { player } = defineProps<{ player: PlayerViewModel }>();

const boardSide = useBoardSide(computed(() => player.id));
const hero = useCard(computed(() => boardSide.value.heroZone.hero));

const client = useGameClient();

const cardElement = useTemplateRef('card');
const onTakeDamage = async (e: {
  card: SerializedCard;
  damage: {
    type: DamageType;
    amount: number;
  };
}) => {
  if (!hero.value) return;
  if (
    e.card.id !== hero.value.id ||
    !cardElement.value ||
    e.damage.amount <= 0
  ) {
    return;
  }

  hero.value.update(e.card);

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
useFxEvent(FX_EVENTS.HERO_AFTER_TAKE_DAMAGE, onTakeDamage);
</script>

<template>
  <div
    class="hero-slot"
    :id="hero.id"
    ref="card"
    @click="client.ui.onCardClick(hero)"
  >
    <div class="hero-sprite" :style="{ '--bg': `url(${hero.imagePath})` }" />
    <UnlockedAffinities :player="player" class="affinities" />
    <EquipedArtifacts :player="player" class="artifacts" />
    <CardStats :card-id="hero.id" />
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  --pixel-scale: 2;
  position: relative;
  aspect-ratio: var(--hero-ratio);
  max-height: calc(var(--pixel-scale) * var(--hero-height));
  /* overflow: hidden; */

  .affinities {
    position: absolute;
    top: calc(-1 * var(--size-2));
    right: calc(-1 * var(--size-2));
    z-index: 1;
  }
  .artifacts {
    position: absolute;
    bottom: 0;
    left: calc(-1 * var(--size-3));
    z-index: 1;
  }
}

.hero-sprite {
  --pixel-scale: 2;
  position: absolute;
  inset: 0;
  aspect-ratio: var(--hero-ratio);
  max-height: calc(var(--pixel-scale) * var(--hero-height));
  background: url('/assets/ui/card-board-front.png') no-repeat center;
  background-size: cover;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg) no-repeat center top;
    background-size: calc(96px * var(--pixel-scale));
  }
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg) no-repeat center top;
    background-size: calc(96px * var(--pixel-scale));
    transform: scaleY(-0.5) translateY(-40px) skewX(20deg) translateX(-20px);
    filter: brightness(0);
    opacity: 0.5;
  }

  .affinities {
    position: absolute;
    top: calc(-1 * var(--size-2));
    right: calc(-1 * var(--size-2));
    z-index: 1;
  }
  .artifacts {
    position: absolute;
    bottom: 0;
    left: calc(-1 * var(--size-3));
    z-index: 1;
  }
}

/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
.hero-slot.damage::before {
  /* content: attr(data-damage);
  position: absolute;
  top: 0;
  font-size: var(--font-size-5);
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
  } */
}
</style>
