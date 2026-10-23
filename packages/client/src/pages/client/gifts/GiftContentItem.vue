<script setup lang="ts">
import { assets, sprites } from '@/assets';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import GoldIcon from '@/player/components/GodlIcon.vue';
import CraftingShardIcon from '@/player/components/CraftingShardIcon.vue';
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import type { GiftItem } from './useGiftsPage';
import { useSprite } from '@/shared/composables/useSprite';
import { match } from 'ts-pattern';
import { ANIMATIONS_NAMES } from '@game/engine/src/game/game.enums';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';

const { item } = defineProps<{ item: GiftItem }>();

const cardArt = computed(() =>
  item.kind === 'card' && item.blueprint
    ? assets[`cards/${item.blueprint.art.default.sprite}`]?.path
    : undefined
);

const sprite = computed(() =>
  item.kind === 'card' && item.blueprint
    ? sprites[`cards/${item.blueprint.art.default.sprite}`]
    : null
);

const animationSequence = computed(() => {
  if (item.kind !== 'card' || !item.blueprint) return [];

  return match(item.blueprint.kind)
    .with(CARD_KINDS.MINION, () => [ANIMATIONS_NAMES.BREATHING])
    .with(
      CARD_KINDS.SPELL,
      CARD_KINDS.ARTIFACT,
      CARD_KINDS.DESTINY,
      CARD_KINDS.RUNE,
      CARD_KINDS.SECRET,
      () => [ANIMATIONS_NAMES.DEFAULT]
    )
    .exhaustive();
});

const kind = computed(() => {
  if (item.kind !== 'card' || !item.blueprint) return CARD_KINDS.ARTIFACT;
  return item.blueprint.kind;
});

const { bgPosition, activeFrameRect, imageBg } = useSprite({
  animationSequence,
  sprite,
  kind,
  scale: 1,
  scalePositionByPixelScale: true,
  animated: false
});
</script>

<template>
  <div class="gift-content-item">
    <HoverCardRoot
      :open-delay="0"
      :close-delay="0"
      :disabled="item.kind !== 'card' || !item.blueprint"
    >
      <HoverCardTrigger as-child>
        <div class="tile surface-transparent">
          <GoldIcon v-if="item.kind === 'gold'" />
          <CraftingShardIcon v-else-if="item.kind === 'dust'" />
          <div
            v-else-if="item.kind === 'card' && cardArt"
            class="card-art"
            :class="[kind.toLocaleLowerCase()]"
            :style="{
              '--bg-position': bgPosition,
              '--width': `${activeFrameRect.width}px`,
              '--height': `${activeFrameRect.height}px`,
              '--sprite-scale': 1,
              '--background-width': `calc(${sprite?.sheetSize.w ?? 0}px * var(--sprite-scale) * var(--pixel-scale))`,
              '--background-height': `calc(${sprite?.sheetSize.h ?? 0}px * var(--sprite-scale) * var(--pixel-scale))`
            }"
          >
            <div class="sprite" />
          </div>
          <!-- Missing asset: booster pack / deck icon -->
          <div v-else class="asset-placeholder" />
          <span class="amount-badge">x{{ item.amount }}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent
          v-if="item.kind === 'card' && item.blueprint"
          side="right"
        >
          <BlueprintCard :blueprint="item.blueprint" />
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
    <div class="label">{{ item.label }}</div>
  </div>
</template>

<style scoped lang="postcss">
.gift-content-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 6.5rem;
  text-align: center;
  font-size: var(--font-size-00);
  line-height: 1.2;
  color: var(--text-2);
}

.tile {
  position: relative;
  display: grid;
  place-items: center;
  width: 7rem;
  aspect-ratio: 1;
  overflow: hidden;
  margin-bottom: var(--size-1);
  background: hsl(0 0% 0% / 0.35);
  border-radius: var(--radius-2);
}

.asset-placeholder {
  width: 80%;
  height: 80%;
  background-size: cover;
  background-position: center;
}

.asset-placeholder {
  background: linear-gradient(135deg, #7c4dff, #ff5ca8);
  border-radius: var(--radius-1);
}

.amount-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 var(--size-1);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-7);
  color: #f8eabb;
  background: #0c0a14;
  border: 1px solid #c79a3b;
  border-radius: var(--radius-1);
}

.label {
  color: #ddd5e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 6rem;
}

.card-art {
  position: absolute;
  width: calc(var(--pixel-scale) * var(--width));
  height: calc(var(--pixel-scale) * var(--height));
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(10px * var(--pixel-scale));
  pointer-events: none;
  transform-style: preserve-3d;

  &.artifact {
    transform: translateX(-50%) translateY(calc(5px));
  }

  &.spell,
  &.rune,
  &.secret {
    transform: translateX(-50%) translateY(calc(5px));
  }

  &.destiny {
    transform: translateX(-50%) translateY(calc(50px));
  }

  &.minion {
    transform: translateX(-50%) translateY(calc(35px));
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
