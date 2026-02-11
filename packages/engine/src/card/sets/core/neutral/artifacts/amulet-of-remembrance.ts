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
import { isMinion } from '../../../../card-utils';

export const amuletOfRemembrance: ArtifactBlueprint = {
  id: 'amulet-of-remembrance',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Amulet of Remembrance',
  description: dedent``,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.COMMON,
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
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  destinyCost: 1,
  durability: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [
    {
      id: 'amulet-of-remembrance-ability',
      description:
        'Choose a minion you control that was destroyed this turn with cost equal or less than 1 + your hero level and put it into your Destiny Zone.',
      dynamicDescription(game, card) {
        const heroLevel = card.player.hero.level;
        const maxCost = 1 + heroLevel;
        return dedent`
        Choose a minion you control that was destroyed this turn with cost equal or less than @[dynamic]${maxCost}| 1 + your hero level@ and put it into your Destiny Zone.
        `;
      },
      label: 'Draw Card',
      canUse: (game, card) =>
        card.location === CARD_LOCATIONS.BOARD &&
        card.player.cardTracker.cardsDestroyedThisGameTurn.some(
          c =>
            c.card.isAlly(card) &&
            isMinion(c.card) &&
            c.card.manaCost <= 1 + card.player.hero.level
        ),
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      durabilityCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        const choices = card.player.cardTracker.cardsDestroyedThisGameTurn
          .map(c => c.card)
          .filter(
            c => c.isAlly(card) && isMinion(c) && c.manaCost <= 1 + card.player.hero.level
          );

        const [selected] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose a minion to put into your Destiny Zone',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices,
          timeoutFallback: choices.slice(0, 1)
        });

        await selected.sendToDestinyZone();
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
