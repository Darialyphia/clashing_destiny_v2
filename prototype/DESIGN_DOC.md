# Project Name: [Working Title - Digital Tactical Card Game]

## 📘 Overview

A streamlined, digital-first PVP card game where players summon minions, cast spells, and position their forces in preparation for automated combat. Designed for fast-paced, tactical gameplay with clean interactions and minimal overhead.

---

## 🎯 Objective

Reduce your opponent's **Hero HP to 0**. During a turn, players alternate playing cards one by one. Combat plays out automatically after both players complete their turn.

---

## 🣍‍♂️ Player Setup

Each player has:
- A **Hero** with:
  - Starting HP (e.g., 20)
  - A passive ability
  - An Attack stat
  - A Speed stat
- A **deck** of:
  - **Minions**
  - **Spells**
  - **Artifacts**
- A **hand** of cards
- A **line** for minion placement
- A **face-down resource zone**

---

## 🔄 Turn Structure

### 1. Draw Phase
- Draw **2 cards**.

### 2. Main Phase (Alternating Play)
- Players **alternate playing cards**, starting with the player who has initiative (on the first turn, initiative is decided at random, then it alternates each turn).
- To **play a card**, place a number of cards from your hand **face-down** into the resource zone equal to the card’s cost.
- A player may **pass**. If both players pass consecutively, proceed to the combat phase.

### 3. Combat Phase
- Combat proceeds in **rounds**. In each round:
  - All active units (minions and heroes) take **one action**.
  - Units act in **descending order of Speed**.
  - Each unit attacks **one enemy**.
  - By default, minions attack the **closest enemy unit**.
  - If there are no enemy minions, the **hero becomes the target**.
- After all units have acted, start a **new combat round**.
- Combat ends when all minions are destroyed.

---

## 💥 Card Types

### 🔹 Minions
- Have **ATK, HP, Speed**, and may have special abilities or **keywords**.
- Placed in the minion line at any position.
- Fight in the combat phase.

### 🔹 Spells
- One-shot effects.
- Resolves immediately on cast.
- May deal damage, draw cards, etc.

### 🔹 Artifacts
- Are attached to the Hero
- Persistent effects (e.g., buffs, passives, etc.).
- May enhance the Hero or affect the board.

---

## 🧱 Resource System

- To play a card, **pay its cost** by placing that many cards from your hand face-down into the **resource zone**.
- These cards remain hidden and are normally **recovered at the start of your next turn**... *unless* they are used for special effects (see below).

---

## 🧠 Keywords (Examples)

- **Protector:** Takes combat damage in place of the minion to its right.
- **Fury:** If this kills its opponent, it immediately attacks again.
- **Cleave(X):** When attacking, also deals X damage to the units next to the attack target.
- **Reborn:** Resummon this minion at the start of the next turn with 1 HP.
- **Ranged:** Attacks the **farthest enemy** instead of the closest.
- **Assasin:** Attacks the **enemy with the lowest HP**.

---

## 🧪 Optional / Under Consideration

### Talent Tree System (Experimental)

- Each hero has its own talent tree that can unlock passive bonuses, grant special cards to the player's hand or deck, etc.
- At the start of the turn, after their draw phase, Heroes gain a level.
- When this happens, players may **banish** resource cards **at random** to unlock a talent from their talent tree.
- Heroes could level up through other card means, e.g., some card effect.

