import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
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
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';

export const innerFire: SpellBlueprint<MinionCard> = {
  id: 'inner-fire',
  name: 'Inner Fire',
  cardIconId: 'inner-fire',
  description: 'Give target minion +2/+0 until the end of the turn.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  canPlay: singleEnemyMinionTargetRules.canPlay,
  getPreResponseTargets: singleEnemyMinionTargetRules.getPreResponseTargets,
  async onInit() {},
  async onPlay(game, card, [target]) {
    await target.modifiers.add(
      new SimpleAttackBuffModifier<MinionCard>('inner-fire-attack-buff', game, card, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
