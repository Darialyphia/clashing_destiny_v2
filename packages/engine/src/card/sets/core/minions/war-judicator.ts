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
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleSupplyModifier } from '../../../../modifier/modifiers/simple-supply-modifier';

export const warJudicator: MinionBlueprint = {
  id: 'war-judicator',
  name: 'War Judicator',
  description: dedent /*html*/ `
  <rt-keyword>Zeal 5</rt-keyword>: draw a card and increase its supply by 1.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/war-judicator'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 6,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier(game, card, {
        amount: 5,
        zealedModifiers: [],
        onGainZeal: async () => {
          const [drawnCard] = await card.player.cardManager.draw(1);
          if (!drawnCard) return;
          await drawnCard.modifiers.add(
            new SimpleSupplyModifier('war-judicator-supply-buff', game, drawnCard, {
              amount: 1
            })
          );
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
