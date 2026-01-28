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
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';

export const birdOfGoodLuck: MinionBlueprint = {
  id: 'bird-of-good-luck',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Bird of Good Luck',
  description: dedent`
  @[lvl] 1 Bonus@ @On Enter@: If you have less @Influence@ than your opponent, draw a card in your Destiny zone.
  `,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 1)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (!levelMod.isActive) return;

          if (card.player.influence < card.player.opponent.influence) {
            await card.player.cardManager.drawIntoDestinyZone(1);
          }
        }
      })
    );
  },
  async onPlay() {}
};
