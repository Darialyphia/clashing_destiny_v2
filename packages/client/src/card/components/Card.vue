<script setup lang="ts">
import {
  RARITIES,
  type CardKind,
  type CardSpeed,
  type HeroJob,
  type Rarity,
  type SpellSchool
} from '@game/engine/src/card/card.enums';
import { clamp, isDefined, mapRange, uppercaseFirstLetter } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import {
  unrefElement,
  until,
  useElementBounding,
  useMouse,
  useResizeObserver
} from '@vueuse/core';
import CardFoil from './CardFoil.vue';
import CardGlare from './CardGlare.vue';

const {
  card,
  isFoil,
  isAnimated = true,
  showText = true
} = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    image: string;
    kind: CardKind;
    spellSchool?: SpellSchool;
    unlockedSpellSchools?: SpellSchool[];
    jobs?: HeroJob[];
    manaCost?: number | null;
    baseManaCost?: number | null;
    destinyCost?: number | null;
    baseDestinyCost?: number | null;
    rarity: Rarity;
    level?: number | null;
    atk?: number | null;
    hp?: number | null;
    countdown?: number | null;
    spellpower?: number | null;
    durability?: number | null;
    abilities?: string[];
    subKind?: string | null;
    speed: CardSpeed;
    tags?: string[];
  };
  isFoil?: boolean;
  isAnimated?: boolean;
  showText?: boolean;
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

const speedBg = computed(() => {
  return `url('/assets/ui/card-speed-badge-${card.speed.toLowerCase()}.png')`;
});

const imageBg = computed(() => {
  return `url('${card.image}')`;
});

const root = useTemplateRef('card');
const { x, y } = useMouse({
  scroll: false
});

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
    foilX: mapRange(percent.x, [0, 100], [0, 37.9]),
    foilY: percent.y,
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

const setVariableFontSize = (
  box: HTMLElement,
  sizeRef: Ref<number>,
  min: number
) => {
  const inner = box.firstChild as HTMLElement;
  const outerHeight = box.clientHeight;

  let innerHeight = inner.clientHeight;

  while (innerHeight > outerHeight) {
    sizeRef.value -= 0.5;
    box.style.fontSize = `${sizeRef.value}px`;

    innerHeight = inner.clientHeight;

    if (sizeRef.value <= min) {
      break;
    }
  }
};
const descriptionBox = useTemplateRef('description-box');
const descriptionChild = computed(() => {
  if (!descriptionBox.value) return;
  return descriptionBox.value.firstChild as HTMLElement;
});
// we need a resize observer because the description box size change change when description icons are loaded for the first time
useResizeObserver(descriptionChild, () => {
  setVariableFontSize(
    descriptionBox.value!,
    descriptionFontSize,
    DESCRIPTION_MIN_TEXT_SIZE
  );
});
const DESCRIPTION_MIN_TEXT_SIZE = 9;
const DESCRIPTION_MAX_TEXT_SIZE = 14;
const descriptionFontSize = ref(DESCRIPTION_MAX_TEXT_SIZE);
until(descriptionBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(box, descriptionFontSize, DESCRIPTION_MIN_TEXT_SIZE);
  });

const nameBox = useTemplateRef('name-box');
const NAME_MIN_TEXT_SIZE = 11;
const NAME_MAX_TEXT_SIZE = 16;

const nameFontSize = ref(NAME_MAX_TEXT_SIZE);
until(nameBox)
  .toBeTruthy()
  .then(box => {
    setVariableFontSize(box, nameFontSize, NAME_MIN_TEXT_SIZE);
  });

