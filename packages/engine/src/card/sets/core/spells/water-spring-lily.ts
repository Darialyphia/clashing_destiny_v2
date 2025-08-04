import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const waterSpringLily: MinionBlueprint = {
  id: 'water-spring-lily',
  name: 'Water Spring Lily',
  cardIconId: 'unit-water-spring-lily',
  description: dedent`
   @On Enter@  : Swap position with an ally minion.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 1,
  maxHp: 1,
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
        const [target] = await game.interaction.selectMinionSlot({
          player: card.player,
          isElligible: slot =>
            slot.player.equals(card.player) &&
            card.player.boardSide.getSlot(slot.zone, slot.slot)!.isOccupied,
          isDone(selectedSlots) {
            return selectedSlots.length === 1;
          },
          canCommit(selectedSlots) {
            return selectedSlots.length === 1;
          }
        });

        await card.player.boardSide.moveMinion(card.position!, target, {
          allowSwap: true
        });
      })
    );
  },
  async onPlay() {}
};
