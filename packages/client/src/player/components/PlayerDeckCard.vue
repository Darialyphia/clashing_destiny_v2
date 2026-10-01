<script setup lang="ts">
import {
  AFFINITIES,
  CARD_KINDS,
  type Affinity
} from '@game/engine/src/card/card.enums';
import { useResponsive } from '@/shared/composables/useResponsive';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger
} from 'reka-ui';
import FancyButton from '@/ui/components/FancyButton.vue';
import type { DeckValidationResult } from '@game/engine/src/card/validators/deck.validator';
import { assets, sprites } from '@/assets';
import { useSprite } from '@/shared/composables/useSprite';
import { match } from 'ts-pattern';
import {
  ANIMATIONS_NAMES,
  type AnimationName
} from '@game/engine/src/game/game.enums';

export type DisplayedDeck = {
  name: string;
  cards: { blueprintId: string; copies: number }[];
  isValid: DeckValidationResult;
};
const { deck } = defineProps<{
  deck: DisplayedDeck;
}>();

const mainDeck = computed(() =>
  deck.cards.map(card => ({
    ...card,
    blueprint: CARDS_DICTIONARY[card.blueprintId]
  }))
);
const minions = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.MINION)
);

const spells = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.SPELL)
);

const artifacts = computed(() =>
  mainDeck.value.filter(item => item.blueprint.kind === CARD_KINDS.ARTIFACT)
);

const violations = computed(() =>
  deck.isValid.result === 'failure' ? deck.isValid.violations : []
);

const affinities = computed(() => {
  const result: Affinity[] = [];
  for (const aff of Object.values(AFFINITIES)) {
    if (aff === AFFINITIES.NEUTRAL) continue;
    const max = Math.max(
      ...mainDeck.value.map(
        item => item.blueprint.affinities.filter(a => a === aff).length
      )
    );

    result.push(...Array.from({ length: max }, () => aff));
  }

  return result;
});

const { isSmallViewport } = useResponsive();

const mostExpensiveCard = computed(() =>
  mainDeck.value.reduce((acc, current) => {
    if (current.blueprint.kind === CARD_KINDS.DESTINY) return acc;
    if (current.blueprint.kind === CARD_KINDS.RUNE) return acc;
    if (acc.blueprint.kind === CARD_KINDS.DESTINY) return current;
    if (acc.blueprint.kind === CARD_KINDS.RUNE) return current;
    if (current.blueprint.manaCost > acc.blueprint.manaCost) return current;
    return acc;
  }, mainDeck.value[0])
);

const sprite = computed(() => sprites[mostExpensiveCard.value.blueprint.id]);

const animationSequence = computed(() =>
  match(mostExpensiveCard.value.blueprint.kind)
    .with(CARD_KINDS.MINION, () => [ANIMATIONS_NAMES.IDLE])
    .otherwise(() => [ANIMATIONS_NAMES.DEFAULT])
);
const { activeFrameRect, bgPosition, imageBg, on } = useSprite({
  animationSequence,
  sprite,
  kind: computed(() => mostExpensiveCard.value.blueprint.kind),
  scale: 2,
  repeat: true,
  scalePositionByPixelScale: true
});
</script>