// const multiLineChecker = useTemplateRef('multi-line-checker');
const isMultiLine = computed(() => {
  // if (!multiLineChecker.value) return;
  // if (!descriptionBox.value) return;
  // if (card.description.includes('\n')) return true;
  // if (card.abilities?.length) return true;
  // const boxRect = descriptionBox.value.getBoundingClientRect();
  // const checkerRect = multiLineChecker.value.getBoundingClientRect();
  // return checkerRect.top > boxRect.top;
  return true;
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

const angle = ref({
  x: 0,
  y: 0
});

const MAX_ANGLE = 30;
const onMousemove = (e: MouseEvent) => {
  if (!root.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = unrefElement(
    root.value
  )!.getBoundingClientRect();
  angle.value = {
    y: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    x: ((clientY - top) / height - 0.5) * MAX_ANGLE
  };
};

const onMouseleave = () => {
  gsap.to(angle.value, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: Power2.easeOut
  });
};
</script>

<template>
  <div
    class="card-perspective-wrapper"
    @mousemove="onMousemove"
    @mouseleave="onMouseleave"
  >
    <div
      class="card"
      :class="[card.kind.toLocaleLowerCase(), isAnimated && 'animated']"
      :data-flip-id="`card_${card.id}`"
      ref="card"
    >
      <div class="card-front">
        <!-- <div class="fx flame" /> -->
        <CardFoil v-if="isFoil" />

        <div class="image">
          <div class="shadow" />
          <div class="art" />
        </div>

        <div ref="name-box" v-if="showText" class="name" :data-text="card.name">
          <div class="dual-text" :data-text="card.name">
            {{ card.name }}
          </div>
        </div>
        <div v-if="isDefined(card.atk)" class="atk">
          <div v-if="showText" class="dual-text" :data-text="card.atk">
            {{ card.atk }}
          </div>
        </div>
        <div v-if="isDefined(card.hp)" class="hp">
          <div v-if="showText" class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>
        <div v-if="isDefined(card.durability)" class="durability">
          <div v-if="showText" class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>
        <div v-if="isDefined(card.countdown)" class="countdown">
          <div v-if="showText" class="dual-text" :data-text="card.countdown">
            {{ card.countdown }}
          </div>
        </div>

        <div class="rarity parallax" style="--parallax-strength: 0.35" />

        <div class="top-right parallax" style="--parallax-strength: 0.35">
          <div
            v-if="isDefined(card.speed)"
            class="speed dual-text"
            :style="{ '--bg': speedBg }"
            :data-text="uppercaseFirstLetter(card.speed.toLocaleLowerCase())"
          >
            {{ uppercaseFirstLetter(card.speed.toLocaleLowerCase()) }}
          </div>
          <div
            v-for="school in card.unlockedSpellSchools ?? []"
            :key="school"
            class="spell-school"
            :style="{
              '--bg': `url('/assets/ui/spell-school-${school.toLowerCase()}.png')`
            }"
            :data-label="school.toLocaleLowerCase()"
          />
        </div>
        <div class="top-left parallax" style="--parallax-strength: 0.35">
          <div
            v-if="isDefined(card.manaCost)"
            class="mana-cost"
            :class="costStatus"
            data-label="Cost"
          >
            <div class="dual-text" :data-text="card.manaCost">
              {{ card.manaCost }}
            </div>
          </div>
          <div
            v-if="isDefined(card.destinyCost)"
            class="destiny-cost"
            :class="costStatus"
            data-label="Cost"
          >
            <div class="dual-text" :data-text="card.destinyCost">
              {{ card.destinyCost }}
            </div>
          </div>

          <div
            v-for="job in card.jobs ?? []"
            :key="job"
            class="job"
            :style="{
              '--bg': `url('/assets/ui/jobs-${job.toLowerCase()}.png')`
            }"
            :data-label="job.toLocaleLowerCase()"
          />

          <div
            v-if="card.spellSchool"
            class="spell-school"
            :style="{
              '--bg': `url('/assets/ui/spell-school-${card.spellSchool.toLowerCase()}.png')`
            }"
            :data-label="card.spellSchool.toLocaleLowerCase()"
          />
        </div>

        <div class="kind" v-if="showText">
          {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}
          <span v-if="isDefined(card.level)">- Lvl{{ card.level }}</span>
          <span v-if="isDefined(card.subKind)">
            - {{ uppercaseFirstLetter(card.subKind.toLocaleLowerCase()) }}
          </span>
          <span v-if="isDefined(card.tags)" class="tags">
            {{ card.tags.join('- ') }}
          </span>
        </div>
        <div
          v-if="showText"
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
        <CardGlare />
      </div>
      <div class="card-back">
        <CardFoil v-if="isFoil" />
        <CardGlare />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card-perspective-wrapper {
  position: relative;
  transform-style: preserve-3d;
  align-self: start;
  transition: filter 0.3s;
}

