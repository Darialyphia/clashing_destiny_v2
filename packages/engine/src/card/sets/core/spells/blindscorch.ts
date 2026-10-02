import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  singleEnemyMinionTargetRules,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellDamage } from '../../../../utils/damage';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const blindscorch: SpellBlueprint<MinionCard> = {
  id: 'blindscorch',
  name: 'Blindscorch',
  description: dedent /*html*/ `
  Give an enemy minion at a battlefield <rt-keyword>Burn 1</rt-keyword> and -1/-1/+0 this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/blindscorch'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.AIR],
  manaCost: 2,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(game, card, minion => minion.isOnBattlefield),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion => minion.isOnBattlefield,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.modifiers.add(new BurnModifier(game, card));
    await target.modifiers.add(
      new SimpleStatsBuffModifier('blindscorch', game, card, {
        atk: -1,
        cmd: -1,
        hp: 0,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
