import dedent from 'dedent';
import type { MainDeckCard } from '../../../../board/board.system';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { RushModifier } from '../../../../modifier/modifiers/rush.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { discardFromHand } from '../../../card-actions-utils';

export const ardentMonk: MinionBlueprint = {
  id: 'ardentMonk',
  name: 'Ardent Monk',
  cardIconId: 'unit-ardent-monk',
  description: dedent`
  @On Enter@ : Depending on the amount of @Ember@ stacks on your hero:
  • 1-2: gain +1@[attack]@
  • 3-5: discard 1 card, then draw 1 card
  • 6+: gain @Rush@ and @Cleave@.`,
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
        if (stacks >= 3 && card.player.cardManager.hand.length > 0) {
          await discardFromHand(game, card, { min: 1, max: 1 });
          await card.player.cardManager.draw(1);
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
