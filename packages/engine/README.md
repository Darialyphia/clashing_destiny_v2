# @game/engine

The game engine package containing all core game logic, card implementations, and systems.

## Overview

This package contains:

- **Card System** - All card implementations, blueprints, and card-related utilities
- **Game Logic** - Core game loop, phases, and state management
- **Modifier System** - Buffs, debuffs, and keyword implementations
- **Combat System** - Damage, attacks, and combat resolution
- **Player System** - Player state, resources, and actions
- **Board System** - Card zones and board management

## Quick Start

### Setup

```bash
npm i
npm run dev
# Navigate to http://localhost:573
```

### Implementing a New Card

See the [Card Implementation Guide](./docs/CARD_IMPLEMENTATION_GUIDE.md) for a complete walkthrough.

**Quick example:**

```typescript
import type { MinionBlueprint } from './card/card-blueprint';
import { CARD_KINDS, CARD_SPEED, FACTIONS, RARITIES } from './card/card.enums';

export const myMinion: MinionBlueprint = {
  id: 'my-minion',
  kind: CARD_KINDS.MINION,
  name: 'My Minion',
  description: 'A simple minion.',
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  speed: CARD_SPEED.SLOW,
  // ... other required properties
  abilities: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
```

## Documentation

Comprehensive guides for implementing cards and game mechanics:

### Core Guides

- **[Card Implementation Guide](./docs/CARD_IMPLEMENTATION_GUIDE.md)** - Step-by-step guide to creating new cards
- **[Card Manipulation](./docs/CARD_MANIPULATION.md)** - Drawing, discarding, and moving cards between zones
- **[Modifiers and Keywords](./docs/MODIFIERS_AND_KEYWORDS.md)** - How to use and apply modifiers (Rush, Stealth, buffs, etc.)
- **[Targeting and Interactions](./docs/TARGETING_AND_INTERACTIONS.md)** - Card targeting system and player interaction
- **[Abilities System](./docs/ABILITIES_SYSTEM.md)** - Implementing activated abilities on cards
- **[Damage and Combat](./docs/DAMAGE_AND_COMBAT.md)** - Damage types, combat mechanics, and card states
- **[Game Phases and Events](./docs/GAME_PHASES_AND_EVENTS.md)** - Phase system, combat phase details, and event handling

### Quick Links

- [How to Draw Cards](./docs/CARD_MANIPULATION.md#drawing-cards) - **Important:** Use `player.cardManager.draw()` not `player.drawCards()`
- [Accessing Combat Phase](./docs/GAME_PHASES_AND_EVENTS.md#accessing-phase-context) - **Important:** Use `game.gamePhaseSystem.getContext()` not `game.combatPhase`
- [Available Modifiers](./docs/MODIFIERS_AND_KEYWORDS.md#available-modifiers)
- [Pre-built Targeting Rules](./docs/TARGETING_AND_INTERACTIONS.md#pre-built-targeting-rules)
- [Common Card Patterns](./docs/CARD_IMPLEMENTATION_GUIDE.md#common-patterns)
- [Damage Types](./docs/DAMAGE_AND_COMBAT.md#damage-types)

## Project Structure

```
src/
├── card/               # Card system
│   ├── sets/          # Card implementations organized by set
│   │   └── core/      # Core set cards
│   │       ├── arcane/    # Arcane faction
│   │       └── neutral/   # Neutral cards
│   ├── entities/      # Card entity classes
│   ├── components/    # Card component systems
│   └── card-blueprint.ts  # Card type definitions
├── game/              # Game logic and phases
├── player/            # Player state and actions
├── board/             # Board and zone management
├── modifier/          # Modifier system
│   ├── modifiers/     # Keyword and buff implementations
│   └── mixins/        # Modifier behavior mixins
└── utils/             # Shared utilities

docs/                  # Documentation guides
```

## Development Workflow

1. **Create card file** in appropriate folder (e.g., `src/card/sets/core/arcane/minions/`)
2. **Implement blueprint** following the card type interface
3. **Run the card watcher** with `npm run dev` to auto-update the set file and regenerate the card dictionary
4. **Test in game** using the dev server

## Testing

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
```

## Best Practices

- Use pre-built targeting helpers from `card-utils.ts` when possible
- Apply permanent keywords in `onInit`, not `onPlay`
- Always validate targets exist before applying effects
- Use TypeScript type guards (`isMinion`, `isSpell`, etc.)
- Follow the naming conventions for files and IDs

## Contributing

When implementing new cards:

1. Follow the patterns in existing cards
2. Use appropriate damage types (SpellDamage vs AbilityDamage)
3. Test edge cases (target dies, can't pay cost, etc.)
4. Document unusual mechanics in card description

## Resources

- [Design Document](../../docs/DESIGN_DOCUMENT_V2.md)
- [Core Set Card List](../../docs/CORE_SET.md)
- [AI Coding Guidelines](../../docs/AI_CODING_GUIDELINES.md)
