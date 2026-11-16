import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { MinionCard } from '../../../entities/minion.entity';
import { AttackerModifier } from '../../../../modifier/modifiers/attacker.modifier';
import { FACTION_IDS } from '../../../factions/factions';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const unseven: MinionBlueprint = {
  id: 'unseven',
  name: 'Unseven',
  description: dedent /*html*/ `
  I have <rt-keyword>Attacker 2</rt-keyword> while at a battlefield where you have more influence than your opponent.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/unseven'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  level: 3,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new AttackerModifier(game, card, {
        amount: 2,
        mixins: [
          new TogglableModifierMixin(
            game,
            () =>
              card.isOnBattlefield &&
              card.battlefield!.commandmentScore >
                card.battlefield!.opponentCommandmentScore
          )
        ]
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
