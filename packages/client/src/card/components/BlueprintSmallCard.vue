<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import SmallCard from './SmallCard.vue';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
</script>

<template>
  <SmallCard
    :card="{
      id: blueprint.id,
      image: `/assets/cards/${blueprint.cardIconId}.png`,
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
