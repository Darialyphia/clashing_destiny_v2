<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { formatAbilityText } from '@/utils/formatters';
import Card from './cardV2/index.vue';
import { isFunction } from '@game/shared';
import { type JobId } from '@game/engine/src/card/card.enums';
import { provideRichTextContext } from '@/game/composables/useRichText';

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

provideRichTextContext({
  card: ref(null)
});
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
      runeCost: (blueprint as any).runeCost,
      rarity: (blueprint as any).rarity,
      atk: (blueprint as any).atk,
      hp: (blueprint as any).maxHp,
      durability: (blueprint as any).durability,
      abilities: (blueprint as any).abilities?.map(formatAbilityText),
      subKind: (blueprint as any).subKind,
      jobs: blueprint.jobs.map(job => job.id as JobId),
      tags: blueprint.tags,
      affinities: blueprint.affinities,
      speed: (blueprint as any).speed,
      commandment: (blueprint as any).commandment
    }"
    :is-tilt-enabled="isTiltEnabled"
  />
</template>

<style scoped lang="postcss"></style>
