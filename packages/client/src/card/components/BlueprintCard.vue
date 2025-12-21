<script setup lang="ts">
import type {
  AbilityBlueprint,
  CardBlueprint
} from '@game/engine/src/card/card-blueprint';
import { type Rune } from '@game/engine/src/card/card.enums';
import Card from './Card.vue';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
</script>

<template>
  <Card
    :card="{
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.description,
      art: {
        foil: blueprint.art.default.foil,
        dimensions: blueprint.art.default.dimensions,
        bg: `/assets/cards/${blueprint.art.default.bg}.png`,
        main: `/assets/cards/${blueprint.art.default.main}.png`,
        breakout: blueprint.art.default.breakout
          ? `/assets/cards/${blueprint.art.default.breakout}.png`
          : undefined,
        frame: `/assets/ui/card/frames/${blueprint.art.default.frame}.png`,
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
      faction: blueprint.faction,
      runes: Object.entries(blueprint.runeCost)
        .map(([rune, amount]) =>
          Array.from({ length: amount }, () => rune as Rune)
        )
        .flat()
    }"
  />
</template>

<style scoped lang="postcss"></style>
