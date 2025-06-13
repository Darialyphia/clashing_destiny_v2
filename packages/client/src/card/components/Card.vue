<script setup lang="ts">
import {
  CARD_KINDS,
  RARITIES,
  type Affinity,
  type CardKind,
  type Rarity
} from '@game/engine/src/card/card.enums';
import { clamp, isDefined, mapRange } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import { until, useMouse } from '@vueuse/core';

const { card } = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    image: string;
    kind: CardKind;
    affinity: Affinity;
    uinlockableAffinities?: Affinity[];
    manaCost?: number | null;
    baseManaCost?: number | null;
    destinyCost?: number | null;
    baseDestinyCost?: number | null;
    rarity: Rarity;
    level?: number | null;
    atk?: number | null;
    hp?: number | null;
    spellpower?: number | null;
    durability?: number | null;
    abilities?: string[];
    subKind?: string | null;
  };
}>();

const rarityBg = computed(() => {
  if (
    [RARITIES.BASIC, RARITIES.COMMON, RARITIES.TOKEN].includes(
      card.rarity as any
    )
  ) {
    return `url('/assets/ui/card-rarity-common.png')`;
  }

  return `url('/assets/ui/card-rarity-${card.rarity}.png')`;
});

const kindBg = computed(() => {
  return `url('/assets/ui/card-kind-${card.kind.toLowerCase()}.png')`;
});

const subKindBg = computed(() => {
  return `url('/assets/ui/subkind-${(card.subKind ?? '').toLowerCase()}.png')`;
});

const imageBg = computed(() => {
  return `url('${card.image}')`;
});

const affinityBg = computed(() => {
  return `url('/assets/ui/card-bg-${card.affinity.toLowerCase()}.png')`;
});

const affinityGemBg = (affinity: Affinity) => {
  return `url('/assets/ui/affinity-${affinity.toLowerCase()}.png')`;
};

const root = useTemplateRef('card');
const { x, y } = useMouse();

const rect = computed(() => root.value?.getBoundingClientRect());

