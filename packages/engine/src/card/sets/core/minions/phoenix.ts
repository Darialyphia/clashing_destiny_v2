import dedent from 'dedent';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { PrideModifier } from '../../../../modifier/modifiers/pride.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const phoenix: MinionBlueprint = {
  id: 'phoenix',
  name: 'Phoenix',
  cardIconId: 'unit-rainbow-phoenix',
  description: dedent`
  @Pride(3)@.
  @On Enter@ : inflicts @Burn@ to all enemy minions.
  @On Death@: If your hero has at least 4 @Ember@ stacks, consume them to summon this in the Defense zone exhausted.`,
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
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 3));
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        for (const target of card.player.enemyMinions) {
          await target.modifiers.add(new BurnModifier(game, card));
        }
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          const ember = card.player.hero.modifiers.get(EmberModifier);
          if (!ember || ember?.stacks < 4) return;

          const hasRoom = card.player.boardSide.defenseZone.hasEmptySlot;
          if (!hasRoom) return;

          await ember.removeStacks(4);

          const [position] = await game.interaction.selectMinionSlot({
            player: card.player,
            isElligible: slot => card.player.boardSide.defenseZone.has(slot),
            canCommit(selectedSlots) {
              return selectedSlots.length === 1;
            },
            isDone(selectedSlots) {
              return selectedSlots.length === 1;
            }
          });

          await card.playAt(position);
        }
      })
    );
  },
  async onPlay(game, card) {}
};
