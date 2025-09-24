<script setup lang="ts">
import { type CardKind } from '@game/engine/src/card/card.enums';
import { clamp, isDefined } from '@game/shared';
import { useElementBounding, useMouse } from '@vueuse/core';
import CardFoil from './CardFoil.vue';

const { card } = defineProps<{
  card: {
    id: string;
    image: string;
    kind: CardKind;
    atk?: number | null;
    hp?: number | null;
    durability?: number | null;
  };
}>();

const imageBg = computed(() => {
  return `url('${card.image}')`;
});

const root = useTemplateRef('card');
const { x, y } = useMouse();

const rect = useElementBounding(root);

const pointerStyle = computed(() => {
  const left = rect.left.value ?? 0;
  const top = rect.top.value ?? 0;
  const width = rect.width.value ?? 0;
  const height = rect.height.value ?? 0;

  const pointer = {
    x: clamp(x.value - left, 0, width),
    y: clamp(y.value - top, 0, height)
  };
  const percent = {
    x: (pointer.x / width) * 100,
    y: (pointer.y / height) * 100
  };
  return {
    glareX: pointer.x,
    glareY: pointer.y,
    foilOilX: width - pointer.x,
    foilOilY: height - pointer.y,
    pointerFromCenter: clamp(
      Math.sqrt(
        (percent.y - 50) * (percent.y - 50) +
          (percent.x - 50) * (percent.x - 50)
      ) / 50,
      0,
      1
    )
  };
});
</script>

<template>
  <div
    class="card"
    :class="card.kind.toLocaleLowerCase()"
    :data-flip-id="`card_${card.id}`"
    ref="card"
  >
    <div class="card-front">
      <CardFoil />
      <div class="image">
        <div class="shadow" />
        <div class="art" />
      </div>

      <div v-if="isDefined(card.atk)" class="atk">
        <div class="dual-text" :data-text="card.atk">
          {{ card.atk }}
        </div>
      </div>
      <div v-if="isDefined(card.hp)" class="hp">
        <div class="dual-text" :data-text="card.hp">
          {{ card.hp }}
        </div>
      </div>
    </div>
    <div class="card-back">
      <CardFoil />
      <!-- <div class="glare lt-lg:hidden" /> -->
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card {
  --pixel-scale: 2;
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));
  --foil-oil-x: calc(1px * v-bind('pointerStyle?.foilOilX'));
  --foil-oil-y: calc(1px * v-bind('pointerStyle?.foilOilY'));
  width: calc(var(--card-small-width) * var(--pixel-scale));
  height: calc(var(--card-small-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('/assets/ui/card-front-small.png');
  background-size: cover;
  color: #fcffcb;
  font-size: 16px;
  padding: 1rem;
  position: relative;
  transform-style: preserve-3d;
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back-small.png');
  background-size: cover;
}

.image {
  width: calc(96px * var(--pixel-scale));
  height: calc(96px * var(--pixel-scale));
  position: absolute;
  top: calc(8px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  > * {
    grid-column: 1;
    grid-row: 1;
  }

  .art {
    content: '';
    position: absolute;
    inset: 0;
    background: v-bind(imageBg);
    background-size: cover;
  }
  .card-front:has(.foil) & .art {
    animation: foil-image 10s infinite alternate var(--ease-2);
    filter: drop-shadow(0 1px 0 lime) drop-shadow(0 -1px 0 magenta)
      drop-shadow(1px 0 0 cyan) drop-shadow(-1px 0 0 yellow);
  }

  .spell & {
    background: url('/assets/ui/frame-spell.png') no-repeat;
    background-size: cover;
    top: 0;
  }

  .artifact & {
    background: url('/assets/ui/frame-artifact.png') no-repeat;
    background-size: cover;
    top: 0;
  }

  :is(.minion, .hero) & .shadow {
    filter: blur(12px);
    opacity: 0.33;
    transform: scale(1.1);
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: #bb8033;
      mask-image: v-bind(imageBg);
      mask-size: cover;
      background-size: cover;
    }
  }

  .card:is(.minion, .hero) & {
    background-position: center -15px;
  }
}

.atk {
  background-image: url('/assets/ui/card-attack.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  bottom: calc(14px * var(--pixel-scale));
  left: calc(12px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-right: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 2px;
}

.hp {
  background-image: url('/assets/ui/card-hp.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  bottom: calc(14px * var(--pixel-scale));
  right: calc(12px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 2px;
}
</style>
