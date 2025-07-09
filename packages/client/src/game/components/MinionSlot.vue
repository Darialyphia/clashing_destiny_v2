<script setup lang="ts">
import type { SerializedBoardMinionSlot } from '@game/engine/src/board/board-minion-slot.entity';
import InspectableCard from '@/card/components/InspectableCard.vue';
import {
  useFxEvent,
  useGameClient,
  useMaybeEntity
} from '../composables/useGameClient';
import { useMinionSlot } from '../composables/useMinionSlot';
import { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import {
  PopoverRoot,
  PopoverAnchor,
  PopoverPortal,
  PopoverContent
} from 'reka-ui';
import CardStats from './CardStats.vue';
import CardActions from './CardActions.vue';
import type { SerializedCard } from '@game/engine/src/card/entities/card.entity';
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { DamageType } from '@game/engine/src/utils/damage';

const props = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const client = useGameClient();

const { player, isHighlighted } = useMinionSlot(
  computed(() => props.minionSlot)
);

const card = useMaybeEntity<CardViewModel>(
  computed(() => props.minionSlot.minion)
);

const isActionsPopoverOpened = computed({
  get() {
    if (!card.value) return false;
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(card.value);
  },
  set(value) {
    if (!card.value) return;
    if (value) {
      client.value.ui.select(card.value);
    } else {
      client.value.ui.unselect();
    }
  }
});

const cardElement = useTemplateRef('card');
const onTakeDamage = async (e: {
  card: SerializedCard;
  damage: {
    type: DamageType;
    amount: number;
  };
}) => {
  if (!card.value) return;
  if (
    e.card.id !== card.value.id ||
    !cardElement.value ||
    e.damage.amount <= 0
  ) {
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
</script>

<template>
  <div
    class="minion-slot"
    :class="{ highlighted: isHighlighted, exhausted: card?.isExhausted }"
    :id="`minion-slot-${props.minionSlot.playerId}-${props.minionSlot.position}-${props.minionSlot.zone}`"
    @click="
      client.ui.onMinionSlotClick({
        player: player,
        slot: props.minionSlot.position,
        zone: props.minionSlot.zone
      })
    "
  >
    <div class="minion-wrapper">
      <InspectableCard v-if="card" :card-id="card.id" side="right">
        <PopoverRoot v-model:open="isActionsPopoverOpened">
          <PopoverAnchor />
          <div
            ref="card"
            :id="card.id"
            class="slot-minion"
            :style="{ '--bg': `url(${card?.imagePath})` }"
            @click="client.ui.onCardClick(card)"
          />
          <PopoverPortal :disabled="card.location === 'hand'">
            <PopoverContent :side-offset="-50">
              <CardActions
                :card="card"
                v-model:is-opened="isActionsPopoverOpened"
              />
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
      </InspectableCard>

      <CardStats v-if="card" :card-id="card.id" class="stats" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.minion-slot {
  --pixel-scale: 1;
  width: calc(var(--minion-slot-width) * var(--pixel-scale));
  height: calc(var(--minion-slot-height) * var(--pixel-scale));
  border-radius: var(--radius-2);
  background: url('/assets/ui/card-board-front-2.png') no-repeat center;
  background-size: cover;
  position: relative;
  transform-style: preserve-3d;
  &:hover {
    border-color: var(--cyan-4);
  }
  &.highlighted {
    border-color: cyan;
    background-color: hsl(200 100% 50% / 0.25);
  }

  &.exhausted .slot-minion {
    filter: grayscale(0.75);
  }
}

.slot-minion {
  width: 100%;
  aspect-ratio: 1;
  position: relative;

  &:hover {
    filter: brightness(1.25);
  }
  &::before {
    --pixel-scale: 1;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    inset: 0;
    border-radius: var(--radius-2);
    background: var(--bg) no-repeat;
    background-position: center 85%;
    background-size: calc(96px * var(--pixel-scale))
      calc(96px * var(--pixel-scale));
    transform: scale(2) translateY(-15%);
    pointer-events: none;
  }
}
/* eslint-disable-next-line vue-scoped-css/no-unused-selector */
.slot-minion.damage::after {
  content: attr(data-damage);
  position: absolute;
  top: 0;
  font-size: var(--font-size-5);
  background-size: cover;
  transform: translateZ(30px);
  font-weight: var(--font-weight-9);
  -webkit-text-stroke: 2px black;
  paint-order: fill stroke;
  transition: all 0.3s var(--ease-in-2);
  pointer-events: none;
  color: var(--red-9);

  @starting-style {
    transform: translateZ(60px) translateY(-50px) scale(12);
    filter: blur(10px);
    opacity: 0;
  }
}

.minion-wrapper {
  transform: translateY(40px) translateX(25px) translateZ(75px) rotateX(-80deg)
    rotateY(10deg);
  transform-style: preserve-3d;
}
</style>
