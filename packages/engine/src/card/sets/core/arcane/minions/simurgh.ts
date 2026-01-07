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
import { splittingBeam } from '../spells/splitting-beam';
import { isSpell } from '../../../../card-utils';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { FleetingModifier } from '../../../../../modifier/modifiers/fleeting.modifier';

export const simurgh: MinionBlueprint = {
  id: 'simurgh',
  kind: CARD_KINDS.MINION,
  collectable: false,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Simurgh',
  description: dedent`  
  @On Attack@: Put 2 @Fleeting@ copies of @${splittingBeam.name}@ in your hand, then reduce the cost of Arcane spells in your hand by 1.
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
  atk: 4,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const cardsToAdd = [
            await card.player.generateCard(splittingBeam.id),
            await card.player.generateCard(splittingBeam.id)
          ];
          for (const c of cardsToAdd) {
            await c.modifiers.add(new FleetingModifier(game, c));
            await c.addToHand();
          }

          const arcaneSpellsInHand = card.player.cardManager.hand.filter(
            c => c.faction === FACTIONS.ARCANE && isSpell(c)
          );

          for (const arcaneSpell of arcaneSpellsInHand) {
            await arcaneSpell.modifiers.add(
              new SimpleManacostModifier('simurgh-cost-reduction', game, card, {
                amount: -1
              })
            );
          }
        }
      })
    );
  },
  async onPlay() {}
};
