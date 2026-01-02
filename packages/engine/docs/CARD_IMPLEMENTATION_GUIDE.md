# Card Implementation Guide

This guide covers how to implement new cards in the `@game/engine` package.

## Table of Contents

- [Card Types Overview](#card-types-overview)
- [File Structure](#file-structure)
- [Card Blueprint Structure](#card-blueprint-structure)
- [Implementation Steps](#implementation-steps)
- [Common Patterns](#common-patterns)
- [Examples](#examples)

## Card Types Overview

The game supports four main card types:

1. **Minion** - Units that are summoned to the board with ATK and HP
2. **Spell** - One-time effects that usually target other cards
3. **Hero** - Special cards representing the player
4. **Artifact** - Equipement that provide persistent effects, or charge-based abilities to the Hero
5. **Sigil** - Card that remains on the board for a set amount of time, but cannot be interacted with by minions

Each type has its own blueprint interface defined in [`card-blueprint.ts`](../src/card/card-blueprint.ts).

## File Structure

Cards are organized by set and faction:

```
packages/engine/src/card/sets/
  └── core/                    # Set name
      ├── arcane/              # Faction name
      │   ├── minions/
      │   │   └── little-witch.ts
      │   ├── spells/
      │   │   └── lightning-bolt.ts
      │   └── heroes/
      │       └── spirit-of-arcane.ts
      └── neutral/             # Neutral cards
          └── spells/
              └── mana-spark.ts
```

### Naming Conventions

- **File name**: kebab-case, e.g., `lightning-bolt.ts`, `little-witch.ts`
- **Export name**: camelCase, e.g., `lightningBolt`, `littleWitch`
- **Card ID**: kebab-case matching file name, e.g., `'lightning-bolt'`, `'little-witch'`

## Card Blueprint Structure

All cards share common properties defined in `CardBlueprintBase`:

### Required Properties

```typescript
{
  id: string;                    // Unique identifier (kebab-case)
  kind: CardKind;                // CARD_KINDS.MINION | SPELL | HERO | ARTIFACT
  name: string;                  // Display name
  description: string;           // Card text (use dedent for multiline)

  // Card metadata
  collectable: boolean;          // Can players add this to decks?
  unique: boolean;               // Can only have 1 copy on the board at the same time
  setId: CardSetId;              // Usually CARD_SETS.CORE
  faction: Faction;              // FACTIONS.ARCANE, etc.
  rarity: Rarity;                // RARITIES.COMMON | RARE | EPIC | LEGENDARY
  speed: CardSpeed;              // CARD_SPEED.SLOW | FAST | BURST
  tags: Tag[];                   // Searchable tags (usually empty [])

  // Cost
  deckSource: CARD_DECK_SOURCES.MAIN_DECK;
  manaCost: number;              // Mana cost to play
  // OR
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK;
  destinyCost: number;           // Destiny cost to play

  // Art (can use placeholders)
  art: {
    default: {
      foil: { /* foil effects */ },
      dimensions: { width: 174, height: 133 },
      bg: string,
      main: string,
      frame: 'default',
      tint: CardTint
    }
  };

  // Lifecycle hooks
  onInit: (game, card) => Promise<void>;
  onPlay: (game, card, ...args) => Promise<void>;
  canPlay: (game, card) => boolean;

  abilities: AbilityBlueprint[];  // Card abilities (can be [])
}
```

## Implementation Steps

### Step 1: Create the File

Create a new TypeScript file in the appropriate location based on card type and faction.

### Step 2: Import Required Dependencies

```typescript
import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
// Import modifiers, damage types, and utilities as needed
```

### Step 3: Define the Blueprint

Export a constant with the card blueprint:

```typescript
export const myCard: MinionBlueprint = {
  // ... properties
};
```

### Step 4: Implement Type-Specific Requirements

#### For Minions:

```typescript
{
  kind: CARD_KINDS.MINION,
  atk: number,              // Attack power
  maxHp: number,            // Maximum health
  // ... rest of blueprint
}
```

#### For Spells:

```typescript
{
  kind: CARD_KINDS.SPELL,
  getPreResponseTargets: (game, card) => Promise<PreResponseTarget[]>,
  // ... rest of blueprint
}
```

#### For Heroes:

```typescript
{
  kind: CARD_KINDS.HERO,
  lineage: string | null,
  level: number,
  atk: number,
  maxHp: number,
  // ... rest of blueprint
}
```

## Common Patterns

### Pattern 1: Simple Minion with No Special Effects

```typescript
export const simpleMinion: MinionBlueprint = {
  id: 'simple-minion',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Simple Minion',
  description: 'A basic minion.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    /* ... */
  },
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 2,
  maxHp: 2,
  abilities: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
```

### Pattern 2: Spell with Single Target

Use the pre-built targeting helpers from [`card-utils.ts`](../src/card/card-utils.ts):

```typescript
import { singleEnemyMinionTargetRules } from '../../../../card-utils';
import { SpellDamage } from '../../../../../utils/damage';

export const damageSpell: SpellBlueprint = {
  // ... basic properties
  canPlay(game, card) {
    return singleEnemyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(3, card));
    }
  }
};
```

### Pattern 3: Minion with Keywords/Modifiers

Apply modifiers in `onInit` for permanent effects:

```typescript
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';

export const stealthyRusher: MinionBlueprint = {
  // ... basic properties
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
    await card.modifiers.add(new StealthModifier(game, card));
  },
  async onPlay() {}
};
```

### Pattern 4: Minion with Conditional Effects

Use modifier mixins for conditional effects:

```typescript
import { PreemptiveStrikeModifier } from '../../../../../modifier/modifiers/preemptive-strike.mofier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { getEmpowerStacks } from '../../../../card-actions-utils';

export const conditionalMinion: MinionBlueprint = {
  // ... basic properties
  description: 'Has +1 ATK while your hero is Empowered.',
  async onInit(game, card) {
    await card.modifiers.add(
      new SimpleAttackBuffModifier('conditional-attack', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );
  }
};
```

### Pattern 5: Card with Abilities

Abilities are activated effects that players can use after the card is played:

```typescript
export const minionWithAbility: MinionBlueprint = {
  // ... basic properties
  abilities: [
    {
      id: 'unique-ability-id',
      description: 'Deal 1 damage to an enemy minion.',
      label: 'Deal 1 Damage',
      manaCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      canUse: (game, card) =>
        card.location === CARD_LOCATIONS.BOARD &&
        singleEnemyMinionTargetRules.canPlay(game, card),
      getPreResponseTargets(game, card) {
        return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          card,
          abilityId: 'unique-ability-id'
        });
      },
      async onResolve(game, card, targets, ability) {
        const target = targets[0] as MinionCard;
        if (!target || target.location !== 'board') return;
        await target.takeDamage(card, new AbilityDamage(1));
        ability.seal(); // Prevent future use
      }
    }
  ]
};
```

## Examples

### Example 1: Lightning Bolt (Simple Targeted Spell)

From [`lightning-bolt.ts`](../src/card/sets/core/arcane/spells/lightning-bolt.ts):

```typescript
export const lightningBolt: SpellBlueprint = {
  id: 'lightning-bolt',
  kind: CARD_KINDS.SPELL,
  name: 'Lightning Bolt',
  description: 'Deal 2 damage to an enemy minion and exhaust it.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  manaCost: 3,
  speed: CARD_SPEED.FAST,
  // ... other properties
  canPlay(game, card) {
    return singleEnemyMinionTargetRules.canPlay(game, card);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new ForesightModifier(game, card));
  },
  async onPlay(game, card, targets) {
    for (const target of targets as MinionCard[]) {
      await target.takeDamage(card, new SpellDamage(2, card));
      await target.exhaust();
    }
  }
};
```

### Example 2: Little Witch (Minion with Ability)

From [`little-witch.ts`](../src/card/sets/core/arcane/minions/little-witch.ts):

```typescript
export const littleWitch: MinionBlueprint = {
  id: 'little-witch',
  kind: CARD_KINDS.MINION,
  name: 'Little Witch',
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  abilities: [
    {
      id: 'little-witch-ability-1',
      description: 'Deal 1 damage to an enemy minion. Seal this ability.',
      label: 'Deal 1 Damage',
      manaCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      canUse: (game, card) =>
        card.location === CARD_LOCATIONS.BOARD &&
        singleEnemyMinionTargetRules.canPlay(game, card),
      getPreResponseTargets(game, card) {
        return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          card,
          abilityId: 'little-witch-ability-1'
        });
      },
      async onResolve(game, card, targets, ability) {
        const target = targets[0] as MinionCard;
        if (!target || target.location !== 'board') return;
        await target.takeDamage(card, new AbilityDamage(1));
        ability.seal();
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
```

### Example 3: Spellblade Duelist (Conditional Modifiers)

From [`spellblade-duelist.ts`](../src/card/sets/core/arcane/minions/spellblade-duelist.ts):

```typescript
export const spellbladeDuelist: MinionBlueprint = {
  id: 'spellblade-duelist',
  kind: CARD_KINDS.MINION,
  name: 'Spellblade Duelist',
  description: 'This has Preemptive Strike and +1 ATK as long as your hero is Empowered.',
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  abilities: [],
  async onInit(game, card) {
    // Conditional Preemptive Strike
    await card.modifiers.add(
      new PreemptiveStrikeModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );

    // Conditional +1 ATK
    await card.modifiers.add(
      new SimpleAttackBuffModifier('spellblade-duelist-attack-buff', game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
      })
    );
  },
  async onPlay() {}
};
```

## Tips and Best Practices

1. **Always use `async/await`** in lifecycle hooks even if not strictly necessary
2. **Check card locations** before applying effects in abilities
3. **Use type guards** from `card-utils.ts` (`isMinion`, `isHero`, etc.)
4. **Prefer pre-built targeting rules** over custom logic when possible
5. **Apply permanent keywords in `onInit`**, not `onPlay`
6. **Use `dedent`** for multi-line descriptions to maintain formatting
7. **Make ability IDs unique** - prefix with card ID
8. **Test edge cases** - what happens if target dies before effect resolves?

## Next Steps

- Learn about [Modifiers and Keywords](./MODIFIERS_AND_KEYWORDS.md)
- Understand [Targeting and Interactions](./TARGETING_AND_INTERACTIONS.md)
- Explore the [Abilities System](./ABILITIES_SYSTEM.md)
- Study [Damage and Combat](./DAMAGE_AND_COMBAT.md)
