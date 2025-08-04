import { ElusiveModifier } from '../../../../modifier/modifiers/elusive.modiier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const slipstreamVeil: SpellBlueprint<MinionCard> = {
  id: 'slipstream-veil',
  name: 'Slipstream Veil',
  cardIconId: 'spell-slipstream-veil',
  description: `Give a minion @Elusive@.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: singleMinionTargetRules.canPlay,
  getPreResponseTargets: singleMinionTargetRules.getPreResponseTargets,
  async onInit() {},
  async onPlay(game, card, [target]) {
    await target.modifiers.add(new ElusiveModifier(game, card));
  }
};
