# Game Phases and Events

This guide explains the game phase system, how to access phase context, and how to properly handle game events in modifiers.

## Table of Contents

- [Game Phase System](#game-phase-system)
- [Accessing Phase Context](#accessing-phase-context)
- [Combat Phase Details](#combat-phase-details)
- [Common Events](#common-events)
- [Event Handling in Modifiers](#event-handling-in-modifiers)
- [Common Mistakes](#common-mistakes)

## Game Phase System

The game progresses through phases each turn. The phase system is accessed via `game.gamePhaseSystem`.

### Available Phases

Located in [`game/game.enums.ts`](../src/game/game.enums.ts):

```typescript
GAME_PHASES = {
  DRAW: 'draw_phase',
  MAIN: 'main_phase',
  ATTACK: 'attack_phase',
  END: 'end_phase',
  GAME_END: 'game_end'
};
```

### Phase Flow

1. **Draw Phase** - Draw cards, start of turn effects
2. **Main Phase** - Play cards, use abilities
3. **Attack Phase** - Declare attackers and blockers, resolve combat
4. **End Phase** - End of turn effects, cleanup
5. **Game End** - Game over state

## Accessing Phase Context

### The Correct Way

```typescript
const phaseContext = game.gamePhaseSystem.getContext();
```

### Phase Context Type

The `GamePhaseContext` is a discriminated union based on the current phase:

```typescript
type GamePhaseContext =
  | { state: 'draw_phase'; ctx: DrawPhase }
  | { state: 'main_phase'; ctx: MainPhase }
  | { state: 'attack_phase'; ctx: CombatPhase }
  | { state: 'end_phase'; ctx: EndPhase }
  | { state: 'game_end'; ctx: GameEndPhase };
```

### Checking Current Phase

```typescript
import { GAME_PHASES } from '../../game/game.enums';

const phaseContext = game.gamePhaseSystem.getContext();

if (phaseContext.state === GAME_PHASES.ATTACK) {
  // We're in attack phase
  const combatPhase = phaseContext.ctx; // Type: CombatPhase
}

// if the current phase has lready been checked in advance, use the generic instead
const combatContext = game.gamePhaseSystem.getContext<'attack_phase'>();
```

### Getting Current Phase State

```typescript
const currentPhase = game.gamePhaseSystem.getState();
// Returns: 'draw_phase' | 'main_phase' | 'attack_phase' | 'end_phase' | 'game_end'
```

## Combat Phase Details

The combat phase (`CombatPhase`) has specific properties that are only available during the attack phase.

### Combat Phase Structure

Located in [`game/phases/combat.phase.ts`](../src/game/phases/combat.phase.ts):

```typescript
class CombatPhase {
  attacker: Attacker; // The attacking card
  target: AttackTarget | null; // The declared attack target
  blocker: AttackTarget | null; // The blocking card (if any)
  isTargetRetaliating: boolean;
  potentialTargets: AttackTarget[];
}
```

### Key Distinctions

**Attacker** - The card that declared the attack

- Always a minion or hero
- Gets exhausted when attacking (unless Vigilant)

**Target** - The card/hero being attacked

- Initially declared by the attacker
- Could be the enemy hero or a minion

**Blocker** - A minion that intercepts the attack

- Optional - may be `null`
- If present, takes the hit instead of the target
- Gets exhausted when blocking (unless Vigilant)

### Accessing Combat Phase Data

```typescript
import { GAME_PHASES } from '../../game/game.enums';

const phaseContext = game.gamePhaseSystem.getContext();

if (phaseContext.state === GAME_PHASES.ATTACK) {
  const combatPhase = phaseContext.ctx;

  const attacker = combatPhase.attacker;
  const target = combatPhase.target;
  const blocker = combatPhase.blocker; // May be null

  // The actual defender is blocker if present, otherwise target
  const defender = blocker ?? target;
}
```

### Combat Flow Example

```
1. Player declares attacker (a minion)
2. Attacker declares target (enemy hero)
3. Opponent declares blocker (a minion)
4. Combat resolves:
   - Attacker deals damage to blocker (not original target)
   - Blocker deals damage back to attacker
   - Original target (hero) takes no damage
```

## Common Events

All events are defined in [`game/game.events.ts`](../src/game/game.events.ts).

### Combat Events

Located in [`game/phases/combat.phase.ts`](../src/game/phases/combat.phase.ts):

```typescript
COMBAT_EVENTS = {
  BEFORE_DECLARE_ATTACK: 'combat.before-declare-attack',
  AFTER_DECLARE_ATTACK: 'combat.after-declare-attack',
  BEFORE_DECLARE_ATTACK_TARGET: 'combat.before-declare-attack-target',
  AFTER_DECLARE_ATTACK_TARGET: 'combat.after-declare-attack-target',
  BEFORE_RESOLVE_COMBAT: 'combat.before-resolve-combat',
  AFTER_RESOLVE_COMBAT: 'combat.after-resolve-combat',
  ATTACK_FIZZLED: 'combat.attack-fizzled'
};
```

#### AFTER_RESOLVE_COMBAT Event

```typescript
class AfterResolveCombatEvent {
  data: {
    attacker: Attacker;
    target: AttackTarget; // NOT the blocker!
  };
}
```

**Important:** The event data only includes `attacker` and `target`. To access the blocker, you must get it from the combat phase context.

### Card Events

```typescript
CARD_EVENTS = {
  CARD_ADD_TO_HAND: 'card.add-to-hand',
  CARD_DISCARD: 'card.discard',
  CARD_BEFORE_CHANGE_LOCATION: 'card.before-change-location',
  CARD_AFTER_CHANGE_LOCATION: 'card.after-change-location'
  // ... more
};
```

### Player Events

```typescript
PLAYER_EVENTS = {
  PLAYER_BEFORE_DRAW: 'player.before-draw',
  PLAYER_AFTER_DRAW: 'player.after-draw',
  PLAYER_MANA_SPENT: 'player.mana-spent'
  // ... more
};
```

### Turn Events

```typescript
TURN_EVENTS = {
  TURN_START: 'turn.start',
  TURN_END: 'turn.end'
};
```

### Minion Events

```typescript
MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_DEATH: 'minion.death',
  MINION_DESTROYED: 'minion.destroyed'
};
```

## Event Handling in Modifiers

### Using GameEventModifierMixin

The `GameEventModifierMixin` lets modifiers listen to game events.

```typescript
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { GAME_EVENTS } from '../../game/game.events';

new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
  handler: async event => {
    // Handle the event
  }
});
```

### Accessing Phase Context in Event Handlers

```typescript
new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
  handler: async event => {
    // Get current phase context
    const phaseContext = game.gamePhaseSystem.getContext();

    // Check we're in the right phase
    if (phaseContext.state !== GAME_PHASES.ATTACK) return;

    // Access phase-specific data
    const combatPhase = phaseContext.ctx;
    const blocker = combatPhase.blocker;
  }
});
```

### Example: Vigilant Modifier

From [`modifier/modifiers/vigilant.modifier.ts`](../src/modifier/modifiers/vigilant.modifier.ts):

```typescript
new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
  handler: async event => {
    // Get phase context to access blocker
    const phaseContext = game.gamePhaseSystem.getContext();
    if (phaseContext.state !== GAME_PHASES.ATTACK) return;

    // Get the blocker from combat phase
    const blocker = phaseContext.ctx.blocker;
    if (!blocker || !blocker.equals(this.target)) return;

    // Wake up the blocker after combat
    if (blocker.isAlive) {
      await blocker.wakeUp();
    }
  }
});
```

### Example: On Enter Effect

```typescript
new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.MINION_SUMMONED,
  handler: async event => {
    const summonedMinion = event.data.card;

    // Check if it's our card
    if (!summonedMinion.equals(this.target)) return;

    // Do something when this card enters
    await card.player.cardManager.draw(1);
  }
});
```

### Example: Turn Start Effect

```typescript
new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.TURN_START,
  handler: async event => {
    // Only trigger on card owner's turn
    if (!event.data.player.equals(this.target.player)) return;

    // Do something at start of turn
    await this.target.modifiers.add(
      new SimpleAttackBuffModifier('turn-buff', game, this.source, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
});
```

## Common Mistakes

### ❌ WRONG - Accessing Non-Existent Properties

```typescript
// These DO NOT exist!
const combatPhase = game.combatPhase; // ❌ No such property
const blocker = event.data.blocker; // ❌ Not in event data
```

### ✅ CORRECT - Using Phase System

```typescript
// Access through phase system
const phaseContext = game.gamePhaseSystem.getContext();
if (phaseContext.state === GAME_PHASES.ATTACK) {
  const blocker = phaseContext.ctx.blocker; // ✅ Correct
}
```

### ❌ WRONG - Assuming Event Has All Data

```typescript
new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
  handler: async event => {
    // Blocker is NOT in event.data!
    const blocker = event.data.blocker; // ❌ Undefined
  }
});
```

### ✅ CORRECT - Getting Data from Phase Context

```typescript
new GameEventModifierMixin(game, {
  eventName: GAME_EVENTS.AFTER_RESOLVE_COMBAT,
  handler: async event => {
    const phaseContext = game.gamePhaseSystem.getContext();
    if (phaseContext.state !== GAME_PHASES.ATTACK) return;

    const blocker = phaseContext.ctx.blocker; // ✅ Correct
  }
});
```

### ❌ WRONG - Confusing Target and Blocker

```typescript
// The target is the initially declared attack target
// The blocker is the card that intercepted (if any)
const defender = event.data.target; // ❌ Not necessarily who took damage
```

### ✅ CORRECT - Getting Actual Defender

```typescript
const phaseContext = game.gamePhaseSystem.getContext();
if (phaseContext.state === GAME_PHASES.ATTACK) {
  const combatPhase = phaseContext.ctx;
  // Actual defender is blocker if present, otherwise target
  const defender = combatPhase.blocker ?? combatPhase.target; // ✅ Correct
}
```

## Phase Transitions

### Listening to Phase Changes

```typescript
import { GAME_EVENTS } from '../../game/game.events';

game.on(GAME_EVENTS.AFTER_CHANGE_PHASE, event => {
  console.log(`Phase changed from ${event.data.from} to ${event.data.to.state}`);

  if (event.data.to.state === GAME_PHASES.ATTACK) {
    // Entering attack phase
  }
});
```

### Triggering Phase Transitions

```typescript
await game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DECLARE_ATTACK);
```

## Best Practices

1. **Always check phase state** before accessing phase-specific context
2. **Use getContext()** instead of trying to access phases directly
3. **Remember event data limitations** - not all information is in the event
4. **Access blocker from phase context**, not from event data
5. **Check for null** - blocker might not exist (direct attack to hero/minion)
6. **Verify card state** - cards might be dead or moved by the time event fires
7. **Use GAME_PHASES constants** instead of string literals

## Type Safety

The phase context is type-safe through discriminated unions:

```typescript
const phaseContext = game.gamePhaseSystem.getContext();

// TypeScript knows ctx type based on state
if (phaseContext.state === GAME_PHASES.ATTACK) {
  // phaseContext.ctx is CombatPhase here
  const blocker = phaseContext.ctx.blocker; // ✅ Type-safe
}

if (phaseContext.state === GAME_PHASES.MAIN) {
  // phaseContext.ctx is MainPhase here
  // blocker doesn't exist on MainPhase
}
```

## Debugging Tips

### Log Current Phase

```typescript
console.log('Current phase:', game.gamePhaseSystem.getState());
```

### Log Combat State

```typescript
const phaseContext = game.gamePhaseSystem.getContext();
if (phaseContext.state === GAME_PHASES.ATTACK) {
  const combat = phaseContext.ctx;
  console.log({
    attacker: combat.attacker?.name,
    target: combat.target?.name,
    blocker: combat.blocker?.name ?? 'none'
  });
}
```

### Check If Phase Exists

```typescript
try {
  const phaseContext = game.gamePhaseSystem.getContext();
  // Use phase context
} catch (error) {
  console.error('Phase context error:', error);
}
```

## See Also

- [Modifiers and Keywords](./MODIFIERS_AND_KEYWORDS.md)
- [Damage and Combat](./DAMAGE_AND_COMBAT.md)
- [Card Implementation Guide](./CARD_IMPLEMENTATION_GUIDE.md)
