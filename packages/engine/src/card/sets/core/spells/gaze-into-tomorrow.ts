import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { scry } from '../../../card-actions-utils';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';

export const gazeIntoTomorrow: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'gaze-into-tomorrow',
  name: 'Gaze Into Tomorrow',
  cardIconId: 'spell-gaze-into-tomorrow',
  description: '@Scry 1@. @[level] 2+ bonus@: draw a card.\n@Echoed Destiny@.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
    await card.modifiers.add(new EchoedDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    await scry(game, card, 1);
    const levelModifier = card.modifiers.get(LevelBonusModifier);
    if (levelModifier?.isActive) {
      await card.player.cardManager.draw(1);
    }
  }
};
