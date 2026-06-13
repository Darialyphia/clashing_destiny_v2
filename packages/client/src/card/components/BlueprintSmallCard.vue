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
        bg: `cards/${blueprint.art.default.bg}`,
        main: `cards/${blueprint.art.default.main}`,
        isFullArt: blueprint.art.default.isFullArt
      },
      kind: blueprint.kind,
      power: (blueprint as any).power,
      damage: (blueprint as any).damage,
      hp: (blueprint as any).maxHp,
      durability: (blueprint as any).durability,
      manaCost: (blueprint as any).manaCost,
      destinyCost: (blueprint as any).destinyCost
    }"
  />
</template>

<style scoped lang="postcss"></style>
