import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { MinionCard } from '../../../entities/minion.entity';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';

export const blindingLight: SpellBlueprint = {
  id: 'blinding-light',
  name: 'Blinding Light',
  cardIconId: 'spells/blinding-light',
  description: dedent`
  Give an attacking enemy minion -3 @[attack]@ this turn.`,
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  abilities: [],
  canPlay(game, card) {
    return singleEnemyTargetRules.canPlay(game, card, candidate => candidate.isAttacking);
  },
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(
      game,
      card,
      {
        type: 'card',
        card
      },
      candidate => candidate.isAttacking
    );
  },
  async onInit(game, card) {
    await card.modifiers.add(new EchoedDestinyModifier(game, card, {}));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.modifiers.add(
      new SimpleAttackBuffModifier<MinionCard>('blinding-light', game, card, {
        amount: -3,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
