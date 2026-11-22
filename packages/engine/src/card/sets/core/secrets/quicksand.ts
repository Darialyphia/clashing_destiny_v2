import dedent from 'dedent';
import { defineSecretBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion, noTargets } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { FACTION_IDS } from '../../../factions/factions';

export const quicksand = defineSecretBlueprint({
  id: 'quicksand',
  name: 'Quicksand',
  description: dedent /*html*/ `
  When an enemy minion moves to this battlefield, exhaust it and inflict <rt-keyword>Burn 1</rt-keyword> to it.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SECRET,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.VETRUVIAN,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: noTargets,
  async onInit() {},
  trigger: {
    eventName: GAME_EVENTS.CARD_AFTER_MOVE,
    filter(game, card, event) {
      return (
        isMinion(event.data.card) &&
        event.data.card.isEnemy(card) &&
        event.data.to.position.zone === card.location
      );
    }
  },
  async onTrigger(game, card, event) {
    const target = event.data.card as MinionCard;

    await target.exhaust();
    await target.modifiers.add(new BurnModifier(game, card, { stacks: 1 }));
  },
  aiHints: {
    shouldPlay: () => 1
  }
});
