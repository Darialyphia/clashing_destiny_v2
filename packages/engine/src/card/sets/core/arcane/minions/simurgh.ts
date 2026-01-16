import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { wingOfSimurgh } from '../spells/wing-of-simurgh';
import { tailOfSimurgh } from '../spells/tail-of-simurgh';

export const simurgh: MinionBlueprint = {
  id: 'simurgh',
  kind: CARD_KINDS.MINION,
  collectable: false,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Simurgh',
  description: dedent`  
  @On Attack@: Add a @${wingOfSimurgh.name}@ or @${tailOfSimurgh.name}@ to Your hand.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.TOKEN,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/simurgh-bg',
      main: 'minions/simurgh',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const wing = await card.player.generateCard(wingOfSimurgh.id);
          const tail = await card.player.generateCard(tailOfSimurgh.id);
          const [selected] = await game.interaction.chooseCards({
            player: card.player,
            choices: [wing, tail],
            minChoiceCount: 1,
            maxChoiceCount: 1,
            label: 'Select a spell to add to your hand'
          });

          await selected.addToHand();
        }
      })
    );
  },
  async onPlay() {}
};
