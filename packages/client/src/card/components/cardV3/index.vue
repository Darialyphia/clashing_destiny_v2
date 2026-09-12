<script setup lang="ts">
import {
  type CardKind,
  type Rarity,
  type Affinity,
  type CardSpeed,
  CARD_KINDS,
  RARITIES
} from '@game/engine/src/card/card.enums';
import { isDefined, type Nullable } from '@game/shared';
import CardGlare from '../CardGlare.vue';
import { useCardTilt } from '../../composables/useCardtilt';
import FoilSheen from '../foil/FoilSheen.vue';
import FoilOil from '../foil/FoilOil.vue';
import FoilGradient from '../foil/FoilGradient.vue';
import FoilScanlines from '../foil/FoilScanlines.vue';
import FoilLightGradient from '../foil/FoilLightGradient.vue';
import FoilGoldenGlare from '../foil/FoilGoldenGlare.vue';
import FoilGlitter from '../foil/FoilGlitter.vue';
import type { CardArt } from '@game/engine/src/card/card-blueprint';
import FoilBrightShine from '../foil/FoilBrightShine.vue';
import ManaCost from './ManaCost.vue';
import Stats from './Stats.vue';
import AffinityFlags from './AffinityFlags.vue';
import CardName from './CardName.vue';
import Description from './Description.vue';
import CardArtComponent from './CardArt.vue';
import CardRarity from './Rarity.vue';
import { assets, type SpriteData } from '@/assets';
import FoilAuroraBorder from '../foil/FoilAuroraBorder.vue';
import FoilCRT from '../foil/FoilCRT.vue';
import FoilRain from '../foil/FoilRain.vue';
import FoilStarfield from '../foil/FoilStarfield.vue';
import FoilEmboss from '../foil/FoilEmboss.vue';
import { match } from 'ts-pattern';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/game.enums.js';

const {
  card,
  sprite,
  isFoil,
  isAnimated = true,
  maxTiltAngle = 30,
  isTiltEnabled = true,
  animationSequence
} = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    art: CardArt;
    kind: CardKind;
    manaCost?: number | null;
    manaSupply?: number | null;
    baseManaCost?: number | null;
    rarity: Rarity;
    atk?: number | null;
    hp?: number | null;
    might?: number | null;
    focus?: number | null;
    wisdom?: number | null;
    durability?: number | null;
    abilities?: string[];
    subKind?: string | null;
    tags?: string[];
    affinities: Affinity[];
    speed?: CardSpeed;
    commandment?: number | null;
  };
  sprite: Nullable<SpriteData>;
  isFoil?: boolean;
  isAnimated?: boolean;
  maxTiltAngle?: number;
  isTiltEnabled?: boolean;
  animationSequence?: string[];
}>();

const root = useTemplateRef('card');

const { pointerStyle, angle, onMousemove, onMouseleave, onMouseEnter } =
  useCardTilt(root, {
    maxAngle: maxTiltAngle,
    isEnabled: computed(() => isTiltEnabled && isFoil)
  });

const frontBg = computed(() => {
  if (card.rarity === RARITIES.LEGENDARY) {
    return isFoil
      ? assets[`ui/card/v3/card-front-legendary-foil`].css
      : assets[`ui/card/v3/card-front-legendary`].css;
  }
  return isFoil
    ? assets[`ui/card/v3/card-front-foil`].css
    : assets[`ui/card/v3/card-front`].css;
});
const tint = computed(() => {
  return `linear-gradient(to right in oklch, ${card.affinities
    .map(affinity => {
      return `var(--tint-${affinity.toLocaleLowerCase()})`;
    })
    .join(', ')})`;
});

const kindBg = computed(() => {
  return assets[`ui/card/kind-${card.kind.toLowerCase()}`].css;
});

const spriteImage = computed(() => {
  return (assets[card.art.sprite] ?? assets[card.art.main]).css;
});

const isHovered = ref(false);
const handleMousemove = (e: MouseEvent) => {
  isHovered.value = true;
  onMousemove(e);
};
const handleMouseleave = () => {
  isHovered.value = false;
  onMouseleave();
};

