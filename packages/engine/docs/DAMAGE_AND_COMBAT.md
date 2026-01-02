# Damage and Combat

This guide explains the damage system and combat mechanics in the game engine.

## Table of Contents

- [Damage Types](#damage-types)
- [Dealing Damage](#dealing-damage)
- [Combat System](#combat-system)
- [Card States](#card-states)
- [Common Patterns](#common-patterns)

## Damage Types

The game has different types of damage, each with unique behavior. Damage classes are defined in [`utils/damage.ts`](../src/utils/damage.ts).

### CombatDamage

Damage dealt during combat when a minion attacks.

```typescript
import { CombatDamage } from '../../../../../utils/damage';

// Created automatically during combat phase
// Based on attacker's ATK stat
```

**Characteristics:**

- Amount equals attacker's ATK
- Can be modified by combat modifiers (Tough, etc.)
- Triggers "on attack" and "on hit" effects

### SpellDamage

Damage dealt by spell cards.

```typescript
import { SpellDamage } from '../../../../../utils/damage';

await target.takeDamage(card, new SpellDamage(3, card));
```

**Characteristics:**

- Base amount specified in code
- **Increased by spell power** - Hero's spell power is added automatically
- Can be prevented by effects
- Type: `DAMAGE_TYPES.SPELL`

**Example:**

```typescript
// Hero has 2 spell power
const damage = new SpellDamage(3, spellCard);
// Target receives: 3 (base) + 2 (spell power) = 5 damage
```

### AbilityDamage

Damage dealt by card abilities.

```typescript
import { AbilityDamage } from '../../../../../utils/damage';

await target.takeDamage(card, new AbilityDamage(2));
```

**Characteristics:**

- Fixed amount
- NOT affected by spell power
- Can be prevented by effects
- Type: `DAMAGE_TYPES.ABILITY`

### UnpreventableDamage

Damage that cannot be prevented or modified.

```typescript
import { UnpreventableDamage } from '../../../../../utils/damage';

await target.takeDamage(card, new UnpreventableDamage(5));
```

**Characteristics:**

- Always deals exact amount
- Ignores damage prevention
- Ignores modifiers (Tough, armor, etc.)
- Type: `DAMAGE_TYPES.UNPREVENTABLE`

## Dealing Damage

### Basic Damage

Use `takeDamage()` method on the target:

```typescript
import { SpellDamage } from '../../../../../utils/damage';

async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;
  await target.takeDamage(card, new SpellDamage(3, card));
}
```

### Damage to Multiple Targets

```typescript
async onPlay(game, card, targets) {
  for (const target of targets as MinionCard[]) {
    await target.takeDamage(card, new SpellDamage(2, card));
  }
}
```

### Conditional Damage

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  // Deal extra damage if target is damaged
  const amount = target.damage > 0 ? 5 : 3;
  await target.takeDamage(card, new SpellDamage(amount, card));
}
```

### Area of Effect (AoE) Damage

```typescript
async onPlay(game, card) {
  // Damage all enemy minions
  for (const minion of card.player.enemyMinions) {
    await minion.takeDamage(card, new SpellDamage(2, card));
  }
}
```

## Combat System

### Attack Flow

When a minion attacks:

1. **Declare Attack** - Attacker selected
2. **Declare Blocker** - Defender selected (if any)
3. **Combat Phase** - Damage dealt
4. **Resolution** - Death checks, triggers

### Attacking

Cards attack automatically during the combat phase if they're ready. Combat is managed by the game system, but you can affect it with modifiers and abilities.

### Exhaust System

Cards become "exhausted" after taking certain actions:

```typescript
// Exhaust a card
await card.exhaust();

// Check if exhausted
if (card.isExhausted) {
  // Can't attack or use shouldExhaust abilities
}

// Cards refresh at start of turn
```

**When cards exhaust:**

- After attacking (unless has Vigilant)
- When using an ability with `shouldExhaust: true`
- When affected by certain effects

### Can Attack Check

```typescript
// Check if a minion can attack
if (card.canAttack()) {
  // Minion is ready to attack
}
```

Minions cannot attack if:

- They're exhausted
- They have summoning sickness (unless has Rush)
- They have 0 ATK
- They're frozen or locked

## Card States

### Summoning Sickness

Newly summoned minions can't attack until next turn (unless they have Rush):

```typescript
// Applied automatically when minion enters play
// Removed at start of your next turn
```

### Ready vs Exhausted

```typescript
// Check state
if (!card.isExhausted) {
  // Card is ready
}

// Exhaust manually
await card.exhaust();

// Cards refresh automatically at turn start
```

### Damage Tracking

```typescript
// Current damage on card
const currentDamage = card.damage;

// Remaining health
const remainingHp = card.hp; // maxHp - damage

// Check if damaged
if (card.damage > 0) {
  // Card has taken damage
}

// Check if would die
if (card.damage >= card.maxHp) {
  // Card will be destroyed
}
```

### Destruction and Death

```typescript
// Destroy a card
await card.destroy();

// Cards are destroyed when:
// - damage >= maxHp
// - destroy() is called explicitly
// - destroyed by an effect
```

## Common Patterns

### Pattern 1: Direct Damage Spell

Simple damage to a target:

```typescript
import { SpellDamage } from '../../../../../utils/damage';
import { singleEnemyTargetRules } from '../../../../card-utils';

export const directDamage: SpellBlueprint = {
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
    const target = targets[0] as MinionCard | HeroCard;
    await target.takeDamage(card, new SpellDamage(5, card));
  }
};
```

### Pattern 2: AoE Damage

Damage all enemies:

```typescript
import { SpellDamage } from '../../../../../utils/damage';

export const aoeSpell: SpellBlueprint = {
  // ...
  canPlay: () => true, // No targeting needed
  async getPreResponseTargets() {
    return [];
  },
  async onPlay(game, card) {
    // Damage all enemy minions
    for (const minion of card.player.enemyMinions) {
      await minion.takeDamage(card, new SpellDamage(2, card));
    }

    // Also damage enemy hero
    await card.player.opponent.hero.takeDamage(card, new SpellDamage(2, card));
  }
};
```

### Pattern 3: Damage and Exhaust

Combine damage with exhaust (like Lightning Bolt):

```typescript
import { SpellDamage } from '../../../../../utils/damage';

async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;
  await target.takeDamage(card, new SpellDamage(2, card));
  await target.exhaust();  // Also exhaust the target
}
```

### Pattern 4: Conditional Execution

Deal damage and destroy if health is low:

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  await target.takeDamage(card, new SpellDamage(3, card));

  // If target survives but has 1 HP, destroy it
  if (target.hp === 1 && target.location === 'board') {
    await target.destroy();
  }
}
```

### Pattern 5: Damage Based on Stats

Variable damage based on card stats:

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  // Deal damage equal to your hero's ATK
  const damageAmount = card.player.hero.atk;
  await target.takeDamage(card, new SpellDamage(damageAmount, card));
}
```

### Pattern 6: Lifesteal Effect

Deal damage and restore health:

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;
  const damageAmount = 3;

  await target.takeDamage(card, new SpellDamage(damageAmount, card));

  // Heal your hero for the same amount
  await card.player.hero.heal(damageAmount);
}
```

### Pattern 7: Overkill Damage

Deal excess damage to hero (like Overwhelm):

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;
  const damageAmount = 5;

  const healthBefore = target.hp;
  await target.takeDamage(card, new SpellDamage(damageAmount, card));

  // If target died, deal excess to enemy hero
  if (target.location !== 'board') {
    const overkill = Math.max(0, damageAmount - healthBefore);
    if (overkill > 0) {
      await card.player.opponent.hero.takeDamage(
        card,
        new SpellDamage(overkill, card)
      );
    }
  }
}
```

### Pattern 8: Ability Damage (Not Affected by Spell Power)

Use AbilityDamage for fixed amounts:

```typescript
import { AbilityDamage } from '../../../../../utils/damage';

