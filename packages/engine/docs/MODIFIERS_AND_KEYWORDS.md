# Modifiers and Keywords

This guide explains the modifier system and how to apply keywords to cards.

## Table of Contents

- [What are Modifiers?](#what-are-modifiers)
- [When to Use Modifiers](#when-to-use-modifiers)
- [Available Modifiers](#available-modifiers)
- [Applying Modifiers](#applying-modifiers)
- [Modifier Mixins](#modifier-mixins)
- [Creating Custom Modifiers](#creating-custom-modifiers)

## What are Modifiers?

Modifiers are reusable effects that can be attached to cards. They handle keywords (like Rush, Stealth), stat changes, and complex behaviors. Modifiers are the primary way to add gameplay mechanics to cards.

**Key Concepts:**

- Modifiers live in the card's `modifiers` manager
- They can be permanent or temporary
- They can be conditional (enabled/disabled based on game state)
- Multiple modifiers can stack on the same card

## When to Use Modifiers

### Use Modifiers For:

- **Keywords**: Rush, Stealth, Vigilant, Overwhelm, etc.
- **Stat buffs**: +X ATK, +X HP
- **Cost modifications**: Reduce mana cost
- **Event listeners**: On death, on enter, on attack
- **Conditional effects**: "While X condition is true..."

### DON'T Use Modifiers For:

- One-time spell effects (use `onPlay` instead)
- Card targeting logic (use `canPlay` and `getPreResponseTargets`)

## Available Modifiers

Here's a comprehensive list of modifiers available in [`modifier/modifiers/`](../src/modifier/modifiers/):

### Combat Keywords

| Modifier                     | Description                               | Usage                                       |
| ---------------------------- | ----------------------------------------- | ------------------------------------------- |
| **RushModifier**             | Can attack immediately after being played | `new RushModifier(game, card)`              |
| **StealthModifier**          | Cannot be targeted by enemies             | `new StealthModifier(game, card)`           |
| **VigilantModifier**         | Doesn't exhaust when retaliating          | `new VigilantModifier(game, card)`          |
| **PreemptiveStrikeModifier** | Attacks first in combat                   | `new PreemptiveStrikeModifier(game, card)`  |
| **OverwhelmModifier**        | Excess damage goes to enemy hero          | `new OverwhelmModifier(game, card)`         |
| **DoubleAttackModifier**     | Can attack twice per turn                 | `new DoubleAttackModifier(game, card)`      |
| **ToughModifier**            | Takes reduced damage                      | `new ToughModifier(game, card, { amount })` |

### Cost Modifiers

| Modifier                      | Description         | Usage                                                       |
| ----------------------------- | ------------------- | ----------------------------------------------------------- |
| **SimpleManacostModifier**    | Modify mana cost    | `new SimpleManacostModifier(id, game, card, { amount })`    |
| **SimpleDestinycostModifier** | Modify destiny cost | `new SimpleDestinycostModifier(id, game, card, { amount })` |

### Stat Modifiers

| Modifier                         | Description            | Usage                                                          |
| -------------------------------- | ---------------------- | -------------------------------------------------------------- |
| **SimpleAttackBuffModifier**     | Modify attack          | `new SimpleAttackBuffModifier(id, game, card, { amount })`     |
| **SimpleHealthBuffModifier**     | Modify health          | `new SimpleHealthBuffModifier(id, game, card, { amount })`     |
| **SimpleMinionStatsModifier**    | Modify both ATK and HP | `new SimpleMinionStatsModifier(id, game, card, { atk, hp })`   |
| **SimpleSpellpowerBuffModifier** | Increase spell damage  | `new SimpleSpellpowerBuffModifier(id, game, card, { amount })` |

### Triggered Effects

| Modifier             | Description                           | Usage                                                               |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| **OnEnterModifier**  | Trigger effect when card enters board | `new OnEnterModifier(game, card, { onEnter: async () => {...} })`   |
| **OnDeathModifier**  | Trigger effect when card dies         | `new OnDeathModifier(game, card, { onDeath: async () => {...} })`   |
| **OnAttackModifier** | Trigger effect when card attacks      | `new OnAttackModifier(game, card, { onAttack: async () => {...} })` |
| **OnHitModifier**    | Trigger effect when hit by attack     | `new OnHitModifier(game, card, { onHit: async () => {...} })`       |
| **OnKillModifier**   | Trigger effect when killing a unit    | `new OnKillModifier(game, card, { onKill: async () => {...} })`     |

### Special Mechanics

| Modifier              | Description                      | Usage                                         |
| --------------------- | -------------------------------- | --------------------------------------------- |
| **ForesightModifier** | Destiny deck interaction keyword | `new ForesightModifier(game, card)`           |
| **EmpowerModifier**   | Hero empowerment mechanic        | `new EmpowerModifier(game, card, { stacks })` |
| **BurnModifier**      | Deal damage over time            | `new BurnModifier(game, card, { amount })`    |
| **FreezeModifier**    | Prevent actions                  | `new FreezeModifier(game, card)`              |
| **EchoModifier**      | Return to hand after play        | `new EchoModifier(game, card)`                |
| **FleetingModifier**  | Discard at end of turn           | `new FleetingModifier(game, card)`            |
| **LockedModifier**    | Cannot be played                 | `new LockedModifier(game, card)`              |
| **LoyaltyModifier**   | Faction-specific restriction     | `new LoyaltyModifier(game, card)`             |
| **UniqueModifier**    | Only one copy allowed            | `new UniqueModifier(game, card)`              |

### Hero-Specific

| Modifier                 | Description               | Usage                                  |
| ------------------------ | ------------------------- | -------------------------------------- |
| **LevelBonusModifier**   | Stats based on hero level | `new LevelBonusModifier(game, card)`   |
| **LineageBonusModifier** | Stats based on lineage    | `new LineageBonusModifier(game, card)` |

### State Modifiers

| Modifier              | Description                 | Usage                               |
| --------------------- | --------------------------- | ----------------------------------- |
| **SummoningSickness** | Cannot attack on first turn | `new SummoningSickness(game, card)` |
| **AttackerModifier**  | Mark as attacker in combat  | System-applied                      |
| **DefenderModifier**  | Mark as defender in combat  | System-applied                      |

## Applying Modifiers

### In `onInit` (Permanent Effects)

Apply modifiers in `onInit` for effects that should exist for the card's entire lifetime:

```typescript
async onInit(game, card) {
  // Permanent keywords
  await card.modifiers.add(new RushModifier(game, card));
  await card.modifiers.add(new StealthModifier(game, card));
}
```

### In `onPlay` (Temporary or Triggered Effects)

Apply modifiers in `onPlay` for effects triggered when the card is played:

```typescript
async onPlay(game, card) {
  // Apply buff to another card
  const target = card.player.hero;
  await target.modifiers.add(
    new SimpleAttackBuffModifier('buff-id', game, card, { amount: 2 })
  );
}
```

### Duration Control

Use modifier mixins to control how long a modifier lasts:

```typescript
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

// Buff lasts until end of turn
await target.modifiers.add(
  new SimpleAttackBuffModifier('temp-buff', game, card, {
    amount: 2,
    mixins: [new UntilEndOfTurnModifierMixin(game)]
  })
);
```

## Modifier Mixins

Mixins are the way to implement modifier behavior. they offer a composable way to create complex effect. They are passed in the `mixins` option when creating a modifier.

### Available Mixins

Located in [`modifier/mixins/`](../src/modifier/mixins/):

#### UntilEndOfTurnModifierMixin

Makes a modifier expire at the end of the current turn.

```typescript
new SimpleAttackBuffModifier('temp-buff', game, card, {
  amount: 3,
  mixins: [new UntilEndOfTurnModifierMixin(game)]
});
```

#### TogglableModifierMixin

Makes a modifier conditionally active based on a predicate function.

```typescript
import { getEmpowerStacks } from '../../../../card-actions-utils';

// Only active while hero is empowered
new PreemptiveStrikeModifier(game, card, {
  mixins: [new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)]
});
```

#### GameEventModifierMixin

Listen to game events within a modifier.

```typescript
new GameEventModifierMixin(game, {
  [GAME_EVENTS.TURN_START]: async event => {
    // Do something on turn start
  }
});
```

#### GrantAbilityModifierMixin

Add an ability to a card through a modifier (used internally by keywords).

#### CardInterceptorModifierMixin

Intercept and modify card behavior (advanced usage).

#### WhileOnBoardModifierMixin

Make a modifier only active while the card is on the board.

```typescript
new WhileOnBoardModifierMixin(game);
```

## Common Patterns

### Pattern 1: Simple Keyword

```typescript
import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';

async onInit(game, card) {
  await card.modifiers.add(new RushModifier(game, card));
}
```

### Pattern 2: Temporary Stat Buff

```typescript
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

// In a spell's onPlay:
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;
  await target.modifiers.add(
    new SimpleAttackBuffModifier('spell-buff', game, card, {
      amount: 3,
      mixins: [new UntilEndOfTurnModifierMixin(game)]
    })
  );
}
```

### Pattern 3: Conditional Effect

```typescript
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

async onInit(game, card) {
  // +2 ATK while you have 5+ mana
  await card.modifiers.add(
    new SimpleAttackBuffModifier('conditional-buff', game, card, {
      amount: 2,
      mixins: [
        new TogglableModifierMixin(game, () => card.player.cardManager.hand.length >= 5)
      ]
    })
  );
}
```

### Pattern 4: On Enter Effect

```typescript
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';

async onInit(game, card) {
  await card.modifiers.add(
    new OnEnterModifier(game, card, {
      async onEnter() {
        // Draw a card
        await card.player.cardManager.draw(1);
      }
    })
  );
}
```

### Pattern 5: Complex Keyword with Multiple Conditions

```typescript
import { PreemptiveStrikeModifier } from '../../../../../modifier/modifiers/preemptive-strike.mofier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { getEmpowerStacks } from '../../../../card-actions-utils';

async onInit(game, card) {
  // Has Preemptive Strike while empowered
  await card.modifiers.add(
    new PreemptiveStrikeModifier(game, card, {
      mixins: [
        new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)
      ]
    })
  );

  // Has +1 ATK while empowered
  await card.modifiers.add(
    new SimpleAttackBuffModifier('empower-buff', game, card, {
      amount: 1,
      mixins: [
        new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)
      ]
    })
  );
}
```

## Creating Custom Modifiers

For unique mechanics not covered by existing modifiers, create a custom modifier:

```typescript
import { Modifier } from '../modifier.entity';
import type { Game } from '../../game/game';
import type { MinionCard } from '../../card/entities/minion.entity';

export class MyCustomModifier extends Modifier<MinionCard> {
  constructor(game: Game, source: AnyCard) {
    super('my-custom-modifier-id', game, source, {
      isUnique: true, // Only one instance per card
      mixins: [] // add behavior here. DO NOT override the modifier's onApply and onRemoved methods
    });
  }

  // Add custom behavior
  getCustomValue(): number {
    return 42;
  }
}
```

Then use it:

```typescript
async onInit(game, card) {
  await card.modifiers.add(new MyCustomModifier(game, card));
}
```

## Tips and Best Practices

1. **Use existing modifiers** whenever possible - don't reinvent the wheel
2. **Prefer `onInit` for permanent effects** - ensures they exist immediately
3. **Use mixins for timing control** - UntilEndOfTurnModifierMixin, TogglableModifierMixin
4. **Make modifier IDs unique** - use card ID as prefix: `'${card.id}-buff'`
5. **Check for duplicates** - set `isUnique: true` if only one should exist
6. **Clean up properly** - temporary effects should use appropriate mixins
7. **Test edge cases** - what happens when the source card dies?

## See Also

- [Card Implementation Guide](./CARD_IMPLEMENTATION_GUIDE.md)
- [Targeting and Interactions](./TARGETING_AND_INTERACTIONS.md)
- [Abilities System](./ABILITIES_SYSTEM.md)
