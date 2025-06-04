<script setup lang="ts">
import type {
  Ability,
  CardBlueprint
} from '@game/engine/src/card/card-blueprint';
import Card from './Card.vue';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
</script>

<template>
  <Card
    :card="{
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.description,
      image: `/assets/icons/${blueprint.cardIconId}.png`,
      kind: blueprint.kind,
      affinity: blueprint.affinity,
      uinlockableAffinities: (blueprint as any).unlockableAffinities,
      manaCost: (blueprint as any).manaCost,
      destinyCost: (blueprint as any).destinyCost,
      rarity: (blueprint as any).rarity,
      atk: (blueprint as any).atk,
      hp: (blueprint as any).maxHp,
      spellpower: (blueprint as any).spellPower,
      level: (blueprint as any).level,
      durability: (blueprint as any).durability,
      abilities: (blueprint as any).abilities?.map(
        (a: Ability<any, any>) => a.description
      )
    }"
  />
</template>

<style scoped lang="postcss"></style>
