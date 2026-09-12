import dedent from 'dedent';
import { defineSecretBlueprint } from '../../../card-blueprint';
import { defaultCardArt, noTargets } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const counterstrike = defineSecretBlueprint({
  id: 'counterstrike',
  name: 'Counterstrike',
  description: dedent /*html*/ `
  When an enemy minion declares an attack at this battlefield, wake up the target and give it +0/+2/+0 this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('secrets/counterstrike'),
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
    eventName: GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
    filter(game, card, event) {
      return event.data.attacker.isEnemy(card);
    }
  },
  async onTrigger(game, card, event) {
    const target = event.data.target;

    await target.wakeUp();
    await target.modifiers.add(
      new SimpleAttackBuffModifier('counterstrike', game, card, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  },
  aiHints: {
    shouldPlay: () => 1
  }
});
