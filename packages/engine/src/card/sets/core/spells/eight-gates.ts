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
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { RemoveOnLocationChangeModifierMixin } from '../../../../modifier/mixins/remove-on-destroyed';

export const eightGates: SpellBlueprint<MinionCard> = {
  id: 'eightGates',
  name: 'Eight Gates',
  description: dedent /*html*/ `
  Give an ally minion +2/+4/+4. Destroy it at the end of the turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/eight-gates'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.EPIC,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE, AFFINITIES.FIRE],
  manaCost: 4,
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

    await target.modifiers.add(
      new SimpleAttackBuffModifier('eight-gates-atk-buff', game, card, {
        amount: 4,
        mixins: [new RemoveOnLocationChangeModifierMixin(game)]
      })
    );
    await target.modifiers.add(
      new SimpleCommandmentBuffModifier('eight-gates-cmd-buff', game, card, {
        amount: 2,
        mixins: [new RemoveOnLocationChangeModifierMixin(game)]
      })
    );
    await target.modifiers.add(
      new SimpleHealthBuffModifier('eight-gates-hp-buff', game, card, {
        amount: 4,
        mixins: [new RemoveOnLocationChangeModifierMixin(game)]
      })
    );
    game.once(GAME_EVENTS.TURN_END, async () => {
      if (target.isOnBoard) {
        await target.destroy(card);
      }
    });
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
