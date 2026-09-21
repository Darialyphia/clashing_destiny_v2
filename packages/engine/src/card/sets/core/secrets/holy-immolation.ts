import dedent from 'dedent';
import { defineSecretBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion, noTargets } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { isDefined } from '@game/shared';
import { SpellDamage } from '../../../../utils/damage';

export const holyImmolation = defineSecretBlueprint({
  id: 'holy-immolation',
  name: 'Holy Immolation',
  description: dedent /*html*/ `
  When an ally minion is attacked and you have 4 or more influence here, heal all allies here for 4 and deal 4 damage to the attacker.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('secrets/holy-immolation'),
  kind: CARD_KINDS.SECRET,
  rarity: RARITIES.EPIC,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT, AFFINITIES.NEUTRAL],
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
      return (
        event.data.target.isAlly(card) &&
        event.data.target.location === card.location &&
        card.battlefield!.commandmentScore >= 4
      );
    }
  },
  async onTrigger(game, card, event) {
    const target = event.data.target;

    const targetsToHeal = [target, ...(target.position?.adjacentCards ?? [])]
      .filter(isDefined)
      .filter(isMinion);

    for (const minion of targetsToHeal) {
      await minion.heal(4);
    }

    await event.data.attacker.takeDamage(card, new SpellDamage(4, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
});
