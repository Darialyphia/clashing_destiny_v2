<script setup lang="ts">
import type { PlayerViewModel } from '@game/engine/src/client/view-models/player.model';
import {
  useBoardSide,
  useCard,
  useFxEvent,
  useGameClient
} from '../composables/useGameClient';
import CardStats from './CardStats.vue';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import type { DamageType } from '@game/engine/src/utils/damage';
import InspectableCard from '@/card/components/InspectableCard.vue';
import {
  type HoverCardContentProps,
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import CardActions from './CardActions.vue';

const { player } = defineProps<
  Pick<HoverCardContentProps, 'side' | 'sideOffset'> & {
    player: PlayerViewModel;
  }
>();

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

const isActionsPopoverOpened = computed({
  get() {
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(hero.value);
  },
  set(value) {
    if (value) {
      client.value.ui.select(hero.value);
    } else {
      client.value.ui.unselect();
    }
  }
});
</script>

<template>
  <div
    class="hero-slot"
    :class="{ opponent: client.playerId !== player.id }"
    :id="hero.id"
    ref="card"
    @click="client.ui.onCardClick(hero)"
  >
    <div>
      <InspectableCard :card-id="hero.id" side="left" :side-offset="10">
        <PopoverRoot v-model:open="isActionsPopoverOpened">
          <PopoverAnchor />
          <div
            class="hero-sprite"
            :style="{ '--bg': `url(${hero.imagePath})` }"
            :class="{
              highlighted: hero.canBeTargeted,
              exhausted: hero.isExhausted
            }"
            :id="client.ui.DOMSelectors.heroSprite(player.id).id"
          />
          <PopoverPortal>
            <PopoverContent :side-offset="-50" side="top">
              <CardActions
                :card="hero"
                v-model:is-opened="isActionsPopoverOpened"
              />
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </InspectableCard>
      <CardStats :card-id="hero.id" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.hero-slot {
  --pixel-scale: 2;
  aspect-ratio: 1;
  height: calc(96px * var(--pixel-scale));
  /* transform: rotateZ(-45deg) rotateX(-60deg) translateY(-50%); */
  transform: rotateX(-25deg);
  transform-style: preserve-3d;
  justify-self: center;
  /* overflow: hidden; */
  &:hover {
    .hero-sprite:not(:is(.highlighted, .exhausted)):hover {
      filter: brightness(1.25);
    }
  }
}

.hero-sprite {
  --pixel-scale: 2;
  /* position: absolute;
  inset: 0; */
  aspect-ratio: 1;
  /* max-height: calc(var(--pixel-scale) * var(--hero-height)); */
  height: calc(96px * var(--pixel-scale));
  overflow: hidden;
  background: var(--bg) no-repeat center top;
  background-size: calc(96px * var(--pixel-scale));
  &.exhausted {
    filter: grayscale(0.75);
  }

  &.highlighted {
    filter: saturate(150%) drop-shadow(0 0 1px red);
    position: relative;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--bg) no-repeat center top;
      background-size: calc(96px * var(--pixel-scale));
      filter: sepia(100%) brightness(50%) saturate(300%) hue-rotate(-50deg)
        blur(5px);
      mix-blend-mode: overlay;
    }
  }

  .opponent & {
    transform: scaleX(-1);
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

.stats {
  left: 32px;
  top: 12px;
}
</style>
