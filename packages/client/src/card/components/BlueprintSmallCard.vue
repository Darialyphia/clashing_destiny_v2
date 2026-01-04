<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import SmallCard from './SmallCard.vue';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
</script>

<template>
  <SmallCard
    :card="{
      id: blueprint.id,
      art: {
        foil: blueprint.art.default.foil,
        dimensions: blueprint.art.default.dimensions,
        bg: `cards/${blueprint.art.default.bg}`,
        main: `cards/${blueprint.art.default.main}`,
        breakout: blueprint.art.default.breakout
          ? `cards/${blueprint.art.default.breakout}`
          : undefined,
        frame: `ui/card/frames/${blueprint.art.default.frame}`,
        tint: blueprint.art.default.tint
      },
      kind: blueprint.kind,
      atk: (blueprint as any).atk ?? (blueprint as any).damage,
      hp: (blueprint as any).maxHp,
      durability: (blueprint as any).durability,
      manaCost: (blueprint as any).manaCost,
      destinyCost: (blueprint as any).destinyCost
    }"
  />
</template>

<style scoped lang="postcss"></style>
