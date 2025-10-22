<script setup lang="ts">
import { type CardKind } from '@game/engine/src/card/card.enums';
import { clamp, isDefined } from '@game/shared';
import { useElementBounding, useMouse } from '@vueuse/core';
import CardFoil from './CardFoil.vue';
import CardGlare from './CardGlare.vue';

const {
  card,
  isFoil,
  showStats = false
} = defineProps<{
  card: {
    id: string;
    image: string;
    kind: CardKind;
    atk?: number | null;
    baseAtk?: number | null;
    hp?: number | null;
    countdown?: number | null;
    maxHp?: number | null;
    baseMaxHp?: number | null;
    durability?: number | null;
    manaCost?: number | null;
    destinyCost?: number | null;
  };
  isFoil?: boolean;
  showStats?: boolean;
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
    class="small-card"
    :class="card.kind.toLocaleLowerCase()"
    :data-flip-id="`card_${card.id}`"
    ref="card"
  >
    <div class="card-front">
      <CardFoil v-if="isFoil" />
      <div class="image">
        <div class="art" />
      </div>

      <div
        v-if="isDefined(card.atk) && showStats"
        class="atk"
        :class="{
          buffed: isDefined(card.baseAtk) && card.atk > card.baseAtk,
          debuffed: isDefined(card.baseAtk) && card.atk < card.baseAtk
        }"
      >
        <div class="dual-text" :data-text="card.atk">
          {{ card.atk }}
        </div>
      </div>
      <div
        v-if="isDefined(card.hp) && showStats"
        class="hp"
        :class="{
          buffed: isDefined(card.baseMaxHp) && card.hp > card.baseMaxHp,
          debuffed: isDefined(card.maxHp) && card.hp < card.maxHp
        }"
      >
        <div class="dual-text" :data-text="card.hp">
          {{ card.hp }}
        </div>
      </div>
      <div v-if="isDefined(card.durability) && showStats" class="durability">
        <div class="dual-text" :data-text="card.durability">
          {{ card.durability }}
        </div>
      </div>
      <div v-if="isDefined(card.countdown) && showStats" class="countdown">
        <div class="dual-text" :data-text="card.countdown">
          {{ card.countdown }}
        </div>
      </div>
      <div v-if="isDefined(card.manaCost) && showStats" class="mana-cost">
        <div class="dual-text" :data-text="card.manaCost">
          {{ card.manaCost }}
        </div>
      </div>
      <div v-if="isDefined(card.destinyCost) && showStats" class="destiny-cost">
        <div class="dual-text" :data-text="card.destinyCost">
          {{ card.destinyCost }}
        </div>
      </div>

      <CardGlare />
    </div>
    <div class="card-back">
      <CardFoil v-if="isFoil" />
      <CardGlare />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.small-card {
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));
  --foil-oil-x: calc(1px * v-bind('pointerStyle?.foilOilX'));
  --foil-oil-y: calc(1px * v-bind('pointerStyle?.foilOilY'));
  --foil-animated-toggle: ;
  width: calc(var(--card-small-width) * var(--pixel-scale));
  height: calc(var(--card-small-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  --art-pixel-scale: calc(2 * var(--pixel-scale));
  --root-pixel-scale: var(--pixel-scale);
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
  padding: calc(1rem * var(--pixel-scale));
  position: relative;
  transform-style: preserve-3d;
  --glare-mask: url('/assets/ui/card-front-small.png');
  --foil-mask: url('/assets/ui/card-front-small.png');
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back-small.png');
  background-size: cover;
  --glare-mask: url('/assets/ui/card-front-small.png');
  --foil-mask: url('/assets/ui/card-front-small.png');
}

.image {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mask: url('/assets/ui/card-front-small-mask.png');
  mask-size: cover;
  display: grid;
  transform-origin: center center;
  > * {
    grid-column: 1;
    grid-row: 1;
  }

  .art {
    position: absolute;
    inset: 0;
    background: v-bind(imageBg);
    background-position: center;
    background-size: calc(96px * var(--pixel-scale))
      calc(96px * var(--pixel-scale));
  }
  .card-front:has(.foil) & .art {
    animation: foil-image 10s infinite alternate var(--ease-2);
    filter: drop-shadow(0 1px 0 lime) drop-shadow(0 -1px 0 magenta)
      drop-shadow(1px 0 0 cyan) drop-shadow(-1px 0 0 yellow);
  }

  :is(.minion, .hero) & .art {
    --pixel-scale: var(--art-pixel-scale);
    background-position: center calc(50% + 20px);
  }
  .spell & .art {
    --pixel-scale: var(--art-pixel-scale);
    background-image: v-bind(imageBg), url('/assets/ui/frame-spell.png');
  }

  .sigil & .art {
    --pixel-scale: var(--art-pixel-scale);
    background-image: v-bind(imageBg), url('/assets/ui/frame-sigil.png');
  }

  .artifact & .art {
    --pixel-scale: var(--art-pixel-scale);
    background-image: v-bind(imageBg), url('/assets/ui/frame-artifact.png');
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
  left: calc(15px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-right: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}

.hp {
  background-image: url('/assets/ui/card-hp.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  bottom: calc(14px * var(--pixel-scale));
  right: calc(15px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}

.buffed {
  --top-color: var(--green-2);
  --bottom-color: var(--green-6);
}
.debuffed {
  --top-color: var(--red-5);
  --bottom-color: var(--red-9);
}

.durability {
  background-image: url('/assets/ui/card-durability.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  bottom: calc(14px * var(--pixel-scale));
  right: calc(15px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}

.countdown {
  background-image: url('/assets/ui/card-countdown.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  bottom: calc(14px * var(--pixel-scale));
  right: calc(15px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}

.mana-cost {
  background-image: url('/assets/ui/mana-cost.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(12px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-right: calc(0px * var(--pixel-scale));
  padding-top: calc(0px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}

.destiny-cost {
  background-image: url('/assets/ui/destiny-cost.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(12px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(0px * var(--pixel-scale));
  padding-top: calc(0px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 10px;
  --dual-text-offset-y: 1px;
  scale: 2;
}

.dual-text {
  color: transparent;
  position: relative;
  --_top-color: var(--top-color, #fcfcfc);
  --_bottom-color: var(--bottom-color, #ffb270);
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(
      var(--_top-color),
      var(--_top-color) 50%,
      var(--_bottom-color) 50%
    );
    line-height: 1.2;
    background-clip: text;
    background-size: 100% 1lh;
    background-repeat: repeat-y;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
  &:before {
    -webkit-text-stroke: calc(2px * var(--pixel-scale)) black;
    z-index: -1;
    translate: var(--dual-text-offset-x, 0) var(--dual-text-offset-y, 0);
  }
}
</style>
