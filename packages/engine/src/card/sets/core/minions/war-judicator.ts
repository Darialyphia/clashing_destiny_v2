import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES,
  CARD_LOCATIONS
} from '../../../card.enums';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../entities/minion.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';

export const warJudicator: MinionBlueprint = {
  id: 'war-judicator',
  name: 'War Judicator',
  description: dedent /*html*/ `
  <rt-keyword>Zeal 4</rt-keyword>: <rt-keyword>Reserve</rt-keyword> a card.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/war-judicator'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 6,
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
        amount: 4,
        zealedModifiers: [],
        onGainZeal: async () => {
          for (const topCard of card.player.cardManager.mainDeck.peek(1)) {
            await topCard.addToReserve();
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
