<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { formatAbilityText } from '@/utils/formatters';
import Card from './cardV3/index.vue';
import { isFunction } from '@game/shared';
import { provideRichTextContext } from '@/game/composables/useRichText';
import { sprites } from '@/assets';

type MaskableCardField =
  | 'name'
  | 'manaCost'
  | 'manaSupply'
  | 'atk'
  | 'hp'
  | 'commandment';

const {
  blueprint,
  foilOverrides = {},
  isTiltEnabled = true,
  masked = {},
  isArtHidden = false
} = defineProps<{
  blueprint: CardBlueprint;
  foilOverrides?: Partial<CardBlueprint['art'][string]['foil']>;
  isTiltEnabled?: boolean;
  // replaces the displayed value of some fields, e.g. with "?"
  masked?: Partial<Record<MaskableCardField, string>>;
  isArtHidden?: boolean;
}>();

const mergedFoilOptions = computed(() => ({
  ...blueprint.art.default.foil,
  ...foilOverrides
}));

provideRichTextContext({
  card: ref(null)
});

const sprite = computed(() => {
  if (isArtHidden) return null;
  return sprites[`cards/${blueprint.art.default.sprite}`];
});
</script>

<template>
  <Card
    v-if="blueprint"
    :card="{
      id: blueprint.id,
      name: masked.name ?? blueprint.name,
      description: isFunction(blueprint.description)
        ? blueprint.description()
        : blueprint.description,
      art: {
        foil: mergedFoilOptions,
        bg: `cards/${blueprint.art.default.bg}`,
        main: `cards/${blueprint.art.default.main}`,
        sprite: `cards/${blueprint.art.default.sprite}`,
        isFullArt: blueprint.art.default.isFullArt
      },
      kind: blueprint.kind,
      manaCost: masked.manaCost ?? (blueprint as any).manaCost,
      manaSupply: masked.manaSupply ?? (blueprint as any).manaSupply,
      level: 'level' in blueprint ? blueprint.level : null,
      exp: 'exp' in blueprint ? blueprint.exp : null,
      rarity: (blueprint as any).rarity,
      atk: masked.atk ?? (blueprint as any).atk,
      hp: masked.hp ?? (blueprint as any).maxHp,
      faction: (blueprint as any).factionId ?? null,
      durability: (blueprint as any).durability,
      abilities: (blueprint as any).abilities?.map(formatAbilityText),
      subKind: (blueprint as any).subKind,
      tags: blueprint.tags,
      speed: (blueprint as any).speed,
      commandment: masked.commandment ?? (blueprint as any).commandment
    }"
    :is-tilt-enabled="isTiltEnabled"
    :sprite="sprite"
  />
</template>

<style scoped lang="postcss"></style>
