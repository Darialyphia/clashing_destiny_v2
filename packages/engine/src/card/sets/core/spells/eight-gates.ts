import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { RemoveOnLeaveBoardModifierMixin } from '../../../../modifier/mixins/remove-on-destroyed';
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';
import { SpellDamage } from '../../../../utils/damage';

export const eightGates: SpellBlueprint<MinionCard> = {
  id: 'eightGates',
  name: 'Eight Gates',
  description: dedent /*html*/ `
  Deal 2 damage to a ally minion to give it +4 Attack and  <rt-keyword>Overwhelm</rt-keyword>. 
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/eight-gates'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.EPIC,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
  getTargets: (game, card) =>
    singleAllyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets.cards[0];
    if (!target) return;

    await target.takeDamage(card, new SpellDamage(2, card));
    if (!target.isAlive) return;

    await target.modifiers.add(
      new SimpleAttackBuffModifier('eight-gates-atk-buff', game, card, {
        amount: 4,
        mixins: [new RemoveOnLeaveBoardModifierMixin(game)]
      })
    );

    await target.modifiers.add(
      new OverwhelmModifier(game, card, {
        mixins: [new RemoveOnLeaveBoardModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
