import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS
} from '../../../../card.enums';
import { FleetingModifier } from '../../../../../modifier/modifiers/fleeting.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { HinderedModifier } from '../../../../../modifier/modifiers/hindered.modifier';

export const orbOfConstellations: ArtifactBlueprint = {
  id: 'orb-of-constellations',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Orb of Constellations',
  description: dedent`
  @Hindered 1@.
  @On Enter@: Draw a card in your Destiny zone.`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
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
  manaCost: 3,
  durability: 1,
  speed: CARD_SPEED.FAST,
  abilities: [
    {
      id: 'orb-of-constellations-ability',
      description:
        'Banish an Arcane Spell in your Discard pile and add a fleeting copy of it to your hand.',
      label: 'Copy a spell in Discard pile.',
      canUse(game, card) {
        return Array.from(card.player.cardManager.discardPile).some(
          c => c.kind === CARD_KINDS.SPELL && c.faction === FACTIONS.ARCANE
        );
      },
      durabilityCost: 1,
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async getPreResponseTargets(game, card) {
        const choices = Array.from(card.player.cardManager.discardPile).filter(
          c => c.kind === CARD_KINDS.SPELL && c.faction === FACTIONS.ARCANE
        );

        if (choices.length === 0) {
          return [];
        }
        return game.interaction.chooseCards({
          player: card.player,
          label: 'Select an Arcane Spell in your Discard pile to banish.',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices
        });
      },
      async onResolve(game, card) {
        const choices = Array.from(card.player.cardManager.discardPile).filter(
          c => c.kind === CARD_KINDS.SPELL && c.faction === FACTIONS.ARCANE
        );

        if (choices.length === 0) {
          return;
        }
        const [cardToBanish] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Select an Arcane Spell in your Discard pile to banish.',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices
        });

        await cardToBanish.sendToBanishPile();
        const copy = await card.player.generateCard(cardToBanish.blueprintId);
        await copy.modifiers.add(new FleetingModifier(game, card));
        await card.addToHand();
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new HinderedModifier(game, card, 1));
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          await card.player.cardManager.drawIntoDestinyZone(1);
        }
      })
    );
  },
  async onPlay() {}
};
