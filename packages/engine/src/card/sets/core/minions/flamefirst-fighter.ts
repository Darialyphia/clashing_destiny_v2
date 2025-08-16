import { AttackerModifier } from '../../../../modifier/modifiers/attacker.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
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
  cardIconId: 'unit-flamefist-fighter',
  description: `@Attacker@ : add 1 stacks of @Ember@ to your hero.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new AttackerModifier(game, card, async () => {
        const modifier = card.player.hero.modifiers.get(EmberModifier);
        if (!modifier) {
          await card.player.hero.modifiers.add(new EmberModifier(game, card, 1));
        } else {
          modifier.addStacks(2);
        }
      })
    );
  },
  async onPlay() {}
};
