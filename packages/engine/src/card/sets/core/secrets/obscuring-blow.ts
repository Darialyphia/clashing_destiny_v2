import dedent from 'dedent';
import { defineSecretBlueprint } from '../../../card-blueprint';

import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  noTargets,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const obscuringBlow = defineSecretBlueprint({
  id: 'obscuring-blow',
  name: 'Obscuring Blow',
  description: dedent /*html*/ `
  When an enemy minion scores at this battlefield, move an ally in base to this battlefield, wake it up, and give it <rt-keyword>Backstab 2</rt-keyword> this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('secrets/obscuring-blow'),
  kind: CARD_KINDS.SECRET,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 4,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: noTargets,
  async onInit() {},
  trigger: {
    eventName: GAME_EVENTS.AFTER_SCORE,
    filter(game, card, event) {
      return (
        event.data.card.isEnemy(card) &&
        event.data.card.location === card.location &&
        !!card.battlefield?.spaces.some(space => space.isEmpty) &&
        singleAllyMinionTargetRules.canPlay(
          game,
          card,
          minion => minion.location === CARD_LOCATIONS.BASE
        )
      );
    }
  },
  async onTrigger(game, card) {
    const targetResult = await singleAllyMinionTargetRules.getTargets({
      game,
      card,
      canCancel: false,
      predicate: minion => minion.location === CARD_LOCATIONS.BASE,
      timeoutFallback: [],
      aiHints: {
        shouldPick: () => 1
      }
    });
    if (targetResult.cancelled) return;
    const [target] = targetResult.result.cards;
    if (!target) return;

    const destinationResult = await emptyBoardSpaceTargetRules.getTargets({
      game,
      card,
      canCancel: false,
      predicate: space =>
        space.player.equals(card.player) && space.position.zone === card.location,
      label: 'Select a space to move the minion to.'
    });

    if (destinationResult.cancelled) return;

    const [destination] = destinationResult.result.spaces;
    await target.moveToSpace(destination);
    await target.wakeUp();
    await target.modifiers.add(
      new BackstabModifier(game, card, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
});
