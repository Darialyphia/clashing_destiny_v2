<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import SmallCard from './SmallCard.vue';
import { sprites } from '@/assets';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();

const sprite = computed(() => {
  return sprites[`cards/${blueprint.art.default.sprite}`];
});
</script>

<template>
  <SmallCard
    :card="{
      id: blueprint.id,
      art: {
        foil: blueprint.art.default.foil,
        bg: `cards/${blueprint.art.default.bg}`,
        main: `cards/${blueprint.art.default.main}`,
        sprite: `cards/${blueprint.art.default.sprite}`,
        isFullArt: blueprint.art.default.isFullArt
      },
      kind: blueprint.kind,
      atk: (blueprint as any).atk,
      commandment: (blueprint as any).commandment,
      hp: (blueprint as any).maxHp,
      durability: (blueprint as any).durability,
      manaCost: (blueprint as any).manaCost,
      destinyCost: (blueprint as any).destinyCost
    }"
    :sprite
  />
</template>

<style scoped lang="postcss"></style>