const pointerStyle = computed(() => {
  if (!rect.value) return;
  const pointer = {
    x: clamp(x.value - rect.value.left, 0, rect.value.width),
    y: clamp(y.value - rect.value.top, 0, rect.value.height)
  };
  const percent = {
    x: (pointer.x / rect.value.width) * 100,
    y: (pointer.y / rect.value.height) * 100
  };
  return {
    glareX: pointer.x,
    glareY: pointer.y,
    foilX: Math.round(mapRange(percent.x, [0, 100], [37, 63])),
    foilY: Math.round(mapRange(percent.y, [0, 100], [33, 67])),
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

const descriptionBox = useTemplateRef('description-box');

const MIN_TEXT_SIZE = 10;
const MAX_TEXT_SIZE = 18;
const textSize = ref(MAX_TEXT_SIZE);
until(descriptionBox)
  .toBeTruthy()
  .then(box => {
    const inner = box.firstChild as HTMLElement;
    let outerHeight = box.clientHeight;
    let innerHeight = inner.clientHeight;

    while (innerHeight > outerHeight) {
      textSize.value -= 0.5;
      box.style.fontSize = `${textSize.value}px`;

      innerHeight = inner.clientHeight;
      if (textSize.value <= MIN_TEXT_SIZE) {
        break;
      }
    }
  });
const multiLineChecker = useTemplateRef('multi-line-checker');

const isMultiLine = computed(() => {
  if (!multiLineChecker.value) return;
  if (!descriptionBox.value) return;
  if (card.description.includes('\n')) return true;
  if (card.abilities?.length) return true;
  const boxRect = descriptionBox.value.getBoundingClientRect();
  const checkerRect = multiLineChecker.value.getBoundingClientRect();
  return checkerRect.top > boxRect.top;
});

const costStatus = computed(() => {
  if (isDefined(card.manaCost)) {
    if (!isDefined(card.baseManaCost) || card.baseManaCost === card.manaCost)
      return '';

    return card.manaCost < card.baseManaCost ? 'buffed' : 'debuffed';
  } else if (isDefined(card.destinyCost)) {
    if (
      !isDefined(card.baseDestinyCost) ||
      card.baseDestinyCost === card.destinyCost
    )
      return '';

    return card.destinyCost < card.baseDestinyCost ? 'buffed' : 'debuffed';
  }

  return '';
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
      <!-- <div class="foil" /> -->
      <div class="image" />
      <div class="name" :data-text="card.name">
        {{ card.name }}
      </div>
      <div></div>
      <div class="affinity-zone">
        <template v-if="card.uinlockableAffinities?.length">
          <div
            v-for="affinity in card.uinlockableAffinities"
            :key="affinity"
            class="affinity"
            :style="{ '--bg': affinityGemBg(affinity) }"
          />
        </template>
        <div
          v-else
          class="affinity"
          :style="{ '--bg': affinityGemBg(card.affinity) }"
        />
      </div>
      <!--
      <div class="level" v-if="card.level">
        <div v-for="i in card.level" :key="i" class="level-icon" />
      </div> -->

      <div class="rarity" />
      <div class="stats">
        <div
          v-if="isDefined(card.manaCost)"
          class="mana-cost"
          :class="costStatus"
        >
          <div class="dual-text" :data-text="card.manaCost">
            {{ card.manaCost }}
          </div>
        </div>
        <div
          v-if="isDefined(card.destinyCost)"
          class="destiny-cost"
          :class="costStatus"
        >
          <div class="dual-text" :data-text="card.destinyCost">
            {{ card.destinyCost }}
          </div>
        </div>
        <div v-if="isDefined(card.atk)" class="atk">
          <div class="dual-text" :data-text="card.atk">
            {{ card.atk }}
          </div>
        </div>
        <div v-if="isDefined(card.spellpower)" class="spellpower">
          <div class="dual-text" :data-text="card.spellpower">
            {{ card.spellpower }}
          </div>
        </div>
        <div v-if="isDefined(card.hp)" class="hp">
          <div class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>
        <div v-if="isDefined(card.durability)" class="durability">
          <div class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>
      </div>
      <div class="kind">
        <div class="kind-icon" />
        <template v-if="isDefined(card.level)">Lvl {{ card.level }}</template>
        {{ card.kind.toLocaleLowerCase() }}
      </div>
      <div
        class="description"
        ref="description-box"
        :class="{ 'is-multi-line': isMultiLine }"
      >
        <div>
          <CardText :text="card.description" />
          <CardText
            v-for="ability in card.abilities"
            :key="ability"
            :text="ability"
          />
        </div>
        <span ref="multi-line-checker" />
      </div>

      <div class="sub-kind" v-if="card.subKind">
        {{ card.subKind }}
      </div>
      <div class="glare lt-lg:hidden" />
    </div>
    <div class="card-back" />
  </div>
</template>

<style scoped lang="postcss">
.card {
  --pixel-scale: 2;
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));
  --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
  --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
  --pointer-from-center: v-bind('pointerStyle?.pointerFromCenter');
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  display: grid;
  transform-style: preserve-3d;

  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('/assets/ui/card-bg.png'), v-bind(affinityBg);
  background-size: cover;
  color: #fcffcb;
  /* font-family: 'NotJamSlab14', monospace; */
  font-size: 16px;
  padding: 1rem;
  transform-style: preserve-3d;
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back5.png');
  background-size: cover;
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
      var(--_top-color) 40%,
      var(--_bottom-color) 40%
    );
    background-clip: text;
  }
  &:before {
    text-shadow:
      0 2px black,
      0 -2px black,
      2px 0 black,
      -2px 0 black;
    z-index: -1;
  }
}

.image {
  background: v-bind(imageBg);
  background-size: cover;
  background-position: center;
  width: calc(96px * var(--pixel-scale));
  height: calc(96px * var(--pixel-scale));
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  /* &::after {
    position: absolute;
    inset: 0;
    content: '';
    background: v-bind(imageBg);
    background-size: cover;
    background-position: center;
    filter: blur(10px) sepia(60%) hue-rotate(40deg);
    transform: translateY(-10px);
    mix-blend-mode: screen;
  } */

  .card:is(.minion, .hero) & {
    background-position: center -15px;
  }
}

.name {
  width: calc(100px * var(--pixel-scale));
  text-align: center;
  text-wrap: pretty;
  position: absolute;
  top: calc(80px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  line-height: 1.1;
  -webkit-text-stroke: 4px black;
  font-weight: var(--font-weight-5);
  paint-order: stroke fill;
  height: calc(20px * var(--pixel-scale));
  display: grid;
  align-items: center;
}

.affinity-zone {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  gap: calc(2px * var(--pixel-scale));
}

.affinity {
  background: var(--bg);
  background-size: cover;
  background-position: center;
  width: calc(26px * var(--pixel-scale));
  height: calc(28px * var(--pixel-scale));
}

.rarity {
  background: v-bind(rarityBg);
  background-size: cover;
  background-position: center;
  width: calc(12px * var(--pixel-scale));
  height: calc(15px * var(--pixel-scale));
  position: absolute;
  top: calc(102px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
}

.stats {
  position: absolute;
  top: calc(0px * var(--pixel-scale));
  left: calc(2px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  > * {
    z-index: 0;
    background-size: cover;
    background-position: center;
    width: calc(28px * var(--pixel-scale));
    height: calc(30px * var(--pixel-scale));
    display: grid;
    place-content: center;
    font-size: 24px;
    padding-top: calc(3px * var(--pixel-scale));
    font-family: 'NotJamSlab11', monospace;
  }
}

.level {
  position: absolute;
  top: calc(32px * var(--pixel-scale));
  right: calc(9px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  > * {
    background-image: url('/assets/ui/card-level-filled.png');
    background-size: cover;
    background-position: center;
    width: calc(13px * var(--pixel-scale));
    height: calc(13px * var(--pixel-scale));
    display: grid;
    place-content: center;
    font-size: 28px;
    padding-top: calc(4px * var(--pixel-scale));
    font-family: 'NotJamSlab11', monospace;
  }
}

.buffed {
  --top-color: var(--green-2);
  --bottom-color: var(--green-6);
}
.debuffed {
  --top-color: var(--red-3);
  --bottom-color: var(--red-6);
}
.mana-cost {
  background-image: url('/assets/ui/card-mana.png');
}

.destiny-cost {
  background-image: url('/assets/ui/card-destiny.png');
}

.atk {
  background-image: url('/assets/ui/card-attack.png');
}

.spellpower {
  background-image: url('/assets/ui/card-spellpower.png');
}

.hp {
  background-image: url('/assets/ui/card-hp.png');
}

.durability {
  background-image: url('/assets/ui/card-durability.png');
}

.kind {
  width: calc(96px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  position: absolute;
  top: calc(120px * var(--pixel-scale));
  left: calc(20px * var(--pixel-scale));
  display: flex;
  align-items: center;
  gap: calc(2px * var(--pixel-scale));
  text-transform: capitalize;
  font-size: 14px;

  .kind-icon {
    background: v-bind(kindBg);
    background-size: cover;
    background-position: center;
    width: calc(16px * var(--pixel-scale));
    aspect-ratio: 1;
  }
}

.description {
  width: calc(116px * var(--pixel-scale));
  height: calc(58px * var(--pixel-scale));
  position: absolute;
  top: calc(139px * var(--pixel-scale));
  left: calc(24px * var(--pixel-scale));
  font-size: calc(1px * v-bind(textSize));
  overflow: hidden;
  text-align: center;
  &.is-multi-line {
    text-align: left;
  }
  > * {
    display: inline-block;
  }
  > span {
    width: 1px;
    height: 1px;
    align-self: start;
    vertical-align: top;
  }
}

.sub-kind {
  height: calc(16px * var(--pixel-scale));
  position: absolute;
  bottom: calc(2px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
  font-size: 14px;
  overflow: hidden;
  background: v-bind(subKindBg), black;
  border-radius: var(--radius-pill);
  display: flex;
  align-items: center;
  background-repeat: no-repeat;
  background-position: left center;
  background-size: calc(16px * var(--pixel-scale))
    calc(16px * var(--pixel-scale));
  padding-inline: calc(18px * var(--pixel-scale)) 6px;
}

.glare {
  position: absolute;
  pointer-events: none;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s;
  background-image: radial-gradient(
    circle at var(--glare-x) var(--glare-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 0%, 100%, 0.65) 20%,
    hsla(0, 0%, 0%, 0.5) 90%
  );
  mix-blend-mode: overlay;
  mask-image: url('/assets/ui/card-bg.png');
  mask-size: cover;

  .card:hover & {
    opacity: 0.8;
  }
}

@property --foil-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes foil-spin {
  from {
    --foil-angle: 0deg;
  }
  to {
    --foil-angle: 360deg;
  }
}
.foil {
  --space: 5%;
  --foil-angle: 0deg;
  --img-size: 300% 400%;
  position: absolute;
  inset: 0;
  animation: foil-spin 10s infinite linear;
  background: repeating-linear-gradient(
    var(--foil-angle),
    hsla(283, 49%, 60%, 0.75) calc(var(--space) * 1),
    hsla(2, 74%, 59%, 0.75) calc(var(--space) * 2),
    hsla(53, 67%, 53%, 0.75) calc(var(--space) * 3),
    hsla(93, 56%, 52%, 0.75) calc(var(--space) * 4),
    hsla(176, 38%, 50%, 0.75) calc(var(--space) * 5),
    hsla(228, 100%, 77%, 0.75) calc(var(--space) * 6),
    hsla(283, 49%, 61%, 0.75) calc(var(--space) * 7)
  );
  background-size: var(--img-size);
  opacity: 0.7;
  mix-blend-mode: color-dodge;
  background-position:
    0% calc(33% * 1),
    63% 33%;
  /* background-position:
    0% calc(var(--foil-y) * 1),
    var(--foil-x) var(--foil-y); */
  /* opacity: 0; */
  /* display: none; */
  transition: opacity 0.3s;
  filter: brightness(0.85) contrast(2.75) saturate(0.65);
  mask-image: url('/assets/ui/card-bg.png');
  mask-size: cover;

  &::after {
    position: absolute;
    inset: 0;
    content: '';
    background-image: radial-gradient(
      farthest-corner ellipse at calc(((var(--glare-x)) * 0.5) + 25%)
        calc(((var(--glare-y)) * 0.5) + 25%),
      hsl(0, 0%, 100%) 5%,
      hsla(300, 100%, 11%, 0.6) 40%,
      hsl(0, 0%, 22%) 120%
    );
    background-position: center center;
    background-size: 400% 500%;
    filter: brightness(calc((var(--pointer-from-center) * 0.2) + 0.4))
      contrast(0.85) saturate(1.1);
    mix-blend-mode: hard-light;
  }
}
</style>