.card {
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));

  --foil-oil-x: calc(1px * v-bind('pointerStyle?.foilOilX'));
  --foil-oil-y: calc(1px * v-bind('pointerStyle?.foilOilY'));
  /* --pointer-from-center: v-bind('pointerStyle?.pointerFromCenter'); */
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  position: relative;

  --foil-animated-toggle: ;
  .card-perspective-wrapper:hover:has(.foil) &.animated {
    transform: rotateY(calc(1deg * v-bind('angle.y')))
      rotateX(calc(1deg * v-bind('angle.x')));
    --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
    --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
    --foil-animated-toggle: initial;
  }

  > * {
    grid-column: 1;
    grid-row: 1;
  }
  &:has(.foil)::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: url('/assets/ui/card-front.png');
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
    filter: brightness(3) saturate(2) blur(50px);
    opacity: 1;
    mix-blend-mode: screen;
    animation: pulse 5s var(--ease-out-3) infinite;
    --parallax-x: calc(v-bind('angle.y') * -5px);
    --parallax-y: calc(v-bind('angle.x') * 5px);
    translate: var(--parallax-x) var(--parallax-y);
    transition: translate 0.2s;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('/assets/ui/card-front.png');
  background-size: cover;
  color: #fcffcb;
  font-size: calc(var(--pixel-scale) * 8px);
  padding: 1rem;
  position: relative;
  transform-style: preserve-3d;
  --glare-mask: url('/assets/ui/card-front.png');
  --foil-mask: url('/assets/ui/card-front.png');
}

.card.animated:has(.foil) .parallax {
  --parallax-strength: 1;
  --parallax-x: calc(v-bind('angle.y') * var(--parallax-strength) * 1px);
  --parallax-y: calc(v-bind('angle.x') * var(--parallax-strength) * -1px);
  translate: var(--parallax-x) var(--parallax-y);
}

