<script setup lang="ts">
import type {
  AbilityBlueprint,
  CardBlueprint
} from '@game/engine/src/card/card-blueprint';
import Card from './Card.vue';

const { blueprint, foilOverrides = {} } = defineProps<{
  blueprint: CardBlueprint;
  foilOverrides?: Partial<CardBlueprint['art'][string]['foil']>;
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
      description: blueprint.description,
      art: {
        foil: mergedFoilOptions,
        dimensions: blueprint.art.default.dimensions,
        bg: `cards/${blueprint.art.default.bg}`,
        main: `cards/${blueprint.art.default.main}`,
        breakout: blueprint.art.default.breakout
          ? `cards/${blueprint.art.default.breakout}`
          : undefined,
        foilArt: blueprint.art.default.foilArt
          ? `cards/${blueprint.art.default.foilArt}`
          : undefined,
        frame: `ui/card/frames/${blueprint.art.default.frame}`,
        tint: blueprint.art.default.tint
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
      spellpower: (blueprint as any).spellPower,
      level: (blueprint as any).level,
      durability: (blueprint as any).durability,
      abilities: (blueprint as any).abilities?.map(
        (a: AbilityBlueprint<any, any>) =>
          `@[${a.speed}]@${a.shouldExhaust ? ' @[exhaust]@' : ''}${a.manaCost ? ` @[mana] ${a.manaCost}@` : ''}:  ${a.description}`
      ),
      subKind: (blueprint as any).subKind,
      speed: blueprint.speed,
      faction: blueprint.faction
    }"
  />
</template>

<style scoped lang="postcss"></style>
