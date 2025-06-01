import type { Modifier } from '../../../../modifier/modifier.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  singleEnemyMinionTargetRules,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.card';

export const ignite: SpellBlueprint<MinionCard> = {
  id: 'ignite',
  name: 'Ignite',
  cardIconId: 'ignite',
  description:
    'Inflict @Burn@ to an enemy minion.\n@Level 2 Bonus@: Draw 1 card into your Destiny Zone.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: singleEnemyMinionTargetRules.canPlay,
  getPreResponseTargets: singleEnemyMinionTargetRules.getPreResponseTargets,
  async onInit() {},
  async onPlay(game, card, [target]) {
    await target.modifiers.add(new BurnModifier(game, card));

    if (card.player.hero.level >= 2) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
