# Design Axioms

This document outlines the philosophies driving the design of game elements. These are not hard rules, but guiding principles intended to foster coherent and deep gameplay.

## CARD DESIGN

### Minions

- Minions should generally have low stat numbers. ATK values of 4 or higher should remain rare.
- Minions should usually have higher HP than ATK, to encourage board presence and reduce the game's tendency toward constant board wipes. This is however not a hard and fast rule : string aggressively stated minions absolutely have their uses, but overall equally costed minions should not one shot each other.
- Minions costing 5 or more are a significant investment. They should feel rewarding without being pure stat sticks, especially since summoning sickness is not a factor. If they are stat-focused, consider gating them behind conditions such as a "Level Bonus".

### Spells

- Spells typically do not create board presence. Their loss in tempo should be compensated by powerful effects that meaningfully alter the game state.
- Favor "Burst" spells over "Cast" spells to promote interactivity and reactive play. A spell should have a valid reason (power level or otherwise) to be a cast spell.
- Strong removal spells should feel earned and be limited in availability, or expensive. Typically, under normal circumstances, a player should not be able to wipe the board AND develop a strong board of their own in a single turn.
- Direct Hero healing should be discouraged, in favor of well timed damage mitigation or temporary negation.

### Artifacts

- _TODO_

### Locations

- _TODO_

### Heroes

- Keep base hero designs relatively simple—they gain complexity through talent upgrades.
- Hero sprites serve as the player's avatar. They should look and feel iconic.
- Hero-centric strategies should be as viable and engaging as minion-centric ones. For example, a spell slinging orchetype, or Warrior Hero cented around artifact and hero attacks.

## TALENT DESIGN

- Talents allow players to shape a hero’s identity and enable unique strategies. They should support creative or transformative play patterns.
- Because talents can be acquired consistently at fixed intervals, they should not be overly powerful. Game-warping is acceptable; game-breaking is not.
- Talents should enable and incentivize card synergy; however, tt’s okay to include _some_ generic or “boring” talents. A simple effect like “Your hero has +3 HP” is valuable as a strategic tool and can support reactive or matchup-dependent planning.

## GENERAL PRINCIPLES

- Drawing cards is cornerstone to this game, even more than in other TCGs, as it is directly tied t othe resource system. drawing cards is card advantage AND Ramp. As such, effects that draw cards should be carefully evaluated.
- However, the main principle of the game is to ne enjoyable. Scarcity of resource is not enjoyable if it means you cannot do anything. As such, it's okay to overshoot draw engines: they will be nerfed if necessary.
- When drawing cards instantly seems too strong, drawing cards into the destiny zone is usually a good alternative as it delays the draw.
- Infinite combos should not be a thing.
- try to avoid card effects that are hard to track and create mental load: for example a card having an effect happening recurrently while it's in the discard pile is easily forgotten, especially after a few turn. while the digital nature of the game enables the game rules to be strictly adhered to, players should be able to have a clear picture of the game state by looking at the board.
- Maintain a consistent game tempo. Turns should feel impactful without becoming overloaded. No turn should take so long or do so much that the other player becomes disengaged.
- Card balance is expected to evolve through live testing. Principles should be re-evaluated when consistent friction emerges in gameplay or player feedback.
