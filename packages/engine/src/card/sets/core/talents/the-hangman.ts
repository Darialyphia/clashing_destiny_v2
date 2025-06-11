import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { scry } from '../../../card-actions-utils';
import type { TalentBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { mage } from '../heroes/mage';
import { novice } from '../heroes/novice';

export const theHangman: TalentBlueprint = {
  id: 'the-hangman',
  name: 'The Hangman',
  cardIconId: 'the-hangman',
  description:
    '@On Enter@: Give your Hero: @[exhaust]@ @[mana] 4@: switch the position of all minions, then @Seal@ this ability.',
  affinity: AFFINITIES.NORMAL,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 2,
  heroId: novice.id,
  rarity: RARITIES.EPIC,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  tags: [],
  async onInit() {},
  async onPlay(game, card) {}
};
