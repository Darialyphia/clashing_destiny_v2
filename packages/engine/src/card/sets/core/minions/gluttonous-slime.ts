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
import { TauntModifier } from '../../../../modifier/modifiers/taunt.modifier';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';

export const gluttonousSlime: MinionBlueprint = {
  id: 'gluttonous-slime',
  name: 'Gluttonous Slime',
  cardIconId: 'unit-gluttonous-slime',
  description: dedent`
  @[level] 3+@: @Taunt@.
  @On Death@: Summon two @Friendly Slime@ next to this.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new TauntModifier(game, card, {}));
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {}
      })
    );
  },
  async onPlay() {}
};