<template>
  <div>
    <HoverCardRoot :open-delay="200" :close-delay="0">
      <button
        class="player-deck surface"
        :class="{
          invalid: deck.isValid.result === 'failure'
        }"
      >
        <div
          class="art"
          :class="[mostExpensiveCard.blueprint.kind.toLocaleLowerCase()]"
          :style="{
            '--bg-position': bgPosition,
            '--width': `${activeFrameRect.width}px`,
            '--height': `${activeFrameRect.height}px`,
            '--background-width': `calc(${sprite.sheetSize.w}px * var(--pixel-scale))`,
            '--background-height': `calc(${sprite.sheetSize.h}px * var(--pixel-scale))`
          }"
        >
          <!-- <div
      v-if="artBgImage"
      class="art-bg parallax"
      style="--parallax-strength: -1"
    /> -->
          <div
            class="sprite-shadow parallax"
            style="--parallax-strength-x: -3; --parallax-strength-y: -1"
          />
          <div
            class="sprite parallax"
            style="--parallax-strength-x: 1.5; --parallax-strength-y: 1"
          />
        </div>
        <div class="deck-name">
          {{ deck.name }}
        </div>
      </button>

      <HoverCardPortal>
        <HoverCardContent side="right" align="center" :side-offset="8">
          <div class="deck-details">
            <ul>
              <li v-for="(violation, index) in violations" :key="index">
                <span class="invalid-label">{{ violation.reason }}</span>
              </li>
            </ul>
            <ul>
              <li v-for="item in minions" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
              <li v-for="item in spells" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
              <li v-for="item in artifacts" :key="item.blueprint.id">
                {{ item.copies }}x
                <span :class="item.blueprint.rarity.toLocaleLowerCase()">
                  {{ item.blueprint.name }}
                </span>
              </li>
            </ul>
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </div>
</template>

<style scoped lang="postcss">
.player-deck {
  position: relative;
  display: flex;
  width: 100%;
  gap: var(--size-2);
  align-items: center;
  background-image:
    linear-gradient(to right, hsl(0deg 0% 20% / 0.5), hsl(0deg 0% 0% / 0.5)),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    right calc(100% + 70px);
  background-size: 200%, calc(2px * 96);
  padding: var(--size-2) var(--size-4);
  /* border: solid 1px hsl(var(--color-primary-hsl) / 0.5); */
  &.invalid {
    border-color: var(--red-8);
    background-image:
      linear-gradient(to right, hsl(0deg 0% 20% / 0.5), hsl(0deg 0% 0% / 0.5)),
      var(--bg),
      repeating-linear-gradient(
        45deg,
        hsl(var(--red-8-hsl) / 0.35) 0px,
        hsl(var(--red-8-hsl) / 0.35) 10px,
        hsl(var(--red-9-hsl) / 0.35) 10px,
        hsl(var(--red-9-hsl) / 0.35) 20px
      );
  }
}

.deck-name {
  flex: 1 1 0%;
  text-align: left;
  align-self: stretch;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-7);
  text-shadow: 0 0 1rem 1rem black;
  -webkit-text-stroke: 3px black;
  paint-order: stroke fill;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  @screen lt-lg {
    font-size: var(--font-size-1);
  }
}

.deck-details {
  padding: var(--size-4);
  --un-bg-opacity: 1;
  background-color: hsl(var(--gray-10-hsl) / var(--un-bg-opacity));
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  color: white;
}

.rare {
  color: var(--blue-4);
}

.epic {
  color: var(--purple-4);
}

.legendary {
  color: var(--orange-4);
}

.invalid-label {
  color: var(--red-6);
  font-weight: var(--font-weight-7);
}

.affinity {
  width: 26px;
  aspect-ratio: 1 / 1;
  @screen lt-lg {
    width: 13px;
  }
}

.card-art {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100px * var(--pixel-scale));
  overflow: hidden;
  pointer-events: none;

  &.spell,
  &.rune,
  &.secret,
  &.artifact {
    translate: 0 calc(var(--pixel-scale) * -15px);
  }

  &.destiny {
    translate: 0 calc(var(--pixel-scale) * 3px);
  }

  &.full-art {
    width: calc(var(--card-v2-width) * var(--pixel-scale));
    height: calc(var(--card-v2-height) * var(--pixel-scale));
    left: 0;
    top: 0;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('@/assets/ui/card/v2/full-art-overlay.png');
      background-size: cover;
      pointer-events: none;
    }
  }
}

.sprite {
  position: absolute;
  inset: 0;
  background: v-bind(imageBg);
  background-position: var(--bg-position);
  background-repeat: no-repeat;
  background-size: var(--background-width) var(--background-height);
  translate: calc(var(--parallax-x, 0)) var(--parallax-y, 0) !important;
  pointer-events: none;
}
</style>
