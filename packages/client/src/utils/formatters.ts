import type { AbilityBlueprint } from '@game/engine/src/card/card-blueprint';

export const formatAbilityText = (a: AbilityBlueprint<any, any>) =>
  `@[${a.speed}]@${a.shouldExhaust ? ' @[exhaust]@' : ''}${a.manaCost ? ` @[mana] ${a.manaCost}@` : ''}: ${(a as any).durabilityCost ? `Lose ${(a as any).durabilityCost} durability.` : ''} ${a.description}`;
