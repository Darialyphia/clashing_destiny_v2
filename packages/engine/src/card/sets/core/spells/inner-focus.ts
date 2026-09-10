import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellDamage } from '../../../../utils/damage';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const innerFocus: SpellBlueprint<MinionCard> = {
  id: 'innerFocus',
  name: 'Inner Focus',
  description: dedent /*html*/ `
  Wake up an ally minion. If it is in your base, give it +1 Commandment this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/inner-focus'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleAllyMinionTargetRules.canPlay(game, card, minion => minion.isOnBattlefield),
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
    const [target] = targets.cards;
    if (!target) return;

    await target.wakeUp();
    if (target.location === CARD_LOCATIONS.BASE) {
      await target.modifiers.add(
        new SimpleCommandmentBuffModifier('inner-focus', game, card, {
          amount: 1,
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
