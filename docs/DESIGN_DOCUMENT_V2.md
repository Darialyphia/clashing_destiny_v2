# Clashing Destinies

## Overview

2 players PVP card game

The goal of the game is to reduce the enemy Health Points (HP) to 0. To do so they will attack with their own hero or minions, cast spells and equip artifacts.

Inspirations: Grand Archive, Might and Magic: Duel of Champions, Legends of Runeterra

## Start of game

At the start of the game, both players draw 7 cards. They have the opportunity to replace up to 3 cards from their hand. This is called a **mulligan**. Once both player have chosen to mulligan or not, their Level 1 hero from their Destiny deck (see below) is automatically played.

## Turn structure

At the start of a turn, both players draw 2 cards, then recollect all cards in their Destiny zone (see below) to their hand.

During a turn, players alternate taking action. On the first turn, Player 1 starts with the initiative and is able to play the first card. On the following turns, initiative switches back and forth between players.

The actions available are:

- Play a card from their hand
- Play a card from their Destiny Deck (see below)
- Declare an attack
- Use a card ability
- Replace a card from their hand
- Pass

The player who can performe an action is called the **initiative player**. On the first turn, player 1 gets the initiative first. After that it goes back and forth between the two players.

## Actions

### Play a Card from hand

In order to play a card, players must put card from their hand face down into their Destiny Zone equal to the card's cost.
Playing any card starts an Card Chain (see below)

### Play a Card from Destiny deck

Each player has a Destiny Deck with 12 unique cards (the content of which is unknown to the opponent). Once per turn, A player may pay a card from their Destiny deck by banishing cards at random from their Destiny Zone equal to its cost.
As with playing cards from hand, playing a card from the Destiny Deck starts a Card Chain

### Declare an attack

A player may declare an attack with one of their minions of their hero. To do so, they declare its target (more info in the combat sectiob below).
Declaring an attack starts a Card Chain with the opponent having priority.

### Use a card ability

A player may use one of their card's ability. Abilities may be activated from different locations depending on the card (from hand, from the board, from the graveyard, etc).
Using a ability starts a Card Chain with the opponent having priority.

### Pass

Passing makes the opponent the initiative player. If both players pass in a row. The turn ends.

## Cards

### Playing restriction

In order to be played, a card needs to match the class of any of your hero's lineage (see below).

### Card Source

There are 2 kinds of cards: Main deck cards, and Destiny Deck Cards. This defines which deck they go to, and thus how they are played.

### Card Speed

Every card has a _Speed_ stat:

- Slow: this card cannot be played during an ongoing Card chain and can only be played when its owner is the initiative player.
- Fast: this card can be played during a Card Chain, or to start one. It can be played even if its owner is not the initiative player.
- Warp: this card can only be played as a response to another card (cannot be played at slow speed). However, instead of placing it on top of the chain, you may insert it at any point in the chain
- Instant: this card can be played at the same time a Fast card can be played. However, it will not go into the Card Chain and will resolve instantly. Furthermore, playing an Instant speed card does not switch the initiative player.

### Card Chain

Card Chains are the mechanism used to resolve multiple card that happen at the same time. Priority alternates between players during an card chain. When they have priority, a player can

- pass
- add another card to the chain. This can be playing a card from their hand, playing a card from their Destiyn Deck, or using a card ability.
  Once both players are successively passed, the chains resolves in a FILO (First In, Last Out) manner, until the chain is empty.

Note that the priority is indépendant from the initiative player of the turn : if player 1 is the initiative player, but player 2 is the last player to add a card to the chain, once the chain resolves, player 2 still becomes the initiative player.

Example:

- player 1 plays **Fireball**, targeting the opponent's hero, trying to deal damage
- player 2 adds **Holy Barrier** to the chain, trying to mitigate all damage their heero takes this turn
- player 1 adds **Unrelenting Destruction**, which negates all effects that prevent damage this turn
- player 2 passes
- player 1 passes
  The chain now resolves backwards
- **Unrelenting Destruction** resolves, preventing damage negation
- **Holy Barrier** resolves, however, because of **Unrelenting Destruction**, its effect is negated and does nothing
- **Fireball** resolve,s dealing damage to the opponent's hero

#### Exhaustion

An exhausted card cannot attack or use an ability. A card becomes exhausted when it declares an attacks, or uses an ability (note: not all abilities exhaust the card).
A card loses its exhausted status at the start of the turn. Taking damage from an attack does not exhaust.

Losing the exhausted status is referred as waking up the card.

### Hero

The hero card is the most important card in a deck. IF its HP are reduced to 0, its owner loses the game.
Heroes have the following stats:

- HP
- Attack
- Level
- Class

A Destiny deck **MUST** have one and only one Level 1 Hero, which is automatically played as the first turn starts.
Heroes are always Destiny Deck cards. To play a hero of level greater than 1, a player's current hero ùust meet the following requirements:

- have exactly one level less than the hero (a lvl 2 hero can only be played over a lvl 1 hero)
- meet the class requirement of the hero (for example: a Pyromancer hero can only be played over a Spellcaster hero).

When a hero levels up, it keeps the ongoing effects and class of its previous level. This is called the hero's **lineage**. This means that if you evolve a Spellcaster into a Pyromancer, your hero is considered both a Spellcaster and a Pyromancer.

### Minions

Each player has 2 rows of 4 slots each: the front row and the back row. A minion can usually be player on any slot of any row, even though specific restrictions may apply.
Minions remain on the board until their HP is reduced to 0.

Minions come into play exhausted, and thus cannot attack or use abilities the turn they are summoned.

### Spells

Spells are one time effects. Once resolved, they go directly to the discard pile.

### Artifacts

Artifacts are attached to your Hero and enhance their performance in battle or give them new abilities. Every Artifact has a durability stat; when it reaches 0, the artifact is removed and sent to the discard pile. In most cases, using an artifact's ability will consume one or more durability.

A hero can only have 3 artifacts equiped at the same time. If they try to play a fourth one, they must choose one of their already equiped artifacts to destroy.

### Attacks

Attacks make your hero attack while giving them bonus attack and / or effects. Since a hero may only attack once per turn.
Note that Fast speed attacks that are played during a Card Chain do not create a new card chain like a standard attack would; instead it will use the current attack chain. As for Instant speed attack, they instantly resolve, leaving no space for opponent response.

Playing an Attack card requires exhausting your hero in addition to its cost. since a hero can normally only be exhausted once per turn, this means you can typically play only one Attack card per turn. If a player manages to wake up their hero, another attack could be played.

Attack cards cannot be played if an attack is already underway

## Combat

A combat occurs between 2 participants which can be a hero or a minion. A unit with 0 attack cannot declare an attack.

During combat:

- The attack deals damage to the defender equal to its attack
- Then, if the defender is still alive, it deals damage to the attacker equal to its attack.

### Targeting restriction

Under normal circumstances, a minion may only a minion in the same column as them. In addition, if the enemy column has a minion in both the front row and back row, they may only attack the one in the front row.
If there no enemy minion in a row,a minion may attack the enemy hero directly.
A hero can attack anywhere (any other enemy minion or hero)
