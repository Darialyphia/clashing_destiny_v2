# Card Manipulation Guide

This guide explains how to manipulate cards in the game - drawing, discarding, moving between zones, and more.

## Table of Contents

- [Common Mistakes](#common-mistakes)
- [CardManager API](#cardmanager-api)
- [Card Movement Methods](#card-movement-methods)
- [Card Zones](#card-zones)
- [Common Patterns](#common-patterns)
- [Summoning Minions](#summoning-minions)

## Common Mistakes

### ❌ WRONG - This will not work:

```typescript
await player.drawCards(3); // Method doesn't exist!
await card.player.drawCards(2); // Still wrong
```

### ✅ CORRECT - Use CardManager:

```typescript
await card.player.cardManager.draw(3);
```

## CardManager API

The `CardManager` is accessed via `player.cardManager` and handles all card zone operations.

### Location: `card/components/card-manager.component.ts`

### Card Zones

CardManager manages these zones:

```typescript
player.cardManager.hand; // Array<AnyCard>
player.cardManager.mainDeck; // Deck<AnyCard>
player.cardManager.destinyDeck; // Deck<AnyCard>
player.cardManager.discardPile; // Set<AnyCard>
player.cardManager.banishPile; // Set<AnyCard>
player.cardManager.destinyZone; // Set<AnyCard>
```

### Drawing Cards

#### draw(amount: number)

Draw cards from the main deck into hand.

```typescript
// Draw 2 cards
const cards = await card.player.cardManager.draw(2);

// cards is an array of the drawn cards
for (const drawnCard of cards) {
  // Do something with each card
}
```

**Behavior:**

- Respects max hand size (won't overdraw)
- Automatically adds cards to hand
- Fires `PLAYER_BEFORE_DRAW` and `PLAYER_AFTER_DRAW` events
- Returns empty array if hand is full or deck is empty

#### drawWithFilter(amount: number, filter: (card: AnyCard) => boolean)

Draw specific cards from the deck that match a filter.

```typescript
import { isMinion } from '../../../../card/card-utils';

// Draw 2 minions from deck
const minions = await card.player.cardManager.drawWithFilter(2, isMinion);
```

#### drawIntoDestinyZone(amount: number)

Draw cards from main deck directly into destiny zone (not hand).

```typescript
// Draw 1 card into destiny zone
await card.player.cardManager.drawIntoDestinyZone(1);
```

### Milling Cards

#### mill(amount: number)

Discard cards from the top of the deck directly to discard pile (without going to hand).

```typescript
// Mill 3 cards from opponent's deck
const milled = card.player.opponent.cardManager.mill(3);

// milled is an array of the discarded cards
```

### Discarding from Hand

#### discard(card: AnyCard)

Discard a specific card from hand.

```typescript
// Discard a card from hand
card.player.cardManager.discard(targetCard);
```

**Note:** This removes from hand AND sends to discard pile automatically.

### Finding Cards

#### findCard(id: string)

Find a card by ID across all zones.

```typescript
const result = card.player.cardManager.findCard('some-card-id');

if (result) {
  const { card, location } = result;
  // location is 'hand' | 'mainDeck' | 'destinyDeck' | 'discardPile' | etc.
}
```

#### getCardInHandById(id: string)

Get a specific card from hand by ID.

```typescript
const handCard = card.player.cardManager.getCardInHandById('card-id');
```

#### getCardInHandAt(index: number)

Get a card from hand by position.

```typescript
const firstCard = card.player.cardManager.getCardInHandAt(0);
```

### Zone Access

#### Accessing Cards in Zones

```typescript
// Cards in hand
const handCards = card.player.cardManager.hand;

// Cards in discard pile (it's a Set)
const discardPile = Array.from(card.player.cardManager.discardPile);

// Cards in banish pile
const banishPile = Array.from(card.player.cardManager.banishPile);

// Cards in destiny zone
const destinyZone = Array.from(card.player.cardManager.destinyZone);

// Cards remaining in main deck
const deckSize = card.player.cardManager.mainDeck.remaining;

// Access deck cards (avoid if possible - deck should be hidden)
const deckCards = card.player.cardManager.mainDeck.cards;
```

### Direct Zone Manipulation (Advanced)

These are lower-level methods. Usually prefer using Card methods instead.

```typescript
// Add to hand
player.cardManager.addToHand(card, index?);

// Remove from hand
player.cardManager.removeFromHand(card);

// Send to discard
player.cardManager.sendToDiscardPile(card);

// Send to banish
player.cardManager.sendToBanishPile(card);

// Send to destiny zone
player.cardManager.sendToDestinyZone(card);

// Remove from zones
player.cardManager.removeFromDiscardPile(card);
player.cardManager.removeFromBanishPile(card);
player.cardManager.removeFromDestinyZone(card);
```

## Card Movement Methods

Methods on the `Card` class to move cards between zones. These are **the preferred way** to move cards.

### Location: `card/entities/card.entity.ts`

### sendToDiscardPile()

Move this card to its owner's discard pile.

```typescript
await card.sendToDiscardPile();
```

**Behavior:**

- Removes card from current location
- Adds to original owner's discard pile
- Fires location change events
- Only works for main deck cards

**Example:**

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as AnyCard;
  // Destroy a card by sending it to discard
  await target.sendToDiscardPile();
}
```

### sendToBanishPile()

Move this card to its owner's banish pile (permanent removal).

```typescript
await card.sendToBanishPile();
```

**Behavior:**

- Removes card from current location
- Adds to original owner's banish pile
- Fires location change events
- Works for any card type
- Banished cards are permanently removed from the game

**Example:**

```typescript
async onPlay(game, card, targets) {
  // Permanently remove a card
  for (const target of targets) {
    await target.sendToBanishPile();
  }
}
```

### sendToDestinyZone()

Move this card to its owner's destiny zone.

```typescript
await card.sendToDestinyZone();
```

**Behavior:**

- Removes card from current location
- Adds to destiny zone
- Fires location change events
- Only works for main deck cards

**Example:**

```typescript
// Move a card from hand to destiny zone
const handCard = card.player.cardManager.getCardInHandAt(0);
await handCard.sendToDestinyZone();
```

### addToHand(index?: number)

Move this card to its owner's hand.

```typescript
await card.addToHand(); // Add to end of hand
await card.addToHand(0); // Add to specific position
```

**Behavior:**

- Removes card from current location
- Adds to owner's hand
- Fires location change events
- Only works for main deck cards
- Respects max hand size

**Example:**

```typescript
// Resurrect a minion from discard to hand
const minions = Array.from(card.player.cardManager.discardPile).filter(c => isMinion(c));

if (minions.length > 0) {
  await minions[0].addToHand();
}
```

### discard()

Discard this card from hand.

```typescript
await card.discard();
```

**Behavior:**

- Must be in hand
- Fires discard event
- Removes from hand and sends to discard pile
- Only works for main deck cards

**Example:**

```typescript
// Discard cards from hand
async onPlay(game, card) {
  const handCards = card.player.cardManager.hand.slice(0, 2);
  for (const handCard of handCards) {
    await handCard.discard();
  }
}
```

### Card Location Property

Check where a card currently is:

```typescript
const location = card.location;

// location can be:
// 'hand' | 'mainDeck' | 'destinyDeck' | 'board' |
// 'discardPile' | 'banishPile' | 'destinyZone' | null
```

## Card Zones

Understanding the different card zones:

### Main Deck

- Primary draw pile
- Main deck cards start here
- Accessed via `player.cardManager.mainDeck`

### Hand

- Cards available to play
- Array of cards: `player.cardManager.hand`
- Has max size limit

### Board

- Where minions, heroes, artifacts, and sigils are in play
- Accessed via `player.boardSide`
- Not part of CardManager

### Discard Pile

- Cards that have been used or destroyed
- Set of cards: `player.cardManager.discardPile`
- Can be retrieved with effects

### Banish Pile

- Permanently removed cards
- Set of cards: `player.cardManager.banishPile`
- Cannot normally be retrieved

### Destiny Zone

- Temporary holding zone for special cards
- Set of cards: `player.cardManager.destinyZone`
- Used for destiny mechanics

### Destiny Deck

- Special deck for hero/destiny cards
- Accessed via `player.cardManager.destinyDeck`

## Common Patterns

### Pattern 1: Draw Cards Effect

```typescript
import { isMinion } from '../../../../card/card-utils';

export const drawSpell: SpellBlueprint = {
  // ...
  canPlay: () => true,
  async getPreResponseTargets() {
    return [];
  },
  async onPlay(game, card) {
    // Draw 2 cards
    await card.player.cardManager.draw(2);
  }
};
```

### Pattern 2: Discard Random Cards

```typescript
async onPlay(game, card) {
  // Opponent discards 2 random cards
  const hand = card.player.opponent.cardManager.hand;
  const toDiscard = game.rng.pickNRandom(hand, 2);

  for (const discardCard of toDiscard) {
    await discardCard.discard();
  }
}
```

### Pattern 3: Mill Effect

```typescript
async onPlay(game, card) {
  // Mill 3 cards from opponent's deck
  const milled = card.player.opponent.cardManager.mill(3);

  // Check what was milled
  const minions = milled.filter(isMinion);
  if (minions.length > 0) {
    // Do something if minions were milled
  }
}
```

### Pattern 4: Resurrect from Discard

```typescript
import { isMinion } from '../../../../card/card-utils';
import { cardsInAllyDiscardPile } from '../../../../card-utils';

export const resurrect: SpellBlueprint = {
  // ...
  canPlay(game, card) {
    return cardsInAllyDiscardPile.canPlay(game, card, {
      min: 1,
      predicate: isMinion
    });
  },
  async getPreResponseTargets(game, card) {
    return await cardsInAllyDiscardPile.getPreResponseTargets<MinionCard>(game, card, {
      player: card.player,
      label: 'Choose a minion to resurrect',
      minChoiceCount: 1,
      maxChoiceCount: 1,
      predicate: isMinion
    });
  },
  async onPlay(game, card, targets) {
    const [minion] = targets as MinionCard[];

    // Add back to hand
    await minion.addToHand();

    // Or summon directly to board (see Summoning section)
  }
};
```

### Pattern 5: Banish Card Permanently

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as AnyCard;

  // Permanently remove from game
  await target.sendToBanishPile();
}
```

### Pattern 6: Move Card to Destiny Zone

```typescript
async onPlay(game, card) {
  // Move top 3 cards of deck to destiny zone
  await card.player.cardManager.drawIntoDestinyZone(3);
}
```

### Pattern 7: Draw with Filter

```typescript
import { isSpell } from '../../../../card/card-utils';

async onPlay(game, card) {
  // Draw up to 2 spells from deck
  const spells = await card.player.cardManager.drawWithFilter(2, isSpell);

  if (spells.length === 0) {
    // No spells found in deck
  }
}
```

### Pattern 8: Look at Top Card

```typescript
async onPlay(game, card) {
  const topCard = card.player.cardManager.mainDeck.cards[0];

  if (topCard) {
    // Show to player or make decision based on it
    const shouldDiscard = await game.interaction.askYesNo({
      player: card.player,
      label: `Discard ${topCard.name}?`
    });

    if (shouldDiscard) {
      await topCard.sendToDiscardPile();
    }
  }
}
```

### Pattern 9: Return Card from Board to Hand

```typescript
async onPlay(game, card, targets) {
  const target = targets[0] as MinionCard;

  if (target.location === 'board') {
    // Bounce minion back to hand
    await target.addToHand();
  }
}
```

### Pattern 10: Steal Card from Discard

```typescript
import { cardsInEnemyDiscardPile } from '../../../../card-utils';

async getPreResponseTargets(game, card) {
  return await cardsInEnemyDiscardPile.getPreResponseTargets(
    game,
    card,
    {
      player: card.player,
      label: 'Choose a card from enemy discard',
      minChoiceCount: 1,
      maxChoiceCount: 1
    }
  );
},
async onPlay(game, card, targets) {
  const [stolenCard] = targets as AnyCard[];

  // Add to your hand
  await stolenCard.addToHand();
}
```

## Summoning Minions

Minions have special methods for being played to the board.

### playAt(zone: BoardSlotZone)

Play a minion card from hand to a specific zone.

```typescript
import { BOARD_SLOT_ZONES } from '../../../../../board/board.constants';

// When playing a minion from hand (normal play)
await minion.playAt(BOARD_SLOT_ZONES.ATTACK_ZONE);
await minion.playAt(BOARD_SLOT_ZONES.DEFENSE_ZONE);
```

**Behavior:**

- Removes from hand
- Summons to specified zone
- Applies summoning sickness
- Calls `onPlay` effects
- Fires summon events

### playImmediatelyAt(zone: BoardSlotZone)

Summon a minion to board immediately, bypassing normal play chain.

```typescript
import { BOARD_SLOT_ZONES } from '../../../../../board/board.constants';

// For summoning tokens or resurrecting minions
await minion.playImmediatelyAt(BOARD_SLOT_ZONES.ATTACK_ZONE);
```

**Use cases:**

- Summoning token minions
- Resurrecting from discard
- Creating copies
- Any summon as part of another effect

**Example - Summon Token:**

```typescript
async onPlay(game, card) {
  // Create and summon a token minion
  const token = await game.cardSystem.createToken<MinionCard>(
    card.player,
    'token-minion-id'
  );

  await token.playImmediatelyAt(BOARD_SLOT_ZONES.ATTACK_ZONE);
}
```

**Example - Resurrect to Board:**

```typescript
async onPlay(game, card, targets) {
  const [minion] = targets as MinionCard[];

  // Summon from discard directly to board
  await minion.playImmediatelyAt(BOARD_SLOT_ZONES.DEFENSE_ZONE);
}
```

### Board Zones

```typescript
import { BOARD_SLOT_ZONES } from '../../../../../board/board.constants';

BOARD_SLOT_ZONES.ATTACK_ZONE; // Front row
BOARD_SLOT_ZONES.DEFENSE_ZONE; // Back row
```

## Important Notes

### Always Use Async/Await

Card manipulation methods are asynchronous:

```typescript
// ❌ WRONG
card.player.cardManager.draw(2); // Missing await!

// ✅ CORRECT
await card.player.cardManager.draw(2);
```

### Check Current Location

Before moving cards, check they're in the expected location:

```typescript
const target = targets[0] as MinionCard;

if (target.location === 'board') {
  await target.sendToDiscardPile();
}
```

### CardManager vs Card Methods

**Use CardManager methods for:**

- Drawing cards
- Milling
- Accessing zones
- Finding cards

**Use Card methods for:**

- Moving specific cards
- Discarding from hand
- Adding to hand
- Summoning to board

### Main Deck vs Destiny Deck

Some methods only work with main deck cards:

```typescript
// ✅ Works for main deck cards
await mainDeckCard.sendToDiscardPile();
await mainDeckCard.addToHand();
await mainDeckCard.discard();

// ❌ Throws error for destiny deck cards
await destinyCard.sendToDiscardPile(); // Error!

// ✅ Always works
await anyCard.sendToBanishPile(); // Works for any card
```

### Original Owner

Cards remember their original owner and return to that player's zones:

```typescript
// Even if stolen, card goes to original owner's discard
await stolenCard.sendToDiscardPile(); // Goes to original owner
```

### Zone Types

- **Arrays**: `hand` - Order matters
- **Sets**: `discardPile`, `banishPile`, `destinyZone` - No order
- **Deck**: `mainDeck`, `destinyDeck` - Special deck object

When iterating Sets, convert to Array:

```typescript
const cards = Array.from(player.cardManager.discardPile);
```

## Testing Your Implementation

Always test edge cases:

```typescript
// Test: Drawing with empty deck
const drawn = await player.cardManager.draw(5);
// Should handle gracefully if deck has < 5 cards

// Test: Full hand
if (!player.cardManager.isHandFull) {
  await player.cardManager.draw(1);
}

// Test: Card location
if (card.location === 'discardPile') {
  await card.addToHand();
}
```

## See Also

- [Card Implementation Guide](./CARD_IMPLEMENTATION_GUIDE.md)
- [Targeting and Interactions](./TARGETING_AND_INTERACTIONS.md)
- [Abilities System](./ABILITIES_SYSTEM.md)
