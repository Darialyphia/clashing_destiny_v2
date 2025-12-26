import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { manaSpark } from '../../neutral/spells/mana-spark';
import { FleetingModifier } from '../../../../../modifier/modifiers/fleeting.modifier';
import { plottingConsellor } from './plotting-consellor';
import type { MinionCard } from '../../../../entities/minion.entity';

export const jeweller: MinionBlueprint = {
  id: 'jeweller',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Jeweller',
  description: dedent``,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 3,
  canPlay: () => true,
  abilities: [
    {
      id: 'jeweller-ability-1',
      description: dedent`Add a @Fleeting@ @Mana Spark@ to your hand.`,
      label: 'Add Mana Spark',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.SLOW,
      async onResolve(game, card) {
        const spark = await card.player.generateCard(manaSpark.id);
        await spark.modifiers.add(new FleetingModifier(game, spark));
        await spark.addToHand();
      }
    },
    {
      id: 'jeweller-ability-2',
      description: dedent`Banish this card and summon a @Plotting Consellor@ in its place.`,
      label: 'Summon Plotting Consellor',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 4,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        if (card.location !== CARD_LOCATIONS.BOARD) return;
        const zone = card.zone!;
        await card.sendToBanishPile();
        const consellor = await card.player.generateCard<MinionCard>(
          plottingConsellor.id
        );
        await consellor.playImmediatelyAt(zone);
      }
    }
  ],
  async onInit(game, card) {},
  async onPlay() {}
};
