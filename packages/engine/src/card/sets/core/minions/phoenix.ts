import dedent from 'dedent';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { singleEmptyAllySlot } from '../../../card-utils';
import type { MinionPosition } from '../../../../game/interactions/selecting-minion-slots.interaction';

export const phoenix: MinionBlueprint = {
  id: 'phoenix',
  name: 'Phoenix',
  cardIconId: 'unit-rainbow-phoenix',
  description: dedent`
  @Pride (3)@.
  @On Enter@ : inflicts @Burn@ to all enemy minions.
  `,
  collectable: true,
  unique: false,
  manaCost: 5,
  atk: 4,
  maxHp: 4,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  setId: CARD_SETS.CORE,
  tags: [],
  abilities: [
    {
      id: 'phoenix-ability',
      description: 'Consume 5 @Ember@ stacks : Summon this from your discard pile.',
      label: 'Resurrect',
      manaCost: 0,
      shouldExhaust: false,
      canUse: (game, card) => {
        const ember = card.player.hero.modifiers.get(EmberModifier);
        if (!ember) return false;

        return ember.stacks >= 5 && singleEmptyAllySlot.canPlay(game, card);
      },
      getPreResponseTargets(game, card) {
        return singleEmptyAllySlot.getPreResponseTargets(game, card);
      },
      async onResolve(game, card, targets) {
        const ember = card.player.hero.modifiers.get(EmberModifier);
        if (!ember) return;
        if (ember.stacks < 5) return;
        await ember.removeStacks(5);

        const position = targets[0] as MinionPosition;
        await card.playAt(position);
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          for (const target of card.player.enemyMinions) {
            await target.modifiers.add(new BurnModifier(game, card));
          }
        }
      })
    );
  },
  async onPlay() {}
};