.front-content {
  position: absolute;
  transform-style: preserve-3d;
  inset: 0;
  transform: translateZ(150px);
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back.png');
  background-size: cover;
  --glare-mask: url('/assets/ui/card-back.png');
  --foil-mask: url('/assets/ui/card-back.png');
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

@property --foil-image-shadow-hue {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}
@keyframes foil-image {
  from {
    filter: drop-shadow(0 0 2px hsl(var(--foil-image-shadow-hue), 100%, 70%))
      drop-shadow(0px 0px 0px hsl(var(--foil-image-shadow-hue) 100% 50% / 0.15))
      drop-shadow(
        -0px -0px 0px hsl(var(--foil-image-shadow-hue) 100% 50% / 0.15)
      );
  }
  to {
    --foil-image-shadow-hue: 360;
    filter: drop-shadow(0 0 2px hsl(var(--foil-image-shadow-hue), 100%, 70%))
      drop-shadow(
        15px 15px 5px hsl(var(--foil-image-shadow-hue) 100% 50% / 0.15)
      )
      drop-shadow(
        -15px -15px 5px hsl(var(--foil-image-shadow-hue) 100% 50% / 0.15)
      );
  }
}
.image {
  width: calc(96px * var(--pixel-scale));
  height: calc(96px * var(--pixel-scale));
  position: absolute;
  top: calc(8px * var(--pixel-scale));
  left: 50%;

  --parallax-x: 0px;
  --parallax-y: 0px;
  .card.animated:has(.foil) & {
    --parallax-x: calc(v-bind('angle.y') * 0.5px);
    --parallax-y: calc(v-bind('angle.x') * -0.5px);
  }

  transform: translateX(calc(-50% + var(--parallax-x)))
    translateY(calc(var(--parallax-y)));
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
    mask-image: url('/assets/ui/card-art-mask.png');
    mask-size: cover;

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

  .sigil & {
    background: url('/assets/ui/frame-sigil.png') no-repeat;
    background-size: cover;
    top: 0;
  }

  .artifact & {
    background: url('/assets/ui/frame-artifact.png') no-repeat;
    background-size: cover;
    top: calc(4px * var(--pixel-scale));
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

.name {
  width: calc(81px * var(--pixel-scale));
  text-align: center;
  text-wrap: pretty;
  position: absolute;
  top: calc(88px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(nameFontSize));
  line-height: 1.1;
  font-weight: var(--font-weight-7);
  height: calc(16px * var(--pixel-scale));
  overflow: hidden;
  display: grid;
  place-content: center;
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
  bottom: calc(-3px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
}

.top-left {
  position: absolute;
  top: calc(3px * var(--pixel-scale));
  left: calc(3px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  gap: calc(1.5px * var(--pixel-scale));
  > * {
    z-index: 0;
    background-size: cover;
    background-position: center;
    width: calc(22px * var(--pixel-scale));
    height: calc(20px * var(--pixel-scale));
    display: grid;
    place-content: center;
    font-size: calc(var(--pixel-scale) * 11px);
    position: relative;
    font-weight: var(--font-weight-7);
    &::after {
      content: attr(data-label);
      position: absolute;
      bottom: calc(-3px * var(--pixel-scale));
      width: 100%;
      font-size: calc(var(--pixel-scale) * 6px);
      color: #efef9f;
      text-align: center;
      paint-order: stroke fill;
      font-weight: var(--font-weight-5);
      -webkit-text-stroke: 4px black;
      text-transform: capitalize;
    }
  }
}

.top-right {
  position: absolute;
  top: calc(5px * var(--pixel-scale));
  right: calc(3px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(1.5px * var(--pixel-scale));
}

.speed {
  background-image: var(--bg);
  background-size: cover;
  width: calc(40px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 7px);
  text-align: right;
  padding-right: calc(8px * var(--pixel-scale));

  --dual-text-offset-x: calc(-17px * var(--pixel-scale));
  --dual-text-offset-y: calc(3.5px * var(--pixel-scale));
  + * {
    margin-top: calc(2px * var(--pixel-scale));
  }
}

.spell-school {
  background-image: var(--bg);
  z-index: 0;
  background-size: cover;
  background-position: center;
  width: calc(22px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  display: grid;
  place-content: center;
  font-size: calc(var(--pixel-scale) * 11px);
  position: relative;
  font-weight: var(--font-weight-7);
  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: calc(-3px * var(--pixel-scale));
    width: 100%;
    font-size: calc(var(--pixel-scale) * 6px);
    color: #efef9f;
    text-align: center;
    paint-order: stroke fill;
    font-weight: var(--font-weight-5);
    -webkit-text-stroke: 4px black;
    text-transform: capitalize;
  }
}

.level {
  background-image: url('/assets/ui/card-level.png');
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
  background-image: url('/assets/ui/mana-cost.png');
  font-weight: var(--font-weight-7);
  padding-top: calc(3px * var(--pixel-scale));
  .dual-text::before {
    transform: translateY(-3px); /* *shrug* */
  }
}

.destiny-cost {
  background-image: url('/assets/ui/destiny-cost.png');
  font-weight: var(--font-weight-7);
  padding-top: calc(3px * var(--pixel-scale));
  .dual-text::before {
    transform: translateY(-3px); /* *shrug* */
  }
}

.job {
  background-image: var(--bg);
}

.atk {
  background-image: url('/assets/ui/card-attack.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(86px * var(--pixel-scale));
  left: calc(0px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-right: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 9px);
  --dual-text-offset-y: 2px;
}

.spellpower {
  background-image: url('/assets/ui/card-spellpower.png');
}

.hp {
  background-image: url('/assets/ui/card-hp.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(86px * var(--pixel-scale));
  right: calc(0px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 9px);
  --dual-text-offset-y: 2px;
}

.durability {
  background-image: url('/assets/ui/card-durability.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(86px * var(--pixel-scale));
  right: calc(0px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: calc(var(--pixel-scale) * 9px);
  --dual-text-offset-y: 2px;
}

.countdown {
  background-image: url('/assets/ui/card-countdown.png');
  background-repeat: no-repeat;
  background-size: cover;
  width: calc(24px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  position: absolute;
  top: calc(86px * var(--pixel-scale));
  right: calc(0px * var(--pixel-scale));
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
  padding-top: calc(1px * var(--pixel-scale));
  font-weight: var(--font-weight-7);
  font-size: 18px;
  --dual-text-offset-y: 2px;
}

.kind {
  width: calc(92px * var(--pixel-scale));
  position: absolute;
  top: calc(104px * var(--pixel-scale));
  left: calc(18px * var(--pixel-scale));
  text-transform: capitalize;
  text-align: center;
  font-size: calc(var(--pixel-scale) * 6px);
  color: #d7ad42;
  font-weight: var(--font-weight-5);
  background: url('/assets/ui/card-kind-underline.png');
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: calc(58px * var(--pixel-scale))
    calc(4px * var(--pixel-scale));
  padding-bottom: calc(2px * var(--pixel-scale));
}

.description {
  width: calc(102px * var(--pixel-scale));
  height: calc(54px * var(--pixel-scale));
  position: absolute;
  top: calc(113px * var(--pixel-scale));
  left: calc(13px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 0.5px * v-bind(descriptionFontSize));
  overflow: hidden;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 0 5px black;
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
</style>
