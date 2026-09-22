import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';

export const flutterCrane: MinionBlueprint = {
  id: 'flutter-crane',
  name: 'Flutter Crane',
  description: dedent /*html*/ `
  <rt-timing>Once per turn</rt-timing><rt-trigger>On Move</rt-trigger> Put a spell from your Supply in your hand.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/fluttercrane'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 2,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        frequencyPerGameTurn: 1,
        async handler() {
          const spellsInSupply = [...card.player.cardManager.supply].filter(isSpell);
          if (!spellsInSupply.length) return;

          const spellToAdd = await game.interaction.chooseCards({
            canCancel: false,
            players: {
              [card.player.id]: {
                label: 'Choose a spell to add to your hand',
                choices: spellsInSupply.map(spell => ({
                  card: spell,
                  aiHints: { shouldPick: () => 1 }
                })),
                minChoiceCount: 1,
                maxChoiceCount: 1,
                timeoutFallback: [spellsInSupply[0]]
              }
            }
          });

          if (spellToAdd.cancelled) return;

          const [spell] = spellToAdd.result[card.player.id].cards;
          await spell.addToHand();
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
