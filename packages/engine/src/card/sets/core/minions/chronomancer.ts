import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { FleetingModifier } from '../../../../modifier/modifiers/fleeting.modifier';
import type { AnyCard } from '../../../entities/card.entity';

export const chronomancer: MinionBlueprint = {
  id: 'chronomancer',
  name: 'Chronomancer',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger>: Add a copy of the last card you played to your hand this turn and give it <rt-keyword>Fleeting</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/chronomancer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    let cardToCopy: AnyCard | undefined;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        beforeSchedule: async () => {
          cardToCopy = card.player.cardTracker.lastPlayedCardThisTurn?.card;
        },
        async handler() {
          if (!cardToCopy) return;

          const copy = await card.player.generateCard(
            cardToCopy.blueprintId,
            card.isFoil
          );
          await copy.addToHand();
          if (!copy.modifiers.has(FleetingModifier)) {
            await copy.modifiers.add(new FleetingModifier(game, card));
          }
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
