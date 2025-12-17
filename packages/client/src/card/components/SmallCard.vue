<script setup lang="ts">
import { isDefined } from '@game/shared';
import { type CardKind, type CardTint } from '@game/engine/src/card/card.enums';
import CardGlare from './CardGlare.vue';
import { useCardTilt } from '../composables/useCardtilt';
import FoilScanlines from './foil/FoilScanlines.vue';
import FoilSheen from './foil/FoilSheen.vue';
import FoilOil from './foil/FoilOil.vue';
import FoilGradient from './foil/FoilGradient.vue';
import FoilLightGradient from './foil/FoilLightGradient.vue';

const {
  card,
  isFoil,
  showStats = false
} = defineProps<{
  card: {
    id: string;
    art: {
      foil: {
        sheen?: boolean;
        oil?: boolean;
        gradient?: boolean;
        lightGradient?: boolean;
        scanlines?: boolean;
      };
      dimensions: {
        width: number;
        height: number;
      };
      bg: string;
      main: string;
      breakout?: string;
      frame: string;
      tint: CardTint;
    };
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

const root = useTemplateRef('card');
const { pointerStyle } = useCardTilt(root, {
  maxAngle: 10
});

const artFrameImage = computed(() => {
  return `url('${card.art.frame}')`;
});

const artBgImage = computed(() => {
  return `url('${card.art.bg}')`;
});

const artMainImage = computed(() => {
  return `url('${card.art.main}')`;
});

const artBreakoutImage = computed(() => {
  return card.art.breakout ? `url('${card.art.breakout}')` : 'none';
});
watchEffect(() => {
  console.log(pointerStyle.value.glareX);
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
      <div class="image">
        <div class="art-bg" />
        <FoilScanlines v-if="isFoil && card.art.foil.scanlines" />
        <div class="art-main" />
        <div class="art-frame" />
        <div v-if="isFoil" class="art-breakout" />
      </div>

      <template v-if="showStats">
        <div
          v-if="isDefined(card.atk)"
          class="stat atk"
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
          v-if="isDefined(card.hp)"
          class="stat hp"
          :class="{
            buffed: isDefined(card.baseMaxHp) && card.hp > card.baseMaxHp,
            debuffed: isDefined(card.maxHp) && card.hp < card.maxHp
          }"
        >
          <div class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>

        <div
          v-if="isDefined(card.durability) && showStats"
          class="stat durability"
        >
          <div class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>
        <div
          v-if="isDefined(card.countdown) && showStats"
          class="stat countdown"
        >
          <div class="dual-text" :data-text="card.countdown">
            {{ card.countdown }}
          </div>
        </div>
      </template>
      <template v-if="isFoil">
        <FoilSheen v-if="card.art.foil.sheen" />
        <FoilOil v-if="card.art.foil.oil" />
        <FoilGradient v-if="card.art.foil.gradient" />
        <FoilLightGradient v-if="card.art.foil.lightGradient" />
      </template>
      <CardGlare />
    </div>
    <div class="card-back">
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
  &:hover {
    --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
    --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
    --foil-animated-toggle: initial;
  }
  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background-size: cover;
  color: #fcffcb;
  font-size: 16px;
  position: relative;
  transform-style: preserve-3d;
  --bg-size: calc(
      1px * v-bind('card.art.dimensions.width') * var(--pixel-scale)
    )
    calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  --frame-size: calc(var(--card-art-frame-width) * var(--pixel-scale))
    calc(var(--card-art-frame-height) * var(--pixel-scale));
  --stat-size: calc(39px * var(--pixel-scale)) calc(39px * var(--pixel-scale));
  --stat-left-position: left 0px bottom calc(4px * var(--pixel-scale));
  --stat-right-position: right 0px bottom calc(4px * var(--pixel-scale));

  --glare-mask: var(--mask);
  --glare-mask-size: var(--mask-size);
  --glare-mask-position: var(--mask-position);
  --foil-mask: var(--mask);
  --foil-mask-size: var(--mask-size);
  --foil-mask-position: var(--mask-position);
  .small-card:is(.minion, .hero) & {
    --mask:
      v-bind(artBgImage), v-bind(artFrameImage),
      url('/assets/ui/card/attack-large.png'),
      url('/assets/ui/card/health-large.png');
    --mask-size:
      var(--bg-size), var(--frame-size), var(--stat-size), var(--stat-size);
    --mask-position:
      center, center, var(--stat-left-position), var(--stat-right-position);
  }

  .small-card:is(.minion, .hero) & {
    --mask:
      v-bind(artBgImage), v-bind(artFrameImage),
      url('/assets/ui/card/attack-large.png'),
      url('/assets/ui/card/durability-large.png');
    --mask-size:
      var(--bg-size), var(--frame-size), var(--stat-size), var(--stat-size);
    --mask-position:
      center, center, var(--stat-left-position), var(--stat-right-position);
    &:has(.foil) {
      --mask:
        v-bind(artBgImage), v-bind(artFrameImage), v-bind(artBreakoutImage),
        url('/assets/ui/card/attack-large.png'),
        url('/assets/ui/card/durability-large.png');
      --mask-size:
        var(--bg-size), var(--frame-size), var(--frame-size), var(--stat-size),
        var(--stat-size);
      --mask-position:
        center, center, center, var(--stat-left-position),
        var(--stat-right-position);
    }
  }

  .small-card.spell & {
    --mask: v-bind(artBgImage), v-bind(artFrameImage);
    --mask-size: var(--bg-size), var(--frame-size);
    --mask-position: center, center;
    &:has(.foil) {
      --mask:
        v-bind(artBgImage), v-bind(artFrameImage), v-bind(artBreakoutImage);
      --mask-size: var(--bg-size), var(--frame-size), var(--frame-size);
      --mask-position: center, center, center;
    }
  }

  .small-card.sigil & {
    --mask:
      v-bind(artBgImage), v-bind(artFrameImage),
      url('/assets/ui/card/countdown-large.png');
    --mask-size: var(--bg-size), var(--frame-size), var(--stat-size);
    --mask-position: center, center, var(--stat-right-position);
    &:has(.foil) {
      --mask:
        v-bind(artBgImage), v-bind(artFrameImage), v-bind(artBreakoutImage),
        url('/assets/ui/card/countdown-large.png');
      --mask-size:
        var(--bg-size), var(--frame-size), var(--frame-size), var(--stat-size);
      --mask-position: center, center, center, var(--stat-right-position);
    }
  }
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
  display: grid;
  transform-origin: center center;
  width: calc(var(--card-art-frame-width) * var(--pixel-scale));
  height: calc(var(--card-art-frame-height) * var(--pixel-scale));
  left: 50%;
  top: 50%;
  translate: -50% -50%;

  .foil {
    --foil-mask: v-bind(artBgImage);
    position: absolute;
    bottom: 0;
    left: 50%;
    width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
    height: calc(
      1px * v-bind('card.art.dimensions.height') * var(--pixel-scale)
    );
    translate: -50% 0;
    --parallax-offset-x: -50%;
  }
}

.art-frame {
  position: absolute;
  inset: 0;
  background: v-bind(artFrameImage);
  background-size: cover;
}
.art-main {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artMainImage);
  background-size: cover;
}
.art-breakout {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artBreakoutImage);
  background-size: cover;
}
.art-bg {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: calc(1px * v-bind('card.art.dimensions.width') * var(--pixel-scale));
  height: calc(1px * v-bind('card.art.dimensions.height') * var(--pixel-scale));
  translate: -50% 0;
  background: v-bind(artBgImage);
  background-size: cover;
}

.stat {
  width: calc(39px * var(--pixel-scale));
  height: calc(39px * var(--pixel-scale));
  position: absolute;
  background-repeat: no-repeat;
  background-size: cover;
  bottom: calc(4px * var(--pixel-scale));
  display: grid;
  place-content: center;
  font-weight: var(--font-weight-7);
  font-size: calc(22px * var(--pixel-scale));
  padding-top: calc(7px * var(--pixel-scale));
  font-family:
    Cinzel Decorative,
    serif;
  --dual-text-offset-y: 1px;

  &.buffed {
    --top-color: var(--green-2);
    --bottom-color: var(--green-6);
  }
  &.debuffed {
    --top-color: var(--red-5);
    --bottom-color: var(--red-9);
  }
}

.atk {
  background-image: url('/assets/ui/card/attack-large.png');
  left: 0;
}

.hp {
  background-image: url('/assets/ui/card/health-large.png');
  right: 0;
}

.durability {
  background-image: url('/assets/ui/card/durability.png');
  right: 0;
}

.countdown {
  background-image: url('/assets/ui/card/countdown.png');
  right: 0;
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
  --_top-color: var(--top-color, #dedede);
  --_bottom-color: var(--bottom-color, #b8aeab);
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
