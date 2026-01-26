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
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { AbilityDamage } from '../../../../../utils/damage';

export const braveCitizen: MinionBlueprint = {
  id: 'brave-citizen',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Brave Citizen',
  description: dedent`
   @Pride 1@
   @On Attack@: if the attack target costs more than this card, deal 1 damage to it.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 1));

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler(event) {
          if (event.data.target.manaCost > card.manaCost) {
            await event.data.target.takeDamage(card, new AbilityDamage(1));
          }
        }
      })
    );
  },
  async onPlay() {}
};
