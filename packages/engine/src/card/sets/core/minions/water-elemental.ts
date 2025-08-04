import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { SpellCard } from '../../../entities/spell.entity';
import { fireBolt } from '../spells/fire-bolt';

export const waterElemental: MinionBlueprint = {
  id: 'water-elemental',
  name: 'Water Elemental',
  cardIconId: 'unit-water-elemental',
  description: dedent`
  @On Enter@ : Increase your @Tide@ by 1.
  @High Tide@ : Gain @Piercing@ and @Intimidate (2)@.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const createdCard = await card.player.generateCard<SpellCard>(fireBolt.id);
        await createdCard.addToHand();
      })
    );
  },
  async onPlay() {}
};
