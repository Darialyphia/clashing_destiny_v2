import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { windDervish } from './wind-dervish';
import type { MinionCard } from '../../../entities/minion.entity';

export const zirixStarstrider: MinionBlueprint = {
  id: 'zirix-starstrider',
  name: 'Zirix Starstrider',
  description: dedent /*html*/ `
  <rt-keyword>Vigilant</rt-keyword>.
  <rt-trigger>On Move</rt-trigger> Move up to 2 <rt-card>Wind Dervish</rt-card> here and ready them. 
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/zirix-starstrider'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  manaCost: 5,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 6,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR, AFFINITIES.AIR],
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new VigilantModifier(game, card));
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        async handler() {
          const isValidDervish = (minion: MinionCard) =>
            minion.blueprintId === windDervish.id && minion.location !== card.location;

          const moveDervish = async () => {
            const hasTarget = singleAllyMinionTargetRules.canPlay(
              game,
              card,
              isValidDervish
            );
            if (!hasTarget) return true;

            const hasRoom = emptyBoardSpaceTargetRules.canPlay(
              game,
              space =>
                space.player.equals(card.player) && space.position.zone === card.location
            );
            if (!hasRoom) return true;

            const targetResult = await singleAllyMinionTargetRules.getTargets({
              game,
              card,
              predicate: isValidDervish,
              label: 'Select a Wind Dervish to move',
              canCancel: true,
              timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(
                game,
                card
              ),
              aiHints: { shouldPick: () => 1 }
            });

            if (targetResult.cancelled) return true;

            const targetDervish = targetResult.result.cards[0];
            if (!targetDervish) return true;

            const destination = emptyBoardSpaceTargetRules.defaultTimeoutFallback(
              game,
              space =>
                space.player.equals(card.player) && space.position.zone === card.location
            );

            await targetDervish.moveToSpace(destination[0]);
            await targetDervish.wakeUp();

            return false;
          };

          for (let i = 0; i < 2; i++) {
            const shouldStop = await moveDervish();
            if (shouldStop) break;
          }
        }
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
