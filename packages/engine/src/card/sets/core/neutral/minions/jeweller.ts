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
import { manaSpark } from '../spells/mana-spark';
import { plottingCounsellor } from './plotting-counsellor';
import type { MinionCard } from '../../../../entities/minion.entity';

export const jeweller: MinionBlueprint = {
  id: 'jeweller',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Jewel Crafter',
  description: dedent``,
  faction: FACTIONS.NEUTRAL,
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
      bg: 'minions/jeweller-bg',
      main: 'minions/jeweller',
      frame: 'default',
      tint: FACTIONS.NEUTRAL.defaultCardTint
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
      description: dedent`Add a @Mana Spark@ to your hand.`,
      label: 'Add Mana Spark',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        const spark = await card.player.generateCard(manaSpark.id);
        await spark.addToHand();
      }
    },
    {
      id: 'jeweller-ability-2',
      description: dedent`Banish this card and summon a @Plotting Counsellor@ exhausted.`,
      label: 'Summon Plotting Consellor',
      canUse: () => true,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 3,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        if (card.location !== CARD_LOCATIONS.BOARD) return;
        await card.sendToBanishPile();
        const consellor = await card.player.generateCard<MinionCard>(
          plottingCounsellor.id
        );
        await consellor.playImmediately();
        await consellor.exhaust();
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
