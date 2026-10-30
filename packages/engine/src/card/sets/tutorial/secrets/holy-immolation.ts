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
import { SpellDamage } from '../../../../utils/damage';

export const tutorialHolyImmolation = defineSecretBlueprint({
  id: 'tutorial-holy-immolation',
  name: 'Holy Immolation',
  description: dedent /*html*/ `
  When an enemy minion attacks at this battlefield, deal 3 damage to it.
  `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('secrets/holy-immolation'),
  kind: CARD_KINDS.SECRET,
  rarity: RARITIES.TOKEN,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: noTargets,
  async onInit() {},
  trigger: {
    // triggering on attack rather than on move: a minion destroyed in the middle of its move
    // stays displayed on the client
    eventName: GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
    filter(game, card, event) {
      return (
        event.data.attacker.isEnemy(card) &&
        event.data.attacker.location === card.location
      );
    }
  },
  async onTrigger(game, card, event) {
    // destroying the attacker here cancels the attack
    await event.data.attacker.takeDamage(card, new SpellDamage(3, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
});
