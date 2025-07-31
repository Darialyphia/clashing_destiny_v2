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
import { FX_EVENTS } from '@game/engine/src/client/controllers/fx-controller';
import type { DamageType } from '@game/engine/src/utils/damage';

const props = defineProps<{
  minionSlot: SerializedBoardMinionSlot;
}>();

const client = useGameClient();

const { player, isHighlighted } = useMinionSlot(
  computed(() => props.minionSlot)
);

const minion = useMaybeEntity<CardViewModel>(
  computed(() => props.minionSlot.minion)
);

const isActionsPopoverOpened = computed({
  get() {
    if (!minion.value) return false;
    if (!client.value.ui.selectedCard) return false;
    return client.value.ui.selectedCard.equals(minion.value);
  },
  set(value) {
    if (!minion.value) return;
    if (value) {
      client.value.ui.select(minion.value);
    } else {
      client.value.ui.unselect();
    }
  }
});

const cardElement = useTemplateRef('card');
const onTakeDamage = async (e: {
  card: string;
  damage: {
    type: DamageType;
    amount: number;
  };
}) => {
  if (!minion.value) return;
  if (
    e.card !== minion.value.id ||
    !cardElement.value ||
    e.damage.amount <= 0
  ) {
    return;
  }

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
    :class="{
      highlighted: isHighlighted,
      exhausted: minion?.isExhausted,
      attacking: minion?.isAttacking
    }"
    :id="`minion-slot-${props.minionSlot.playerId}-${props.minionSlot.position}-${props.minionSlot.zone}`"
    @click="
      client.ui.onMinionSlotClick({
        player: player,
        slot: props.minionSlot.position,
        zone: props.minionSlot.zone
      })
    "
  >
    <template v-if="minion">
      <InspectableCard :card-id="minion.id" side="left" :side-offset="50">
        <div
          class="minion-clickable-area"
          @click="client.ui.onCardClick(minion)"
        />
      </InspectableCard>
      <div
        class="minion-wrapper"
        :class="{ opponent: minion.getPlayer().id !== client.playerId }"
      >
        <PopoverRoot v-model:open="isActionsPopoverOpened">
          <PopoverAnchor />
          <div
            ref="card"
            :id="minion.id"
            :class="{
              targetable: minion.canBeTargeted
            }"
            class="slot-minion"
            :style="{ '--bg': `url(${minion?.imagePath})` }"
          />
          <PopoverPortal :disabled="minion.location === 'hand'">
            <PopoverContent :side-offset="-50">
              <CardActions
                :card="minion"
                v-model:is-opened="isActionsPopoverOpened"
              />
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>

        <CardStats :card-id="minion.id" class="stats" />
      </div>
    </template>
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
  &:not(.attacking):hover {
    border-color: var(--cyan-4);
    background: url('/assets/ui/minino-slot-hover.png') no-repeat center;
  }
  &.attacking {
    border-color: var(--red-4);
    background: url('/assets/ui/minino-slot-attacking.png') no-repeat center;
  }
  &.highlighted {
    border-color: cyan;
    background-color: hsl(200 100% 50% / 0.25);
  }

  &.exhausted .slot-minion {
    filter: grayscale(0.75);
  }
}

.minion-clickable-area {
  position: absolute;
  inset: 0;
  .minion-slot:has(&:hover) .slot-minion {
    filter: brightness(1.25);
  }
}
.slot-minion {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  transition: filter 0.5s var(--ease-3);

  @starting-style {
    filter: brightness(400%) blur(5px);
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
    transform: translateY(-50px) scale(2);
    pointer-events: none;
  }

  &.targetable::before {
    filter: saturate(150%) drop-shadow(0 0 1px red);
  }

  &.targetable::after {
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
    transform: translateY(-50px) scale(2);
    pointer-events: none;
    filter: sepia(100%) brightness(50%) saturate(300%) hue-rotate(-50deg)
      blur(5px);
    mix-blend-mode: overlay;
  }

  .opponent &::before,
  .opponent &::after {
    transform: translateY(-50px) scale(2) scaleX(-1);
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
  /* transform: translateY(40px) translateX(20px) rotateZ(-45deg) rotateX(-60deg)
    translateY(-60px); */
  transform: translateZ(20px) rotateX(-25deg);
  transform-style: preserve-3d;
  pointer-events: none;
}

.stats {
  transform: translateY(10px) translateZ(20px);
}
</style>
