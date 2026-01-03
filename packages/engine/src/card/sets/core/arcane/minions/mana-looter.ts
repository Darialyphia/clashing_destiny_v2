import dedent from 'dedent';
import { OnHitModifier } from '../../../../../modifier/modifiers/on-hit.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { manaSpark } from '../../neutral/spells/mana-spark';
import { StealthModifier } from '../../../../../modifier/modifiers/stealth.modifier';
import { getEmpowerStacks } from '../../../../card-actions-utils';

export const manaLooter: MinionBlueprint = {
  id: 'mana-looter',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Looter',
  description: dedent`
  @Stealth@.
  @On Hero Hit@: Add a  @${manaSpark.name}@ to your hand. If your hero is @Empowered@, draw a card instead.`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
      bg: 'minions/mana-looter-bg',
      main: 'minions/mana-looter',
      breakout: 'minions/mana-looter-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new StealthModifier(game, card, {}));

    await card.modifiers.add(
      new OnHitModifier(game, card, {
        async handler(event) {
          if (!event.data.card.equals(card.player.opponent.hero)) return;
          const isEmpowered = getEmpowerStacks(card) > 0;
          if (isEmpowered) {
            return await card.player.cardManager.draw(1);
          } else {
            const spark = await card.player.generateCard(manaSpark.id);
            await spark.addToHand();
          }
        }
      })
    );
  },
  async onPlay() {}
};
