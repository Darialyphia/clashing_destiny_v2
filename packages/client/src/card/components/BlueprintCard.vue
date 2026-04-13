<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { formatAbilityText } from '@/utils/formatters';
import Card from './Card.vue';
import { isFunction } from '@game/shared';

const {
  blueprint,
  foilOverrides = {},
  isTiltEnabled = true
} = defineProps<{
  blueprint: CardBlueprint;
  foilOverrides?: Partial<CardBlueprint['art'][string]['foil']>;
  isTiltEnabled?: boolean;
}>();

const mergedFoilOptions = computed(() => ({
  ...blueprint.art.default.foil,
  ...foilOverrides
}));
</script>

<template>
  <Card
    :card="{
      id: blueprint.id,
      name: blueprint.name,
      description: isFunction(blueprint.description)
        ? blueprint.description()
        : blueprint.description,
      art: {
        foil: mergedFoilOptions,
        bg: `cards/${blueprint.art.default.bg}`,
        main: `cards/${blueprint.art.default.main}`,
        isFullArt: blueprint.art.default.isFullArt
      },
      kind: blueprint.kind,
      manaCost: (blueprint as any).manaCost,
      destinyCost: (blueprint as any).destinyCost,
      rarity: (blueprint as any).rarity,
      atk:
        (blueprint as any).atk ??
        (blueprint as any).damage ??
        (blueprint as any).atkBonus,
      hp: (blueprint as any).maxHp,
      countdown: (blueprint as any).maxCountdown,
      durability: (blueprint as any).durability,
      abilities: (blueprint as any).abilities?.map(formatAbilityText),
      subKind: (blueprint as any).subKind,
      jobs: blueprint.jobs
    }"
    :is-tilt-enabled="isTiltEnabled"
  />
</template>

<style scoped lang="postcss"></style>
