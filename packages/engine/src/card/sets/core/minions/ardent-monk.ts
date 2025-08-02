import type { MainDeckCard } from '../../../../board/board.system';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const ardentMonk: MinionBlueprint = {
  id: 'ardentMonk',
  name: 'Ardent Monk',
  cardIconId: 'unit-ardent-monk',
  description: `@On Enter@ : Depending on the amount of @Ember@ stacks on your hero:\n• 1-2: gain +1@[attack]@\n• 3-5: draw a card in your Destiny zone\n• 6+: gain @Rush@ and @Cleave@.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 3,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        const emberModifier = card.player.hero.modifiers.get(EmberModifier);
        if (!emberModifier) return;

        const stacks = emberModifier.stacks;
        if (stacks >= 1) {
          await card.modifiers.add(
            new SimpleAttackBuffModifier('ardentMonkAtkBuff', game, card, {
              amount: 1
            })
          );
        }
        if (stacks >= 3) {
          await card.player.cardManager.drawIntoDestinyZone(1);
        }
        if (stacks >= 5) {
          await card.modifiers.add(new CleaveModifier(game, card));
          await card.modifiers.add(new RushModifier(game, card));
        }
      })
    );
  },
  async onPlay() {}
};
