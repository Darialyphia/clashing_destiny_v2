# Clashing Destiny - Official Rulebook

## Table of Contents

1. [Introduction](#1-introduction)
2. [Components](#2-components)
3. [Game Setup](#3-game-setup)
4. [The Battlefield](#4-the-battlefield)
5. [Card Types](#5-card-types)
6. [Turn Structure](#6-turn-structure)
7. [Playing Cards](#7-playing-cards)
8. [Movement](#8-movement)
9. [Combat](#9-combat)
10. [Resources](#10-resources)
11. [Keywords](#11-keywords)
12. [Victory Conditions](#12-victory-conditions)
13. [Glossary](#13-glossary)

---

## 1. Introduction

**Clashing Destiny** is a strategic digital card game where two players command powerful Heroes, summon Minions, cast Spells, and equip Artifacts on a tactical battlefield. Victory is achieved by reducing your opponent's Hero to 0 HP through strategic positioning and combat.

---

## 2. Components

### 2.1 Deck

Each player builds a deck before the game begins with the following constraints:

| Rule                    | Value                                 |
| ----------------------- | ------------------------------------- |
| Deck Size               | Exactly **40 cards**                  |
| Maximum Copies per Card | **3 copies** of any single card       |
| Required                | **1 Hero card** (not counted in deck) |

## 3. Game Setup

### 3.1 Starting the Game

1. Both players' decks are shuffled
2. Each player draws **5 cards** to form their starting hand
3. Players may mulligan cards (replace cards in hand with new ones from deck) if the game format allows
4. **Player 1** is determined randomly and takes the first turn
5. Each player's Hero begins on the battlefield
6. Both players start with **0 mana** (mana regenerates at the start of each turn)

### 3.2 Hand Limits

| Parameter            | Value   |
| -------------------- | ------- |
| Starting Hand        | 5 cards |
| Maximum Hand Size    | 7 cards |
| Cards Drawn per Turn | 1 card  |

---

## 4. The Battlefield

### 4.1 Board Layout

The battlefield is a grid of **5 columns × 4 rows**, divided between two players:

```
         Column 1    Column 2    Column 3    Column 4    Column 5
       ┌───────────┬───────────┬───────────┬───────────┬───────────┐
Row 1  │  P2 Back  │  P2 Back  │  P2 Back  │  P2 Back  │  P2 Back  │  ← Player 2's Back Row
       ├───────────┼───────────┼───────────┼───────────┼───────────┤
Row 2  │ P2 Front  │ P2 Front  │ P2 Front  │ P2 Front  │ P2 Front  │  ← Player 2's Front Row
       ├───────────┼───────────┼───────────┼───────────┼───────────┤
Row 3  │ P1 Front  │ P1 Front  │ P1 Front  │ P1 Front  │ P1 Front  │  ← Player 1's Front Row
       ├───────────┼───────────┼───────────┼───────────┼───────────┤
Row 4  │  P1 Back  │  P1 Back  │  P1 Back  │  P1 Back  │  P1 Back  │  ← Player 1's Back Row
       └───────────┴───────────┴───────────┴───────────┴───────────┘
```

### 4.2 Row Types

**Front Row**

- Units here are in direct combat range
- Melee units can attack enemies in the opposing front row
- Units with **Cleave** deal damage to adjacent enemies when attacking from here

**Back Row**

- Safer positioning for ranged units
- **Ranged** units can attack enemies in the back row from here
- **Ranged** units are immune to retaliation from non-ranged units when attacking from the back row

### 4.3 Cell Rules

- Each cell can hold **at most 1 unit** at any time
- Units can only be summoned on cells in their owner's territory (front or back row)
- Some cards with **Airdrop** can be summoned anywhere on the board

---

## 5. Card Types

### 5.1 Hero

Your Hero is the most important card—if it falls, you lose the game.

| Attribute          | Description                                               |
| ------------------ | --------------------------------------------------------- |
| HP (Health Points) | The Hero's life total. When reduced to 0, you lose.       |
| ATK (Attack)       | Damage dealt when the Hero attacks                        |
| Retaliation        | Damage dealt when the Hero counterattacks                 |
| Abilities          | Special activated abilities that cost mana                |
| Jobs               | Class affiliations that may affect certain card synergies |

**Hero Rules:**

- Each player has exactly **1 Hero**
- Heroes begin the game on the battlefield
- Heroes can attack enemies and use activated abilities
- Heroes can be targeted by enemy attacks and spells

### 5.2 Minion

Minions are units you summon to fight for you on the battlefield.

| Attribute   | Description                                  |
| ----------- | -------------------------------------------- |
| Mana Cost   | Amount of mana required to play              |
| ATK         | Damage dealt when attacking                  |
| HP          | Health points; destroyed when reduced to 0   |
| Retaliation | Damage dealt when counterattacking           |
| Keywords    | Special abilities that modify behavior       |
| Tags        | Creature types (e.g., Golem, Mech, Arcanyst) |

**Minion Rules:**

- Summoned to an empty cell in your territory
- Suffer **Summoning Sickness** when played (cannot act until next turn, unless they have **Rush**)
- Can move **1 space** per turn (unless modified by keywords)
- Can attack **1 time** per turn (unless modified by keywords)
- Destroyed when HP reaches 0

### 5.3 Spell

Spells are one-time effects that resolve immediately when played.

| Attribute | Description                            |
| --------- | -------------------------------------- |
| Mana Cost | Amount of mana required to play        |
| Effect    | The spell's effect when cast           |
| Targets   | What the spell can target              |
| AOE       | Area of effect pattern (if applicable) |

**Spell Rules:**

- Played from hand by paying the mana cost
- Effect resolves immediately
- Card is discarded after resolution
- Some spells require a target; others affect areas

### 5.4 Artifact

Artifacts are equipment attached to your Hero that provide ongoing benefits.

| Attribute  | Description                                             |
| ---------- | ------------------------------------------------------- |
| Mana Cost  | Amount of mana required to play                         |
| Effect     | Passive or activated ability                            |
| Durability | How much damage the artifact can absorb before breaking |
| Abilities  | Activated effects (if any)                              |

**Artifact Rules:**

- Equipped to your Hero when played
- Maximum of **5 artifacts** equipped at once
- Artifacts may lose durability when taking damage
- Artifacts with **Timeless** don't lose durability during your turn
- Some artifacts have activated abilities

### 5.5 Destiny

Destiny cards are powerful effects that cost **Experience** instead of mana.

| Attribute | Description                           |
| --------- | ------------------------------------- |
| EXP Cost  | Amount of experience required to play |
| Effect    | The Destiny's powerful effect         |
| Targets   | What the Destiny can target           |

**Destiny Rules:**

- Paid for with **Experience Points**, not mana
- Represent powerful, game-changing effects
- Card is discarded after resolution

---

## 6. Turn Structure

### 6.1 Initiative System

Clashing Destiny uses an **initiative system** where players alternate actions within a round:

1. The player with **initiative** may take an action
2. After most actions, initiative passes to the opponent
3. A player may **pass** instead of taking an action
4. When **both players pass consecutively**, the round ends and a new turn begins
5. Some cards have **Burst**, which lets you keep initiative after playing them

### 6.2 Turn Phases

**Start of Turn**

1. Draw 1 card (if configured for turn-start draw)
2. Regenerate mana (up to your mana cap)
3. Gain 1 Experience Point
4. Resolve any "start of turn" effects

**Main Phase**
Players alternate taking actions:

- Play a card from hand
- Move a unit
- Attack with a unit
- Use an activated ability
- Pass

**End of Turn**

1. Resolve any "end of turn" effects
2. Remove **Ephemeral** units
3. Discard **Fleeting** cards from hand
4. Draw 1 card (if configured for turn-end draw)

### 6.3 Available Actions

| Action          | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| **Play a Card** | Pay the cost and play a card from your hand                    |
| **Move**        | Move one of your units to an adjacent empty cell               |
| **Attack**      | Attack with one of your units (unit becomes exhausted)         |
| **Use Ability** | Activate an ability on your Hero or a Minion                   |
| **Replace**     | Once per turn, replace a card in hand with a new one from deck |
| **Pass**        | End your current action; if both players pass, the round ends  |

---

## 7. Playing Cards

### 7.1 Playing a Minion

1. Select a Minion card from your hand
2. Pay its mana cost
3. Choose an empty cell in your territory to summon it
4. The Minion enters the battlefield with **Summoning Sickness**
5. Resolve any **On Enter** effects

**Exception:** Minions with **Airdrop** can be summoned to any empty cell on the board.

### 7.2 Playing a Spell

1. Select a Spell card from your hand
2. Pay its mana cost
3. Select targets (if required)
4. The spell effect resolves immediately
5. The spell card is discarded

### 7.3 Playing an Artifact

1. Select an Artifact card from your hand
2. Pay its mana cost
3. The Artifact is equipped to your Hero
4. If you already have 5 artifacts, you cannot play more

### 7.4 Playing a Destiny

1. Select a Destiny card from your hand
2. Pay its **Experience cost** (not mana)
3. Select targets (if required)
4. The Destiny effect resolves immediately
5. The Destiny card is discarded

### 7.5 Rune Costs

Some cards have additional **Rune costs** in addition to or instead of mana:

| Rune        | Color                           |
| ----------- | ------------------------------- |
| Red Rune    | Combat-focused effects          |
| Blue Rune   | Control and utility effects     |
| Yellow Rune | Support and enhancement effects |

- Runes are accumulated throughout the game via card effects
- Cards with rune costs require you to have the specified runes
- **Consume** effects destroy your runes when the card is played

---

## 8. Movement

### 8.1 Basic Movement

- Units can move **1 space per turn** by default
- Movement is to an **adjacent empty cell** (orthogonally adjacent)
- Moving does not pass initiative unless specified

### 8.2 Movement Restrictions

Units **cannot move** if they:

- Have **Summoning Sickness** (just summoned without Rush)
- Are **Exhausted** (already acted this turn)
- Are **Frozen** (skip next action)
- Are **Stunned** (cannot move or attack)
- Are **Anchored** (cannot move or be moved)
- Are **Provoked** (forced to attack the Provoker)
- Are a **Structure** or **Wall**

### 8.3 Special Movement

| Keyword      | Effect                                                         |
| ------------ | -------------------------------------------------------------- |
| **Flying**   | Can move 2 extra spaces and move through other units           |
| **Celerity** | Can move and attack in the same turn without losing initiative |
| **Airdrop**  | Can be summoned anywhere on the board                          |

---

## 9. Combat

### 9.1 Declaring an Attack

1. Select one of your units that can attack
2. Choose a valid target (enemy unit or Hero)
3. The attacker deals damage equal to its ATK to the target
4. The defender counterattacks (if able)
5. The attacker becomes **Exhausted**
6. Initiative typically passes to the opponent

### 9.2 Valid Attack Targets

- **Melee units** can attack enemies in adjacent cells or the opposing front row
- **Ranged units** (when in back row) can attack enemies in the back row
- Units with **Provoke** force enemies in the same column to attack them
- Units with **Stealth** cannot be targeted unless exhausted

### 9.3 Damage Calculation

```
Damage Dealt = Attacker's ATK (modified by keywords and effects)
```

When a unit takes damage:

1. Apply any damage reduction effects (Barrier, etc.)
2. Subtract damage from HP
3. If HP reaches 0, the unit is destroyed

### 9.4 Counterattacks

After being attacked, the defender automatically **counterattacks** if:

- The defender is still alive
- The defender has a Retaliation value greater than 0
- No effect prevents the counterattack

**Counterattack damage** = Defender's Retaliation stat

**Counterattacks are prevented when:**

- The attacker has **Backstab** (attacking damaged enemies)
- The attacker has **Fearsome** (and destroys the target)
- The attacker has **Intimidate (X)** (against units costing X or less)
- The defender is a non-Ranged unit attacked by a Ranged unit from the back row

### 9.5 Area of Effect (AOE)

Some attacks and spells affect multiple cells:

| Pattern    | Description                               |
| ---------- | ----------------------------------------- |
| **Point**  | Single cell                               |
| **Cleave** | Target and adjacent cells on the same row |
| **Blast**  | All enemies in the same column            |
| **Ring**   | All cells surrounding the target          |
| **Row**    | All cells in a row                        |
| **Column** | All cells in a column                     |

### 9.6 Combat Keywords

| Keyword            | Effect                                                        |
| ------------------ | ------------------------------------------------------------- |
| **Backstab (X)**   | +X damage vs damaged enemies, immune to retaliation           |
| **Blast**          | Damages all enemies in the same column when attacking         |
| **Cleave**         | Damages adjacent enemies on same row (front row only)         |
| **Fearsome**       | No counterattack when you destroy the target                  |
| **Intimidate (X)** | Units costing ≤X cannot counterattack                         |
| **Provoke**        | Enemies in same column must attack this unit                  |
| **Ranged**         | From back row: hit back row, immune to non-ranged retaliation |

---

## 10. Resources

### 10.1 Mana

Mana is the primary resource for playing cards.

| Parameter                  | Value |
| -------------------------- | ----- |
| Maximum Mana               | 8     |
| Mana Regeneration per Turn | 5     |
| Starting Mana              | 0     |

**Mana Rules:**

- Mana regenerates at the start of each turn
- Unspent mana does not carry over
- Your mana cannot exceed the maximum of 8

### 10.2 Experience & Leveling

Experience allows you to play Destiny cards and unlock level bonuses.

| Parameter              | Value |
| ---------------------- | ----- |
| Maximum Level          | 4     |
| EXP Gained per Turn    | 1     |
| EXP Required per Level | 3     |

**Level Progression:**

- Level 0 → Level 1: 3 EXP
- Level 1 → Level 2: 3 EXP (6 total)
- Level 2 → Level 3: 3 EXP (9 total)
- Level 3 → Level 4: 3 EXP (12 total)

**Level Bonuses:**
Some cards have **Level X Bonus** effects that activate when your Hero reaches the specified level.

### 10.3 Runes

Runes are a secondary resource used by certain cards.

| Rune Type | Color  |
| --------- | ------ |
| Red       | Red    |
| Blue      | Blue   |
| Yellow    | Yellow |

- Runes are gained through card effects
- Some cards require runes to play
- **Consume** effects destroy runes when used

---

## 11. Keywords

### 11.1 Movement Keywords

| Keyword      | Description                                              |
| ------------ | -------------------------------------------------------- |
| **Airdrop**  | Can be summoned anywhere on the board                    |
| **Anchored** | Cannot move or be moved by any effect                    |
| **Celerity** | Can move and attack same turn without passing initiative |
| **Flying**   | Moves 2 extra spaces; can move through units             |

### 11.2 Combat Keywords

| Keyword            | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| **Backstab (X)**   | +X damage vs damaged enemies; immune to retaliation                  |
| **Blast**          | Damages all enemies in the same column when attacking                |
| **Cleave**         | Damages adjacent enemies on same row (front row only)                |
| **Fearsome**       | No counterattack when destroying the target                          |
| **Intimidate (X)** | Units costing ≤X cannot counterattack                                |
| **Provoke**        | Enemies in same column can only attack this unit                     |
| **Ranged**         | From back row: can attack back row; immune to non-ranged retaliation |
| **Rush**           | Can act the turn it is summoned                                      |

### 11.3 Protection Keywords

| Keyword          | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| **Barrier**      | Prevents the next instance of damage                           |
| **Elusive**      | First attack each turn: moves adjacent, prevents combat damage |
| **Invulnerable** | Cannot be damaged                                              |
| **Stealth**      | Cannot be targeted or attacked unless exhausted                |
| **Veil**         | Cannot be targeted by spells                                   |

### 11.4 Status Keywords

| Keyword                | Description                                 |
| ---------------------- | ------------------------------------------- |
| **Burn (X)**           | Takes X damage at the start of its turn     |
| **Ephemeral**          | Disappears at the end of its owner's turn   |
| **Exhausted**          | Cannot attack or move this turn             |
| **Fleeting**           | Removed from game at end of turn if in hand |
| **Frozen**             | Skips its next action                       |
| **Stunned**            | Cannot move or attack until end of turn     |
| **Summoning Sickness** | Cannot act the turn it was summoned         |

### 11.5 Triggered Keywords

| Keyword              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| **Deathwatch**       | Triggers whenever any unit is destroyed               |
| **Infiltrate**       | Bonus effect when on opponent's side of the board     |
| **Lone Wolf**        | Triggers when this unit has no nearby allies          |
| **On Attack**        | Triggers when this unit attacks                       |
| **On Counterattack** | Triggers when this unit counterattacks                |
| **On Destroyed**     | Triggers when this unit is destroyed                  |
| **On Enter**         | Triggers when this unit enters the battlefield        |
| **On Kill**          | Triggers when this unit destroys another unit         |
| **Zeal**             | Triggers when an adjacent ally has attacked this turn |

### 11.6 Special Keywords

| Keyword           | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| **Ability (X)**   | Activated ability costing X mana; once per turn              |
| **Adapt**         | Choose one of multiple effects when played                   |
| **Battle Pet**    | Cannot be controlled; auto-attacks closest enemy             |
| **Burst**         | You keep initiative after playing this card                  |
| **Cleanse**       | Remove enemy enchantments                                    |
| **Consume**       | Destroy the mentioned runes when played                      |
| **Discover**      | Choose 1 of 3 random cards to add to hand                    |
| **Dispel**        | Nullifies all abilities and enchantments                     |
| **Echo**          | When played, put an Ephemeral copy without Echo in hand      |
| **Essence (X)**   | Can play as spell for X mana if insufficient mana for minion |
| **Grow**          | Gains +1 ATK and +1 HP at the start of its turn              |
| **Level X Bonus** | Bonus effect if Hero is at least level X                     |
| **Rebirth**       | When destroyed, leaves egg that hatches into copy next turn  |
| **Spawn X**       | Start of turn: summon X adjacent, lose 1 charge              |
| **Structure**     | Cannot move, attack, retaliate, or gain attack               |
| **Timeless**      | Doesn't lose durability during your turn                     |
| **Unique**        | Only one copy can be in play on your side                    |
| **Wall**          | Cannot move; disappears when dispelled                       |

---

## 12. Victory Conditions

### 12.1 Winning the Game

You win the game when your opponent's **Hero HP reaches 0**.

This can be achieved by:

- Attacking the enemy Hero with your units
- Dealing damage to the enemy Hero with spells
- Using ability effects that damage the enemy Hero

### 12.2 Losing the Game

You lose the game when your **own Hero HP reaches 0**.

---

## 13. Glossary

| Term              | Definition                                            |
| ----------------- | ----------------------------------------------------- |
| **Adjacent**      | Cells directly next to a cell (up, down, left, right) |
| **AOE**           | Area of Effect; affects multiple cells                |
| **ATK**           | Attack; the damage a unit deals when attacking        |
| **Battlefield**   | The 5×4 grid where units are placed                   |
| **Cell**          | A single space on the battlefield                     |
| **Counterattack** | Automatic retaliation damage when attacked            |
| **Deck**          | Your collection of 40 cards                           |
| **Discard**       | Move a card from hand to the discard pile             |
| **Exhausted**     | A unit that has used its action this turn             |
| **Hand**          | Cards you've drawn that you can play                  |
| **HP**            | Health Points; when reduced to 0, unit is destroyed   |
| **Initiative**    | Which player can currently take an action             |
| **Mana**          | Primary resource for playing cards                    |
| **Mulligan**      | Replace cards in starting hand before game begins     |
| **Retaliation**   | Damage dealt when counterattacking                    |
| **Rune**          | Secondary resource (Red, Blue, Yellow)                |
| **Summon**        | Place a Minion onto the battlefield                   |
| **Target**        | The unit or cell affected by an action                |
| **Territory**     | Your two rows of the battlefield                      |
| **Turn**          | A complete cycle of both players passing              |

---

## Quick Reference Card

### Starting Values

- Hand: 5 cards
- Max Hand: 7 cards
- Draw: 1/turn
- Max Mana: 8
- Mana Regen: 5/turn
- EXP: 1/turn
- EXP to Level: 3

### Board Size

- 5 columns × 4 rows
- 2 rows per player (front + back)

### Per-Turn Limits

- Movement: 1 per unit
- Attacks: 1 per unit
- Replaces: 1 total
- Ability uses: 1 per card

### Win Condition

- Reduce opponent's Hero HP to 0

---

_Welcome to the battlefield, Commander. May destiny favor the bold._
