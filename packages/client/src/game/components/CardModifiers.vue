<script setup lang="ts">
import type { CardViewModel } from '@game/engine/src/client/view-models/card.model';
import { gameStateRef } from '../composables/gameStateRef';
import { assets } from '@/assets';
import { useGameClient } from '../composables/useGameClient';
import type { ModifierViewModel } from '@game/engine/src/client/view-models/modifier.model';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { card, position } = defineProps<{
  card: CardViewModel;
  position: 'top' | 'bottom';
}>();

const visibleModifiers = gameStateRef(() => {
  const raw =
    card?.modifiers.filter(modifier => modifier.icon && modifier.stacks > 0) ??
    [];

  const result: Array<{
    key: string;
    playerId: string;
    totalStacks: number;
    icon: string;
    name?: string;
    description?: string;
    sources: ModifierViewModel['source'][];
  }> = [];
  raw.forEach(modifier => {
    let group = result.find(
      g =>
        g.key === modifier.groupKey && g.playerId === modifier.source.player.id
    );
    if (!group) {
      group = {
        key: modifier.groupKey,
        playerId: modifier.source.player.id,
        totalStacks: 0,
        icon: modifier.icon!,
        name: modifier.name,
        description: modifier.description,
        sources: [modifier.source]
      };
      result.push(group);
    }
    group.totalStacks += modifier.stacks;
  });
  return result;
});

const { playerId } = useGameClient();

const emit = defineEmits<{
  modifiersMouseEnter: [];
  modifiersMouseLeave: [];
}>();
</script>

<template>
  <div
    class="modifiers"
    :class="{
      top: position === 'top',
      bottom: position === 'bottom'
    }"
    @mouseenter="emit('modifiersMouseEnter')"
    @mouseleave="emit('modifiersMouseLeave')"
  >
    <UiSimpleTooltip
      v-for="group in visibleModifiers"
      :key="group.key"
      use-portal
      side="left"
    >
      <template #trigger>
        <div
          v-if="assets[`icons/${group.icon}`]"
          :style="{ '--bg': assets[`icons/${group.icon}`].css }"
          :alt="group.name"
          :data-stacks="group.totalStacks > 1 ? group.totalStacks : undefined"
          class="modifier"
        />
        <div v-else>{{ group.icon }}</div>
      </template>

      <div class="modifier-tooltip">
        <div class="modifier-header">
          <div
            class="modifier-icon"
            :style="{ '--bg': assets[`icons/${group.icon}`]?.css }"
          />
          <div class="modifier-name">{{ group.name }}</div>
        </div>
        <div
          class="modifier-description"
          :class="{
            ally: group.playerId === playerId,
            enemy: group.playerId !== playerId
          }"
        >
          {{ group.description }}
        </div>
        <div class="modifier-source">{{ group.name }}</div>
      </div>
    </UiSimpleTooltip>
  </div>
</template>

<style scoped lang="postcss">
.modifiers {
  position: absolute;
  left: var(--size-2);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  --scale-factor: min(2, 2 * var(--pixel-scale));
  gap: calc(var(--size-2) * var(--scale-factor));

  &.top {
    top: calc(var(--size-2) * var(--scale-factor));
  }
  &.bottom {
    bottom: calc(var(--size-6) * var(--scale-factor));
  }
}

.modifier {
  width: calc(var(--pixel-scale) * 2 * 12px);
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  pointer-events: auto;
  position: relative;
  &::after {
    content: attr(data-stacks);
    position: absolute;
    bottom: calc(-5px * var(--pixel-scale));
    right: calc(-5px * var(--pixel-scale));
    font-size: var(--font-size-2);
    color: white;
    paint-order: stroke fill;
    font-weight: var(--font-weight-7);
    -webkit-text-stroke: 2px black;
  }
}

.modifier-tooltip {
  display: flex;
  flex-direction: column;
  max-width: 250px;
  padding-bottom: var(--size-1);
}

.modifier-header {
  display: flex;
  align-items: center;
  gap: var(--size-2);
}

.modifier-icon {
  width: 36px;
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  flex-shrink: 0;
}

.modifier-name {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-7);
  color: var(--gray-0);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modifier-description {
  font-size: var(--font-size-0);
  line-height: 1.4;
  color: var(--gray-2);
  margin-block-end: var(--size-2);
}

.modifier-source {
  font-size: var(--font-size-00);
  color: var(--gray-5);
  padding-top: var(--size-1);
  border-top: 1px solid var(--gray-7);
  font-style: italic;
}
</style>
