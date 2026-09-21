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
import { GAME_EVENTS } from '../../../../game/game.events';
import { DAMAGE_TYPES } from '../../../../utils/damage';

export const lastStand = defineSecretBlueprint({
  id: 'last-stand',
  name: 'Last Stand',
  description: dedent /*html*/ `
  When an ally minion is attacked and destroyed at this battlefield, gain influence here equal to its Commandment.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('secrets/last-stand'),
  kind: CARD_KINDS.SECRET,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 4,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: noTargets,
  async onInit() {},
  trigger: {
    eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
    filter(game, card, event) {
      return (
        event.data.card.isAlly(card) &&
        event.data.card.location === card.location &&
        event.data.isFatal &&
        event.data.damage.type === DAMAGE_TYPES.COMBAT &&
        !!game.combatSystem.defender?.equals(event.data.card)
      );
    }
  },
  async onTrigger(game, card, event) {
    const target = event.data.card;

    await target.battlefield!.gainScore(target.commandment);
  },
  aiHints: {
    shouldPlay: () => 1
  }
});