async onResolve(game, card, targets, ability) {
  const target = targets[0] as MinionCard;
  // Exactly 1 damage, not affected by spell power
  await target.takeDamage(card, new AbilityDamage(1));
}
```

### Pattern 9: Unpreventable Damage

Damage that ignores all modifiers:

```typescript
import { UnpreventableDamage } from '../../../../../utils/damage';

async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;
  // Ignores Tough, armor, prevention effects
  await target.takeDamage(card, new UnpreventableDamage(3));
}
```

### Pattern 10: Multi-Hit (Same Target)

Deal multiple instances of damage:

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  // Deal 1 damage three times (each can trigger effects)
  for (let i = 0; i < 3; i++) {
    if (target.location !== 'board') break;  // Stop if target dies
    await target.takeDamage(card, new SpellDamage(1, card));
  }
}
```

## Important Considerations

### Death Timing

Cards don't die immediately when damage >= maxHp. Death is checked after all effects resolve:

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  await target.takeDamage(card, new SpellDamage(10, card));

  // Target might still be on board here!
  // Death is processed after this function completes

  // Always check location before continuing
  if (target.location === 'board') {
    // Target survived or hasn't been removed yet
  }
}
```

### Spell Power

SpellDamage automatically adds the hero's spell power:

```typescript
// If hero has 3 spell power:
new SpellDamage(2, card); // Actually deals 2 + 3 = 5 damage

// For fixed amounts, use AbilityDamage:
new AbilityDamage(2); // Always deals exactly 2
```

### Damage Modifiers

Damage can be modified by:

- **Tough** modifier - Reduces incoming damage
- **Armor** effects - Prevents damage
- **Prevention** effects - Blocks damage entirely
- **Spell power** - Increases spell damage (hero stat)

```typescript
// These are handled automatically in takeDamage()
// You don't need to account for them manually
```

### Target Validation

Always validate targets before dealing damage:

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  // Check target still exists
  if (!target) return;

  // Check target is still on board
  if (target.location !== 'board') return;

  // Now safe to damage
  await target.takeDamage(card, new SpellDamage(3, card));
}
```

## Healing

While not technically damage, healing is related:

```typescript
// Heal a card
await card.heal(3);

// Card's damage is reduced by the heal amount
// Cannot heal above maxHp
```

## Tips and Best Practices

1. **Use the correct damage type** - SpellDamage for spells, AbilityDamage for abilities
2. **Validate targets** - Check `target.location === 'board'` before damage
3. **Handle death gracefully** - Targets might die mid-effect
4. **Remember spell power** - SpellDamage is automatically increased
5. **Check for overkill** - Store HP before damage if you need to calculate excess
6. **Use UnpreventableDamage sparingly** - It ignores all protections
7. **Don't manually check for death** - The system handles it automatically
8. **Consider timing** - Multiple damage instances trigger effects separately
9. **Test with modifiers** - Ensure your damage works with Tough, Stealth, etc.
10. **Document unusual behavior** - If your damage works differently, explain in description

## See Also

- [Card Implementation Guide](./CARD_IMPLEMENTATION_GUIDE.md)
- [Targeting and Interactions](./TARGETING_AND_INTERACTIONS.md)
- [Abilities System](./ABILITIES_SYSTEM.md)
- [Modifiers and Keywords](./MODIFIERS_AND_KEYWORDS.md)
