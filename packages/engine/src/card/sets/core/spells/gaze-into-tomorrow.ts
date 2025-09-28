import dedent from 'dedent';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { scry } from '../../../card-actions-utils';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const gazeIntoTomorrow: SpellBlueprint = {
  id: 'gaze-into-tomorrow',
  name: 'Gaze Into Tomorrow',
  cardIconId: 'spells/gaze-into-tomorrow',
  description: dedent`
  @Scry 1@, then draw a card.
  @[level] 2+ bonus@: @Echoed Destiny@.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  speed: CARD_SPEED.FAST,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    await card.modifiers.add(new EchoedDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    await scry(game, card, 1);
    await card.player.cardManager.draw(1);
  }
};
