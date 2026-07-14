import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  JOBS,
  RARITIES
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const innerFire: SpellBlueprint<MinionCard> = {
  id: 'innerFire',
  name: 'Inner Fire',
  description: dedent /*html*/ `
  Give a minion +2 Attack this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) =>
    singleAllyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: [card.player.minions[0]],
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.modifiers.add(
      new SimpleAttackBuffModifier('inner-fire', game, target, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
