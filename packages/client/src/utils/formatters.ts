import type { AbilityBlueprint } from '@game/engine/src/card/card-blueprint';

export const formatAbilityText = (a: AbilityBlueprint<any>) =>
  `<rt-ability cost="${a.manaCost}"></rt-ability> ${a.description}`;
