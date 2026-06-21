<script setup lang="ts">
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import { assets } from '@/assets';
import type { ModifierViewModel } from '@game/engine/src/client/view-models/modifier.model';
import { useGameClient } from '../composables/useGameClient';
import { uniqBy } from 'lodash-es';
import { isDefined } from '@game/shared';

const { modifiers } = defineProps<{
  modifiers: ModifierViewModel[];
}>();

const { playerId } = useGameClient();

const displayedModifiers = computed(() => {
  return uniqBy(
    modifiers.filter(mod => {
      console.log(mod.icon);
      return isDefined(mod.icon) && mod.stacks > 0 && mod.isEnabled;
    }),
    'modifierType'
  );
});
</script>

<template>
  <div class="modifiers">
    <UiSimpleTooltip
      v-for="modifier in displayedModifiers"
      :key="modifier.id"
      use-portal
      side="right"
      :side-offset="12"
    >
      <template #trigger>
        <div
          :style="{
            '--bg': assets[modifier.icon!]?.css,
            '--pixel-scale': 0.5
          }"
          :alt="modifier.name"
          :data-stacks="modifier.stacks > 1 ? modifier.stacks : undefined"
          class="modifier-image"
        />
      </template>

      <div class="modifier-tooltip">
        <div class="modifier-header">
          <div
            class="modifier-icon"
            :style="{ '--bg': assets[modifier.icon!]?.css }"
          />
          <div class="modifier-name">{{ modifier.name }}</div>
        </div>
        <div
          class="modifier-description"
          :class="{
            ally: modifier.source.player.id === playerId,
            enemy: modifier.source.player.id !== playerId
          }"
        >
          {{ modifier.description }}
        </div>
        <div class="modifier-source">from: {{ modifier.source.name }}</div>
      </div>
    </UiSimpleTooltip>
  </div>
</template>

<style scoped lang="postcss">
.modifiers {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  direction: rtl;
}

.modifier-image {
  width: 24px;
  aspect-ratio: 1;
  background: var(--bg) no-repeat center center;
  background-size: cover;
  pointer-events: auto;
  margin-block-start: var(--size-1);
  position: relative;
  transform: translateZ(10px);
  &::after {
    content: attr(data-stacks);
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: var(--font-size-1);
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