const _animationSequence = computed(() => {
  if (!isAnimated) return undefined;
  if (animationSequence) return animationSequence;

  return match(card.kind)
    .with(CARD_KINDS.MINION, () =>
      isHovered.value
        ? [ANIMATIONS_NAMES.ATTACK, ANIMATIONS_NAMES.IDLE]
        : [ANIMATIONS_NAMES.BREATHING]
    )
    .with(CARD_KINDS.SPELL, CARD_KINDS.ARTIFACT, CARD_KINDS.SECRET, () =>
      isHovered.value ? [ANIMATIONS_NAMES.ACTIVE] : [ANIMATIONS_NAMES.DEFAULT]
    )
    .with(CARD_KINDS.DESTINY, CARD_KINDS.RUNE, () => [ANIMATIONS_NAMES.DEFAULT])
    .exhaustive();
});
</script>

<template>
  <div
    class="card-perspective-wrapper card-v3"
    @mousemove="handleMousemove"
    @mouseenter="onMouseEnter"
    @mouseleave="handleMouseleave"
  >
    <div
      ref="card"
      class="card"
      :class="[
        card.kind.toLocaleLowerCase(),
        isAnimated && 'animated',
        card.art.isFullArt && 'full-art'
      ]"
      :data-flip-id="`card_${card.id}`"
    >
      <div class="card-front" :style="{ '--tint': tint }">
        <CardArtComponent
          v-if="sprite"
          :art="card.art"
          :sprite="sprite"
          :kind="card.kind"
          :animation-sequence="_animationSequence"
        />
        <template v-if="isFoil">
          <FoilRain v-if="card.art.foil.rain" />
          <FoilStarfield v-if="card.art.foil.starField" />
          <FoilSheen v-if="card.art.foil.sheen" />
          <FoilOil v-if="card.art.foil.oil" />
          <FoilGradient v-if="card.art.foil.gradient" />
          <FoilLightGradient v-if="card.art.foil.lightGradient" />
          <FoilGoldenGlare v-if="card.art.foil.goldenGlare" />
          <FoilGlitter v-if="card.art.foil.glitter" />
          <FoilEmboss v-if="card.art.foil.emboss" />
          <FoilBrightShine v-if="card.art.foil.brightShine" />
          <FoilScanlines v-if="card.art.foil.scanlines" />
          <FoilAuroraBorder v-if="card.art.foil.auroraBorder" />
          <FoilCRT v-if="card.art.foil.crt" />
        </template>

        <ManaCost
          v-if="isDefined(card.manaCost)"
          :cost="card.manaCost"
          :baseCost="card.baseManaCost ?? card.manaCost"
          :mana-supply="card.manaSupply"
        />
        <CardRarity :rarity="card.rarity" />

        <AffinityFlags :affinities="card.affinities" />
        <CardName :name="card.name" />

        <div class="kind parallax" />
        <!-- <div class="tags parallax">
          {{ uppercaseFirstLetter(card.kind.toLocaleLowerCase()) }}

          <div>
            <span v-if="isDefined(card.subKind)">
              - {{ uppercaseFirstLetter(card.subKind.toLocaleLowerCase()) }}
            </span>
            <span v-if="isDefined(card.tags)" class="tags">
              <template v-if="card.tags?.length">|</template>
              {{ card.tags.join('| ') }}
            </span>
          </div>
        </div> -->
        <Description
          :description="card.description"
          :abilities="card.abilities ?? []"
        />
        <Stats
          :atk="card.atk ?? null"
          :hp="card.hp ?? null"
          :durability="card.durability ?? null"
          :commandment="card.commandment ?? null"
          :might="card.might ?? null"
          :focus="card.focus ?? null"
          :wisdom="card.wisdom ?? null"
        />
        <!--<Speed
          v-if="isDefined(card.speed) && card.kind !== CARD_KINDS.DESTINY"
          :speed="card.speed"
        /> -->
        <CardGlare />
      </div>
      <div class="card-back">
        <CardGlare />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@property --foil-x {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}
