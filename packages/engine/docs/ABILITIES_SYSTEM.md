# Abilities System

This guide explains how to implement activated abilities on cards.

## Table of Contents

- [What are Abilities?](#what-are-abilities)
- [Abilities vs Card Effects](#abilities-vs-card-effects)
- [Ability Structure](#ability-structure)
- [Implementing Abilities](#implementing-abilities)
- [Common Patterns](#common-patterns)
- [Advanced Topics](#advanced-topics)

## What are Abilities?

Abilities are activated effects that players can trigger after a card is in play. Unlike `onPlay` effects that happen automatically when played, abilities:

- Require player activation
- Often cost mana to use
- Can have their own targeting
- Can be used multiple times (unless sealed)
- Have their own speed (FAST/BURST)
- Can exhaust the card when used

**Examples:**

- Little Witch: "Pay 1 mana: Deal 1 damage to an enemy minion"
- Healing Aura: "Pay 2 mana: Restore 3 HP to your hero"

## Abilities vs Card Effects

| Aspect     | Card Effect (`onPlay`)      | Ability                   |
| ---------- | --------------------------- | ------------------------- |
| Trigger    | Automatically when played   | Player activates manually |
| Timing     | Once, when card enters play | Can use multiple times    |
| Cost       | Part of card's mana cost    | Separate mana cost        |
| Targeting  | Done when playing card      | Done when using ability   |
| On Minions | Enters board first          | Used while on board       |

### When to Use Abilities

Use abilities when:

- Effect should be optional and repeatable
- Player needs to choose when to activate
- Effect has its own timing/cost
- Minion provides ongoing utility

Use `onPlay` when:

- Effect happens automatically
- One-time effect when played
- Part of the card's immediate impact

## Ability Structure

Abilities are defined in the `abilities` array of a card blueprint:

```typescript
abilities: [
  {
    id: string,                    // Unique identifier
    description: string,           // Text shown on card
    label: string,                 // Short label for UI
    manaCost: number,              // Cost to activate
    shouldExhaust: boolean,        // Does using this exhaust the card?
    speed: CardSpeed,              // CARD_SPEED.FAST or BURST
    isHiddenOnCard?: boolean,      // Hide from card display (for keywords)

    canUse(game, card): boolean,
    getPreResponseTargets(game, card): Promise<PreResponseTarget[]>,
    onResolve(game, card, targets, ability): Promise<void>
  }
]
```

### Required Properties

**id**: Unique string identifier

- Should be prefixed with card ID
- Example: `'little-witch-ability-1'`

**description**: Ability text shown on the card

- Use `@Keyword@` syntax for keywords
- Example: `'Deal 1 damage to an enemy minion. @Seal@ this ability.'`

**label**: Short label for UI buttons

- Keep it concise (2-4 words)
- Example: `'Deal 1 Damage'`, `'Heal Hero'`

**manaCost**: Mana cost to use

- `0` for free abilities
- Can be any positive integer

**shouldExhaust**: Whether using the ability exhausts the card

- `true` - Card becomes exhausted, can't attack this turn
- `false` - Card remains ready

**speed**: When ability can be used

- `CARD_SPEED.FAST` - Can be used during opponent's turn
- `CARD_SPEED.BURST` - Can only be used during your turn

**canUse**: Function that checks if ability can be activated

- Check card location, valid targets, game state
- Return `true` if usable, `false` otherwise

**getPreResponseTargets**: Function that prompts for targets

- Uses interaction system to select targets
- Returns array of selected targets

**onResolve**: Function that executes the ability

- Receives card, targets, and ability instance
- Apply effects, modify game state

## Implementing Abilities

### Step 1: Basic Ability Template

```typescript
export const myCard: MinionBlueprint = {
  // ... card properties
  abilities: [
    {
      id: 'my-card-ability',
      description: 'Description of what the ability does.',
      label: 'Short Label',
      manaCost: 1,
      shouldExhaust: false,
      speed: CARD_SPEED.FAST,

      canUse(game, card) {
        // Check if ability can be used
        return card.location === CARD_LOCATIONS.BOARD;
      },

      async getPreResponseTargets(game, card) {
        // Return empty array if no targets
        return [];
      },

      async onResolve(game, card, targets, ability) {
        // Execute ability effect
      }
    }
  ]
};
```

### Step 2: Add Targeting (if needed)

For abilities that need targets, use the targeting helpers:

```typescript
import { singleEnemyMinionTargetRules } from '../../../../card-utils';

{
  canUse(game, card) {
    return (
      card.location === CARD_LOCATIONS.BOARD &&
      singleEnemyMinionTargetRules.canPlay(game, card)
    );
  },

  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'ability',
      card,
      abilityId: 'my-card-ability'
    });
  }
}
```

### Step 3: Implement Effect

```typescript
async onResolve(game, card, targets, ability) {
  const target = targets[0] as MinionCard;

  // Safety check - target might be gone
  if (!target || target.location !== 'board') return;

  // Apply effect
  await target.takeDamage(card, new AbilityDamage(3));
}
```

## Common Patterns

### Pattern 1: Targetless Ability

No targeting, just an effect:

```typescript
{
  id: 'draw-card-ability',
  description: 'Draw a card.',
  label: 'Draw Card',
  manaCost: 2,
  shouldExhaust: true,
  speed: CARD_SPEED.FAST,

  canUse(game, card) {
    return card.location === CARD_LOCATIONS.BOARD;
  },

  async getPreResponseTargets(game, card) {
    return [];  // No targets needed
  },

  async onResolve(game, card, targets, ability) {
    await card.player.drawCards(1);
  }
}
```

### Pattern 2: Damaging Ability

Deal damage to an enemy:

```typescript
import { singleEnemyMinionTargetRules } from '../../../../card-utils';
import { AbilityDamage } from '../../../../../utils/damage';

{
  id: 'damage-ability',
  description: 'Deal 2 damage to an enemy minion.',
  label: 'Deal 2 Damage',
  manaCost: 1,
  shouldExhaust: false,
  speed: CARD_SPEED.FAST,

  canUse(game, card) {
    return (
      card.location === CARD_LOCATIONS.BOARD &&
      singleEnemyMinionTargetRules.canPlay(game, card)
    );
  },

  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'ability',
      card,
      abilityId: 'damage-ability'
    });
  },

  async onResolve(game, card, targets, ability) {
    const target = targets[0] as MinionCard;
    if (!target || target.location !== 'board') return;

    await target.takeDamage(card, new AbilityDamage(2));
  }
}
```

### Pattern 3: One-Time Use (Sealed)

Ability can only be used once:

```typescript
{
  id: 'one-time-ability',
  description: 'Deal 1 damage. @Seal@ this ability.',
  label: 'Deal 1 Damage',
  manaCost: 0,
  shouldExhaust: false,
  speed: CARD_SPEED.FAST,

  canUse(game, card) {
    return (
      card.location === CARD_LOCATIONS.BOARD &&
      singleEnemyMinionTargetRules.canPlay(game, card)
    );
  },

  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'ability',
      card,
      abilityId: 'one-time-ability'
    });
  },

  async onResolve(game, card, targets, ability) {
    const target = targets[0] as MinionCard;
    if (!target || target.location !== 'board') return;

    await target.takeDamage(card, new AbilityDamage(1));

    // Seal the ability - can't be used again
    ability.seal();
  }
}
```

### Pattern 4: Buff Ability

Grant a buff to an ally:

```typescript
import { singleAllyMinionTargetRules } from '../../../../card-utils';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

{
  id: 'buff-ability',
  description: 'Give an ally minion +2 ATK this turn.',
  label: 'Buff Ally',
  manaCost: 1,
  shouldExhaust: true,
  speed: CARD_SPEED.FAST,

  canUse(game, card) {
    return (
      card.location === CARD_LOCATIONS.BOARD &&
      singleAllyMinionTargetRules.canPlay(game, card)
    );
  },

  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'ability',
      card,
      abilityId: 'buff-ability'
    });
  },

  async onResolve(game, card, targets, ability) {
    const target = targets[0] as MinionCard;
    if (!target || target.location !== 'board') return;

    await target.modifiers.add(
      new SimpleAttackBuffModifier('ability-buff', game, card, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
}
```

### Pattern 5: Conditional Ability

Only usable under certain conditions:

```typescript
{
  id: 'conditional-ability',
  description: 'If you have 10+ mana, destroy an enemy minion.',
  label: 'Destroy',
  manaCost: 0,
  shouldExhaust: true,
  speed: CARD_SPEED.FAST,

  canUse(game, card) {
    return (
      card.location === CARD_LOCATIONS.BOARD &&
      card.player.mana >= 10 &&
      singleEnemyMinionTargetRules.canPlay(game, card)
    );
  },

  getPreResponseTargets(game, card) {
    return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'ability',
      card,
      abilityId: 'conditional-ability'
    });
  },

  async onResolve(game, card, targets, ability) {
    if (card.player.mana < 10) return;  // Safety check

    const target = targets[0] as MinionCard;
    if (!target || target.location !== 'board') return;

    await target.destroy();
  }
}
```

### Pattern 6: Self-Buff Ability

Ability that affects the card itself:

```typescript
{
  id: 'self-buff-ability',
  description: 'Give this minion +1/+1.',
  label: 'Self Buff',
  manaCost: 2,
  shouldExhaust: false,
  speed: CARD_SPEED.FAST,

  canUse(game, card) {
    return card.location === CARD_LOCATIONS.BOARD;
  },

  async getPreResponseTargets(game, card) {
    return [];
  },

  async onResolve(game, card, targets, ability) {
    await card.modifiers.add(
      new SimpleMinionStatsModifier('self-buff', game, card, {
        atk: 1,
        hp: 1
      })
    );
  }
}
```

## Advanced Topics

### Multiple Abilities

Cards can have multiple abilities:

```typescript
abilities: [
  {
    id: 'ability-1'
    // First ability
  },
  {
    id: 'ability-2'
    // Second ability
  }
];
```

### Abilities from Modifiers

Some keywords grant abilities through modifiers. The `ForesightModifier` is an example:

```typescript
async onInit(game, card) {
  // Foresight adds an ability through a modifier
  await card.modifiers.add(new ForesightModifier(game, card));
}
```

This uses `GrantAbilityModifierMixin` internally to add the ability.

### Hidden Abilities

Set `isHiddenOnCard: true` to hide an ability from the card display:

```typescript
{
  id: 'hidden-ability',
  isHiddenOnCard: true,  // Don't show on card
  // ... rest of ability
}
```

Used by keyword abilities that are already described in the card text.

### Ability State

The `ability` parameter in `onResolve` provides access to ability state:

```typescript
async onResolve(game, card, targets, ability) {
  // Seal the ability (prevent future use)
  ability.seal();

  // Check if sealed
  if (ability.isSealed) {
    // Ability can't be used anymore
  }
}
```

### Speed System

**FAST** abilities:

- Can be used anytime during the action phase
- Can respond to opponent's actions
- Most combat abilities are FAST

**BURST** abilities:

- Can only be used during your turn
- Cannot be responded to
- Higher priority than FAST

```typescript
import { CARD_SPEED } from '../../../../card.enums';

speed: CARD_SPEED.FAST,   // Responsive
speed: CARD_SPEED.BURST,  // Your turn only
```

### Exhaust Behavior

`shouldExhaust` controls whether the card exhausts when ability is used:

```typescript
shouldExhaust: true,   // Card exhausts (can't attack)
shouldExhaust: false,  // Card stays ready
```

Useful for balancing powerful effects - forcing exhaust prevents attacking the same turn.

## Real World Example

From [`little-witch.ts`](../src/card/sets/core/arcane/minions/little-witch.ts):

```typescript
export const littleWitch: MinionBlueprint = {
  id: 'little-witch',
  kind: CARD_KINDS.MINION,
  name: 'Little Witch',
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  // ... other properties

  abilities: [
    {
      id: 'little-witch-ability-1',
      description: 'Deal 1 damage to an enemy minion. @Seal@ this ability.',
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
        if (!target) return;
        if (target.location !== 'board') return;

        await target.takeDamage(card, new AbilityDamage(1));
        ability.seal(); // Can only use once
      }
    }
  ],

  async onInit() {},
  async onPlay() {}
};
```

## Tips and Best Practices

1. **Always check `card.location === CARD_LOCATIONS.BOARD`** in `canUse`
2. **Validate targets in `onResolve`** - they might have moved/died
3. **Use consistent naming** - prefix ability IDs with card ID
4. **Consider timing** - FAST for combat tricks, BURST for setup
5. **Balance with `shouldExhaust`** - prevent double attacks with powerful effects
6. **Use `ability.seal()`** for one-time abilities
7. **Keep labels short** - they appear on UI buttons
8. **Use the correct origin** - `{ type: 'ability', card, abilityId }`
9. **Test edge cases** - What if player can't pay cost? Target is gone?
10. **Match predicates** - Same logic in `canUse` and `getPreResponseTargets`

## See Also

- [Card Implementation Guide](./CARD_IMPLEMENTATION_GUIDE.md)
- [Targeting and Interactions](./TARGETING_AND_INTERACTIONS.md)
- [Damage and Combat](./DAMAGE_AND_COMBAT.md)
- [Modifiers and Keywords](./MODIFIERS_AND_KEYWORDS.md)
