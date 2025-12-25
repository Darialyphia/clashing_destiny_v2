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
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { manaSpark } from '../spells/mana-spark';
import type { MinionCard } from '../../../../entities/minion.entity';

export const manaWisp: MinionBlueprint = {
  id: 'mana-wisp',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Wisp',
  description: dedent`
  @On Death@: add a @Mana Spark@ to your hand. @[lvl] 3 Bonus@: Add another one.
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
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          const addManaShard = async () => {
            const spark = await card.player.generateCard(manaSpark.id);
            await spark.addToHand();
          };

          await addManaShard();
          if (levelMod.isActive) {
            await addManaShard();
          }
        }
      })
    );
  },
  async onPlay() {}
};
