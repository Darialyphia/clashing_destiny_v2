import { type MainDeckCard } from '../../../../board/board.system';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { discover } from '../../../card-actions-utils';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const esteemedErudite: MinionBlueprint = {
  id: 'esteemed-erudite',
  name: 'Esteemed Erudite',
  cardIconId: 'unit-esteemed-erudite',
  description: `@On Enter@: @Discover@ a Spell from one of your affinities.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.ARCANE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const choicePool = await Promise.all(
          Object.values(game.cardPool)
            .filter(
              blueprint =>
                blueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
                card.player.unlockedAffinities.includes(blueprint.affinity) &&
                blueprint.kind === CARD_KINDS.SPELL
            )
            .map(blueprint => card.player.generateCard<MainDeckCard>(blueprint.id))
        );

        await discover(game, card, choicePool);
      })
    );
  },
  async onPlay() {}
};
