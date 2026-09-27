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
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { SimpleSupplyModifier } from '../../../../modifier/modifiers/simple-supply-modifier';

export const soulArbiter: MinionBlueprint = {
  id: 'soul-arbiter',
  name: 'Soul Arbiter',
  description: dedent /*html*/ `
  <rt-keyword>Channel</rt-keyword>: Target card in the enemy Supply Zone costs <rt-mana>1</rt-mana> more and supplies <rt-mana>1</rt-mana> less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/soul-arbiter'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 4,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ChannelModifier('soul-arbiter-channel', game, card, {
        async handler() {
          const choices = Array.from(card.player.opponent.cardManager.supply);
          if (choices.length === 0) return;

          const selection = await game.interaction.chooseCards({
            canCancel: false,
            players: {
              [card.player.id]: {
                label: 'Select a card in the enemy Supply Zone',
                minChoiceCount: 1,
                maxChoiceCount: 1,
                choices: choices.map(card => ({
                  card,
                  aiHints: { shouldPick: () => 1 }
                })),
                timeoutFallback: [choices[0]]
              }
            }
          });

          const selectedCard = selection.result[card.player.id].cards[0];

          await selectedCard.modifiers.add(
            new SimpleManacostModifier('soul-arbiter-mana-cost-debuff', game, card, {
              amount: 1
            })
          );
          await selectedCard.modifiers.add(
            new SimpleSupplyModifier('soul-arbiter-supply-debuff', game, card, {
              amount: -1
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
