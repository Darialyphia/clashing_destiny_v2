# Targeting and Interactions

This guide explains how targeting works in the game engine and how to implement card targeting logic.

## Table of Contents

- [Overview](#overview)
- [Targeting Flow](#targeting-flow)
- [Pre-built Targeting Rules](#pre-built-targeting-rules)
- [Custom Targeting](#custom-targeting)
- [Interaction System](#interaction-system)
- [Common Patterns](#common-patterns)

## Overview

Targeting is how players select which cards or entities a card will affect. The system has two main phases:

1. **Validation** (`canPlay`) - Check if valid targets exist
2. **Selection** (`getPreResponseTargets`) - Let player choose targets

This two-phase approach ensures the UI only prompts for targets when the card can actually be played.

## Targeting Flow

When a player tries to play a card:

1. **Check `canPlay(game, card)`** - Are there any valid targets?
   - Returns `true` if card can be played
   - Returns `false` if no valid targets exist
2. **Call `getPreResponseTargets(game, card)`** - Let player select targets
   - Returns an array of selected targets
   - Uses the interaction system to prompt the player
3. **Execute `onPlay(game, card, targets)`** - Apply effects to targets
   - Receives the selected targets as parameter

### For Cards Without Targets

If a card doesn't need targets:

```typescript
canPlay: () => true,
async onPlay(game, card) {
  // No targets needed
  await card.player.drawCards(1);
}
```

## Pre-built Targeting Rules

The engine provides pre-built targeting helpers in [`card-utils.ts`](../src/card/card-utils.ts). These handle common targeting patterns.

### Single Target Rules

#### singleEnemyTargetRules

Target a single enemy hero or minion.

```typescript
import { singleEnemyTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  return singleEnemyTargetRules.canPlay(game, card);
},
getPreResponseTargets(game, card) {
  return singleEnemyTargetRules.getPreResponseTargets(game, card, {
    type: 'card',
    card
  });
}
```

With a predicate to filter targets:

```typescript
// Only target damaged enemies
canPlay(game, card) {
  return singleEnemyTargetRules.canPlay(game, card, (c) => c.damage > 0);
},
getPreResponseTargets(game, card) {
  return singleEnemyTargetRules.getPreResponseTargets(
    game,
    card,
    { type: 'card', card },
    (c) => c.damage > 0
  );
}
```

#### singleAllyTargetRules

Target a single friendly hero or minion.

```typescript
import { singleAllyTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  return singleAllyTargetRules.canPlay(game, card);
},
getPreResponseTargets(game, card) {
  return singleAllyTargetRules.getPreResponseTargets(game, card, {
    type: 'card',
    card
  });
}
```

#### singleEnemyMinionTargetRules

Target a single enemy minion only (no heroes).

```typescript
import { singleEnemyMinionTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  return singleEnemyMinionTargetRules.canPlay(game, card);
},
getPreResponseTargets(game, card) {
  return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
    type: 'card',
    card
  });
}
```

#### singleAllyMinionTargetRules

Target a single friendly minion only.

```typescript
import { singleAllyMinionTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  return singleAllyMinionTargetRules.canPlay(game, card);
},
getPreResponseTargets(game, card) {
  return singleAllyMinionTargetRules.getPreResponseTargets(game, card, {
    type: 'card',
    card
  });
}
```

#### singleMinionTargetRules

Target any single minion (friendly or enemy).

```typescript
import { singleMinionTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  return singleMinionTargetRules.canPlay(game, card);
},
getPreResponseTargets(game, card) {
  return singleMinionTargetRules.getPreResponseTargets(game, card, {
    type: 'card',
    card
  });
}
```

#### singleArtifactTargetRules

Target a single artifact (from any player).

```typescript
import { singleArtifactTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  return singleArtifactTargetRules.canPlay(game, card);
},
getPreResponseTargets(game, card) {
  return singleArtifactTargetRules.getPreResponseTargets(game, card, {
    type: 'card',
    card
  });
}
```

### Multiple Target Rules

#### multipleEnemyTargetRules

Target multiple enemy heroes/minions.

```typescript
import { multipleEnemyTargetRules } from '../../../../card-utils';

canPlay(game, card) {
  // Requires at least 2 valid targets
  return multipleEnemyTargetRules.canPlay(2)(game, card);
},
getPreResponseTargets(game, card) {
  // Select 1-3 targets, no repeats
  return multipleEnemyTargetRules.getPreResponseTargets({
    min: 1,
    max: 3,
    allowRepeat: false
  })(game, card, { type: 'card', card });
}
```

With repeats allowed (e.g., Magic Missile hitting same target 3 times):

```typescript
getPreResponseTargets(game, card) {
  return multipleEnemyTargetRules.getPreResponseTargets({
    min: 3,
    max: 3,
    allowRepeat: true  // Can select same target multiple times
  })(game, card, { type: 'card', card });
}
```

### Discard Pile Rules

#### cardsInAllyDiscardPile

Select cards from your discard pile.

```typescript
import { cardsInAllyDiscardPile, isMinion } from '../../../../card-utils';

canPlay(game, card) {
  return cardsInAllyDiscardPile.canPlay(game, card, {
    min: 1,
    predicate: (c) => isMinion(c)
  });
},
async getPreResponseTargets(game, card) {
  return await cardsInAllyDiscardPile.getPreResponseTargets(game, card, {
    player: card.player,
    label: 'Choose a minion from your discard pile',
    minChoiceCount: 1,
    maxChoiceCount: 1,
    predicate: (c) => isMinion(c)
  });
}
```

#### cardsInEnemyDiscardPile

Select cards from opponent's discard pile.

```typescript
import { cardsInEnemyDiscardPile, isSpell } from '../../../../card-utils';

canPlay(game, card) {
  return cardsInEnemyDiscardPile.canPlay(game, card, {
    min: 1,
    predicate: (c) => isSpell(c)
  });
},
async getPreResponseTargets(game, card) {
  return await cardsInEnemyDiscardPile.getPreResponseTargets(game, card, {
    player: card.player,
    label: 'Choose a spell from enemy discard pile',
    minChoiceCount: 1,
    maxChoiceCount: 1,
    predicate: (c) => isSpell(c)
  });
}
```

## Custom Targeting

For unique targeting needs, you can implement custom logic using the interaction system directly.

### Custom Board Targeting

```typescript
canPlay(game, card) {
  // Custom validation logic
  return card.player.minions.length > 0 && card.player.mana >= 5;
},

async getPreResponseTargets(game, card) {
  return await game.interaction.selectCardsOnBoard<MinionCard>({
    player: card.player,
    origin: { type: 'card', card },

    // Check if a card can be selected
    isElligible(candidate, selectedCards) {
      if (!isMinion(candidate)) return false;
      if (!candidate.canBeTargeted(card)) return false;
      if (candidate.atk < 3) return false;  // Custom: only target 3+ ATK

      // Prevent selecting same card twice
      return !selectedCards.some(s => s.equals(candidate));
    },

    // Can player commit their selection?
    canCommit(selectedCards) {
      return selectedCards.length >= 1;  // At least 1
    },

    // Is selection complete?
    isDone(selectedCards) {
      return selectedCards.length === 2;  // Exactly 2
    }
  });
}
```

### Custom Card Choice (Non-Board)

For choosing cards from hand, deck, or other zones:

```typescript
async getPreResponseTargets(game, card) {
  return await game.interaction.chooseCards<MinionCard>({
    player: card.player,
    label: 'Choose 2 minions from your hand',
    choices: card.player.hand.cards.filter(isMinion) as MinionCard[],
    minChoiceCount: 1,
    maxChoiceCount: 2
  });
}
```

## Interaction System

The interaction system (`game.interaction`) provides the interface between game logic and the UI.

### selectCardsOnBoard

Select cards currently on the board.

```typescript
await game.interaction.selectCardsOnBoard<T>({
  player: Player,           // Which player is selecting
  origin: CardTargetOrigin, // What's causing the selection

  isElligible(candidate, selectedCards): boolean,
  canCommit(selectedCards): boolean,
  isDone(selectedCards): boolean
})
```

**Parameters:**

- `isElligible` - Can this card be selected? Checked for each card
- `canCommit` - Can player confirm their current selection?
- `isDone` - Is selection complete? (triggers auto-commit)

### chooseCards

Select cards from a provided list (hand, deck, discard, etc).

```typescript
await game.interaction.chooseCards<T>({
  player: Player,
  label: string,           // UI prompt text
  choices: T[],            // Available cards
  minChoiceCount: number,  // Minimum selections
  maxChoiceCount: number   // Maximum selections
})
```

### CardTargetOrigin

When calling targeting functions, specify what's causing the targeting:

```typescript
// For cards being played
{
  type: ('card', card);
}

// For abilities being used
{
  type: ('ability', card, abilityId);
}
```

## Common Patterns

### Pattern 1: Damage Spell (Single Enemy)

```typescript
import { singleEnemyTargetRules } from '../../../../card-utils';
import { SpellDamage } from '../../../../../utils/damage';

export const damageSpell: SpellBlueprint = {
  // ...
  canPlay(game, card) {
    return singleEnemyTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onPlay(game, card, targets) {
    for (const target of targets as (MinionCard | HeroCard)[]) {
      await target.takeDamage(card, new SpellDamage(5, card));
    }
  }
};
```

### Pattern 2: Buff Spell (Single Ally)

```typescript
import { singleAllyMinionTargetRules } from '../../../../card-utils';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';

export const buffSpell: SpellBlueprint = {
  // ...
  canPlay(game, card) {
    return singleAllyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.modifiers.add(
      new SimpleAttackBuffModifier('buff', game, card, { amount: 3 })
    );
  }
};
```

### Pattern 3: Conditional Targeting

```typescript
import { singleEnemyTargetRules } from '../../../../card-utils';

export const conditionalSpell: SpellBlueprint = {
  // ...
  canPlay(game, card) {
    // Only target damaged enemies
    return singleEnemyTargetRules.canPlay(game, card, target => target.damage > 0);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(
      game,
      card,
      { type: 'card', card },
      target => target.damage > 0 // Same predicate
    );
  },
  async onPlay(game, card, targets) {
    // Destroy damaged enemy
    const target = targets[0] as MinionCard | HeroCard;
    if (isMinionOrHero(target)) {
      await target.destroy();
    }
  }
};
```

### Pattern 4: Multi-Target (Same Target Multiple Times)

```typescript
import { multipleEnemyTargetRules } from '../../../../card-utils';

export const magicMissile: SpellBlueprint = {
  // ...
  canPlay(game, card) {
    return multipleEnemyTargetRules.canPlay(1)(game, card);
  },
  getPreResponseTargets(game, card) {
    // Select 3 times, can repeat same target
    return multipleEnemyTargetRules.getPreResponseTargets({
      min: 3,
      max: 3,
      allowRepeat: true
    })(game, card, { type: 'card', card });
  },
  async onPlay(game, card, targets) {
    // Deal 1 damage to each selected target (possibly same target 3x)
    for (const target of targets as (MinionCard | HeroCard)[]) {
      await target.takeDamage(card, new SpellDamage(1, card));
    }
  }
};
```

### Pattern 5: Resurrect from Discard

```typescript
import { cardsInAllyDiscardPile, isMinion } from '../../../../card-utils';

export const resurrect: SpellBlueprint = {
  // ...
  canPlay(game, card) {
    return cardsInAllyDiscardPile.canPlay(game, card, {
      min: 1,
      predicate: c => isMinion(c) && c.manaCost <= 3
    });
  },
  async getPreResponseTargets(game, card) {
    return await cardsInAllyDiscardPile.getPreResponseTargets<MinionCard>(game, card, {
      player: card.player,
      label: 'Choose a minion (3 cost or less) to resurrect',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      predicate: c => isMinion(c) && c.manaCost <= 3
    });
  },
  async onPlay(game, card, targets) {
    const [minion] = targets as MinionCard[];
    // Move from discard to board
    await card.player.summonMinion(minion);
  }
};
```

## Type Guards

Use type guards from `card-utils.ts` to check card types safely:

```typescript
import {
  isMinion,
  isHero,
  isSpell,
  isArtifact,
  isMinionOrHero
} from '../../../../card-utils';

if (isMinion(card)) {
  // card is now typed as MinionCard
  console.log(card.atk);
}

if (isMinionOrHero(card)) {
  // card is MinionCard | HeroCard
  await card.takeDamage(source, damage);
}
```

## Tips and Best Practices

1. **Always validate in `canPlay`** - Don't let players try to play unplayable cards
2. **Use the same predicate** in both `canPlay` and `getPreResponseTargets`
3. **Prefer pre-built rules** - They handle edge cases correctly
4. **Check locations** - Targets might be removed before effects resolve
5. **Use type guards** - Safely narrow card types before accessing properties
6. **Test edge cases** - What if all targets die mid-resolution?
7. **Consider targeting restrictions** - Stealth, untargetable, etc. are handled by `canBeTargeted()`

## See Also

- [Card Implementation Guide](./CARD_IMPLEMENTATION_GUIDE.md)
- [Abilities System](./ABILITIES_SYSTEM.md)
- [Damage and Combat](./DAMAGE_AND_COMBAT.md)