@property --foil-y {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}

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
  /* --pointer-from-center: calc(1% * v-bind('pointerStyle?.pointerFromCenter')); */
  width: calc(var(--card-v3-width) * var(--pixel-scale));
  height: calc(var(--card-v3-height) * var(--pixel-scale));
  display: grid;
  font-family: 'Lato', sans-serif;
  transform-style: preserve-3d;
  position: relative;

  --foil-animated-toggle: ;
  .card-perspective-wrapper:hover:has(.foil) &.animated {
    --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
    --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
    --foil-animated-toggle: initial;

    transform: rotateY(calc(1deg * v-bind('angle.y')))
      rotateX(calc(1deg * v-bind('angle.x')));
  }

  .card-perspective-wrapper:not(:hover):has(.foil) &.animated {
    transition: transform 0.5s;
  }

  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background: v-bind(frontBg);
  background-size: cover;
  color: #fcfcfc;
  font-size: calc(var(--pixel-scale) * 8px);
  padding: 1rem;
  position: relative;
  transform-style: preserve-3d;
  position: relative;
  &.full-art {
    text-shadow: 0 0 10px black;
    background: none;
  }

  --glare-mask: url('@/assets/ui/card/masks/card-v3.png');
  --foil-mask: url('@/assets/ui/card/masks/card-v3.png');
  --art-mask: v-bind(spriteImage);
  --art-mask-size: cover;
  --art-mask-position: center;
  --art-mask-position: calc(2px * var(--pixel-scale))
    calc(2px * var(--pixel-scale));

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    /* background: var(--tint); */
    mix-blend-mode: color-dodge;
    opacity: 0.2;
    mask-size: cover;
    z-index: -1;
    pointer-events: none;
  }
}

.card.animated:has(.foil):deep(.parallax) {
  --parallax-strength: 0.7;
  --_parallax-strength-x: calc(
    var(--parallax-strength-x, var(--parallax-strength)) * var(--pixel-scale) /
      2
  );
  --_parallax-strength-y: calc(
    var(--parallax-strength-y, var(--parallax-strength)) * var(--pixel-scale) /
      2
  );
  --parallax-x: calc(v-bind('angle.y') * var(--_parallax-strength-x) * 1px);
  --parallax-y: calc(v-bind('angle.x') * var(--_parallax-strength-y) * -1px);
  --_parallax-offset-x: var(--parallax-offset-x, 0px);
  --_parallax-offset-y: var(--parallax-offset-y, 0px);
  translate: calc(var(--_parallax-offset-x) + var(--parallax-x))
    calc(var(--parallax-y) + var(--_parallax-offset-y));
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('@/assets/ui/card/v3/card-back.png');
  background-size: cover;
  --glare-mask: url('@/assets/ui/card/v3/card-back.png');
  --foil-mask: url('@/assets/ui/card/v3/card-back.png');
}

@property --foil-image-shadow-hue {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.text-separator {
  margin-top: calc(3px * var(--pixel-scale));
  display: flex;
  gap: var(--size-2);
  align-items: center;
  color: black;
  font-size: calc(var(--pixel-scale) * 4.5px);
  text-transform: uppercase;
  font-weight: var(--font-weight-7);
  font-family: 'Lato', sans-serif;
  opacity: 0.5;
  &::before,
  &::after {
    content: '';
    display: block;
    width: 100%;
    height: calc(0.5px * var(--pixel-scale));
    background: black;
    flex: 1;
    opacity: 0.5;
  }
}

.kind {
  position: absolute;
  bottom: 0;
  right: 0;
  width: calc(16px * var(--pixel-scale));
  aspect-ratio: 1;
  background: v-bind(kindBg);
  background-size: cover;
}

.tags {
  position: absolute;
  width: fit-content;
  display: flex;
  gap: calc(2px * var(--pixel-scale));
  font-size: calc(var(--pixel-scale) * 11px);
  top: calc(194px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  color: #e9d8c0;
  text-shadow: 0 0 0.75rem black;
  -webkit-text-stroke: 2px black;
  paint-order: stroke fill;
}
</style>
