# Clashing Destinies

## Overview

2 players PVP card game using alternating actions

Inspirations: Grand Archive, Might and Magic: Duel of Champions, Legends of Runeterra, Carte Online

## How To Win

The goal of the game is to reduce the HP of the enemy hero to 0. To do so, you can attack it with your minions or your own hero, or damage them using spell cards.

## Resources

### Cards

Both players have 2 decks: a Main deck and a Destiny Deck

- The Main deck contains 60 cards (4 copies max of the same card). Players draw cards from this deck and add them to their hand. To play cards from the main deck, players will put cards from their hand in their Destiny Zone face down. They will recollect them into their hand at the start of the next turn.
- the Destiny Deck contains 12 unique cards. Once per turn, Players can play a card from their Destiny Deck by banishing cards at random from their Destiny Zone equal to the card's cost.

### Runes

There are 4 kinds of runes: Power, Knowledge, Focus and Resonance. A player must meet a card's rune requirements in order to play it. They dont spend runes to play cards however: there are merely a constraint rather than a cost.

### Resource Action

Once per turn, players can do one of the following action

- Draw an additional Card
- Gain a rune of their choosing

### Factions

The Game has 6 Factions: Order, Chaos, Genesis, Oblivion, Arcane and Primal. A player may put cards of an faction in their deck, but if they play a card from a different faction then their hero's, they will take 1 damage. the card keyword Loyalty can increase this HP loss.

## Turn structure

At the start of a turn, both players draw 1 card, then recollect all cards in their Destiny zone to their hand.

During a turn, players alternate taking actions. On the first turnturns, initiative switches back and forth between players.

The actions available are:

- Play a card from their hand
- Play a card from their Destiny Deck
- Declare an attack
- Use a card ability
- Pass

The player who can perform an action is called the **initiative player**. On the first turn, player 1 gets the initiative first. For the subsequent turns, the player who gets the iniative first is the one who passed first on the previous turn.

## Actions

### Play a Card from hand

In order to play a card, players must put card from their hand face down into their Destiny Zone equal to the card's cost.
Playing any card creates a card Chain, which allows the opponent to respond to it by playing one of their own card or activating an ability.

### Play a Card from Destiny deck

Once per turn, A player may pay a card from their Destiny deck by banishing cards at random from their Destiny Zone equal to its cost.
As with playing cards from hand, playing a card from the Destiny Deck starts a Card Chain

### Declare an attack

A player may declare an attack with one of their minions of their hero. To do so, they declare its target (more info in the combat section below).
Declaring an attack starts a Card Chain with the opponent having priority.

### Use a card ability

A player may use one of their card's ability. Abilities may be activated from different locations depending on the card (from hand, from the board, from the graveyard, etc).
Using a ability starts a Card Chain with the opponent having priority.

### Pass

Passing makes the opponent the initiative player. If both players pass in a row. The turn ends.

## Cards

### Card Source

There are 2 kinds of cards: Main deck cards, and Destiny Deck Cards. This defines which deck they go to, and thus how they are played.

### Card Speed

Every card has a _Speed_ stat:

- Slow: this card cannot be played during an ongoing Card chain and can only be played when its owner is the initiative player.
- Fast: this card can be played during a Card Chain, or to start one. It can be played even if its owner is not the initiative player.
- Burst: this card can be played at the same time a Fast card can be played. However, it will not go into the Card Chain and will resolve instantly. Furthermore, playing an Instant speed card does not pass card chain priority, nor switch the initiative player. Note: Playing a Burst card does not create or join a Card Chain.

### Card Chain

Card Chains are the mechanism used to resolve multiple card that happen at the same time. Priority alternates between players during a card chain. When they have priority, a player can

- pass
- add another effect to the chain. This can done by :
  - playing a card from their hand
  - playing a card from their Destiny Deck
  - using a card ability
  - declaring a blocker. This can only happen when one of your units is getting attacked.

Any one of these actions pass priority, unless it's playing a card or using an ability at Burst speed

