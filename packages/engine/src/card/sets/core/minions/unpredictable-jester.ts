import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const unpredictableJester: MinionBlueprint = {
  id: 'unpredictable-jester',
  name: 'Unpredictable Jester',
  cardIconId: 'minions/unpredictable-jester',
  description: `@On Enter@ : Swap this minion's position with another ally minion.`,
  collectable: true,
  unique: false,
  manaCost: 2,
  atk: 2,
  maxHp: 2,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  job: null,
  spellSchool: null,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (!singleAllyMinionTargetRules.canPlay(game, card)) return;
          const [target] = await singleAllyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            {
              type: 'card',
              card
            },
            minion => !minion.equals(card)
          );

          await card.moveTo(
            {
              player: card.player,
              zone: target.position!.zone,
              slot: target.position!.slot
            },
            true
          );
        }
      })
    );
  },
  async onPlay() {}
};
