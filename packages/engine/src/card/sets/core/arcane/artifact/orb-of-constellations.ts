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
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { ArtifactCard } from '../../../../entities/artifact.entity';
import { GAME_EVENTS } from '../../../../../game/game.events';

export const orbOfConstellations: ArtifactBlueprint = {
  id: 'orb-of-constellations',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Orb of Constellations',
  description: dedent`Whenever you @Consume@, draw a card in your Destiny Zone and this loses 1 Durability.`,
  faction: FACTIONS.ARCANE,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 1,
  durability: 2,
  runeCost: {
    KNOWLEDGE: 2
  },
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<ArtifactCard>('orb-of-constellations', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.AFTER_SPEND_RUNE,
            filter: event => {
              return event.data.player.equals(card.player);
            },
            async handler() {
              await card.player.cardManager.drawIntoDestinyZone(1);
              await card.loseDurability(1);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
