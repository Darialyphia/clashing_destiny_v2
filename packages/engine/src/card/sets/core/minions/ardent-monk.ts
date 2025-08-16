import dedent from 'dedent';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
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
  description: dedent`
  @On Enter@ : Depending on the amount of @Ember@ stacks on your hero:
  • 1-2: this gains +1@[attack]@
  • 3-5: this gains @Rush@
  • 6+:  draw 1 card.`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 3,
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
      new OnEnterModifier(game, card, {
        handler: async () => {
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
            await card.modifiers.add(new CleaveModifier(game, card));
          }
          if (stacks >= 5) {
            await card.player.cardManager.draw(1);
          }
        }
      })
    );
  },
  async onPlay() {}
};
