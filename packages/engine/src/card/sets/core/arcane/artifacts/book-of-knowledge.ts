import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { scry } from '../../../../card-actions-utils';
import { isSpell } from '../../../../card-utils';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';

export const bookOfKnowledge: ArtifactBlueprint = {
  id: 'book-of-knowledge',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Book of Knowledge',
  description: dedent``,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  subKind: ARTIFACT_KINDS.RELIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 1,
  durability: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [
    {
      id: 'book-of-knowledge-ability',
      description:
        '@Scry 2@. If you kept an Arcane spell on top of your deck, @Empower 1@, otherwise draw a card.',
      label: 'Scry and Empower',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      durabilityCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        const { result } = await scry(game, card, 2);

        const hasArcaneSpell = result.top.some(
          c => isSpell(c) && c.faction === FACTIONS.ARCANE
        );

        if (hasArcaneSpell) {
          await card.player.hero.modifiers.add(
            new EmpowerModifier(game, card, { amount: 1 })
          );
        } else {
          await card.player.cardManager.draw(1);
        }
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
