import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { manaSpark } from '../spells/mana-spark';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { MinionCard } from '../../../entities/minion.entity';

export const manaWisp: MinionBlueprint = {
  id: 'mana-wisp',
  name: 'Mana Wisp',
  cardIconId: 'minions/mana-wisp',
  description: dedent`
  @On Death@ : Add a @${manaSpark.name}@ to your hand.
  @[level] 3 bonus@ : add 2 more.
  `,
  collectable: true,
  unique: false,
  manaCost: 1,
  atk: 1,
  maxHp: 1,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  job: null,
  spellSchool: null,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 3)
    )) as LevelBonusModifier<MinionCard>;
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          const count = 1 + (levelMod.isActive ? 2 : 0);
          for (let i = 0; i < count; i++) {
            const spark = await card.player.generateCard(manaSpark.id);
            await spark.addToHand();
          }
        }
      })
    );
  },
  async onPlay() {}
};