Once both players have successively passed, the chains resolves in a FILO (First In, Last Out) manner, until the chain is empty.

After a chain, the initiative always switches, regardless of who last added to the chain.

Example:

- player 1 plays **Fireball**, targeting the opponent's hero, trying to deal damage
- player 2 adds **Holy Barrier** to the chain, trying to mitigate all damage their heero takes this turn
- player 1 adds **Unrelenting Destruction**, which negates all effects that prevent damage this turn
- player 2 passes
- player 1 passes
  The chain now resolves backwards
- **Unrelenting Destruction** resolves, preventing damage negation
- **Holy Barrier** resolves, however, because of **Unrelenting Destruction**, its effect is negated and does nothing
- **Fireball** resolves, dealing damage to the opponent's hero

#### Exhaustion

An exhausted card cannot attack, retaliate, block, or use an ability. A card becomes exhausted when it declares an attacks, blocks, or uses an ability.
A card loses its exhausted status at the start of the turn. Taking combat damage from an attack does not exhaust if the card wasn't blocking.

Losing the exhausted status is referred as _waking up_ the card.

### Hero

The hero card is the most important card in a deck. If its HP are reduced to 0, its owner loses the game.
Heroes have the following stats:

- HP
- Attack
- Level

Player start the game with a fixed lvl 0 hero on the board.

Heroes are always Destiny Deck cards. To play a hero of level greater than 1, a player's current hero must meet the following requirements:

- have exactly one level less than the hero (a lvl 2 hero can only be played over a lvl 1 hero)
- share the same **lineage**. For example, "Erina, Aether Scholar", can only be lpayed over a level 1 "Erina" hero.

When a hero levels up, it keeps the ongoing effects, such as buffs or status effects, of the previous hero.

Heroes follow the same exhaustion rules as minions.

### Minions

Each player has 2 zones where they can play Minion cards: the attack zone and the defense zone.

- Minions in the attack zone are able to attack other enemy units.
- Minions in the defense zone are able to block attacks
  Minions remain on the board until their HP is reduced to 0.

### Spells

Spells are one time effects. Once resolved, they go directly to the discard pile.

### Artifacts

Artifacts are attached to your Hero and enhance their performance in battle or give them new abilities. Every Artifact has a durability stat; when it reaches 0, the artifact is removed and sent to the discard pile. In most cases, using an artifact's ability will consume one or more durability.

A hero can only have 3 artifacts equiped at the same time. If they try to play a fourth one, they must choose one of their already equiped artifacts to destroy.

### Sigils

Sigils are played on your attack or defense zone, like minions. However, they cannot attack or block. They just take space on the board. Sigils have a Countdown stat. At the start of each turn, this countdown decreases by 1. When it raches zero, the Sigil is destroyed and sent to the Discard pile.

## Combat

A combat occurs between 2 participants which can be a hero or a minion. A unit with 0 attack cannot declare an attack.

During combat:

- A Card chain is created, with the defending player having priority
- The defender may choose to block the attack with one of their minions in the defense zone.
- Once the chain is resolved, combat resolves
- The attacker and defender (the blocker if declared, otherwise the attack target) deal damage to each other at the same time, reducing each other's HP by their Attack value. However, in the case where one of the participant is exhausted, they do not deal damage (but will stil lreceive damage).
- Once resolved, both combat participants get exhausted, and the game goes back to the Main Phase and the iniative player is switched.

Example:

- Player 1 declares an attack with their 2ATK / 2HP **Steel Vanguard** onto the opponent's 1ATK / 1HP**Little Witch**
- Player 2 blocks with their 2ATK / 3ATK **Phantasm**.
- The combat resolves: the **Steel Vanguard** is dealt 3 damage and is destroyed. At the same time, the Enemy **Phantasm** is dealt 2 damage and survives with 1 HP. The **Little with** remains unscathed and does not deal any damage.
- The **Phantasm** is now exhausted and won't be able to block. It will also not be able to retaliated when attacked
