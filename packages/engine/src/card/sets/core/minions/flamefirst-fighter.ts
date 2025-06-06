import { AttackerModifier } from '../../../../modifier/modifiers/attacker.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const flamefistFighter: MinionBlueprint = {
  id: 'flamefist-fighter',
  name: 'Flamefist Fighter',
  cardIconId: 'flamefist-fighter',
  description: `@Attacker@: +1 / + 0.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 1,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const buff = new AttackerModifier(game, card, async () => {
      await card.modifiers.add(
        new SimpleAttackBuffModifier('flamefistFighter', game, card, { amount: 1 })
      );
    });

    await card.modifiers.add(
      new AttackerModifier(game, card, async () => {
        await card.modifiers.add(buff);
      })
    );
  },
  async onPlay() {}
};
