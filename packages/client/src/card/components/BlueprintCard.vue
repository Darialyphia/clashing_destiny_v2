<script setup lang="ts">
import type {
  AbilityBlueprint,
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
      image: `/assets/cards/${blueprint.cardIconId}.png`,
      kind: blueprint.kind,
      spellSchool: (blueprint as any).spellSchool,
      unlockedSpellSchools: (blueprint as any).spellSchools,
      manaCost: (blueprint as any).manaCost,
      destinyCost: (blueprint as any).destinyCost,
      rarity: (blueprint as any).rarity,
      atk:
        (blueprint as any).atk ??
        (blueprint as any).damage ??
        (blueprint as any).atkBonus,
      hp: (blueprint as any).maxHp,
      countdown: (blueprint as any).maxCountdown,
      spellpower: (blueprint as any).spellPower,
      level: (blueprint as any).level,
      durability: (blueprint as any).durability,
      abilities: (blueprint as any).abilities?.map(
        (a: AbilityBlueprint<any, any>) => `@[${a.speed}]@ ${a.description}`
      ),
      subKind: (blueprint as any).subKind,
      jobs:
        (blueprint as any).jobs ??
        ((blueprint as any).job ? [(blueprint as any).job] : []),
      speed: blueprint.speed
    }"
  />
</template>

<style scoped lang="postcss"></style>
