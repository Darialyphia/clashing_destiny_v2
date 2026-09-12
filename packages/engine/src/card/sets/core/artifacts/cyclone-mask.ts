import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  singleAllyMinionTargetRules,
  singleMinionTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { EquippedModifier } from '../../../../modifier/modifiers/equip.modifier';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';

export const cycloneMask: ArtifactBlueprint = {
  id: 'cycloneMask',
  name: 'Cyclone Mask',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('artifacts/cyclone-mask'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE],
  manaCost: 2,
  manaSupply: 2,
  durability: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'cyclone-mask-equip',
      label: 'Equip',
      description: dedent /*html*/ `
      <rt-keyword>Equip</rt-keyword>: Give the equipped minion +0/+1/+0 and "<rt-trigger>On Move</rt-trigger> You may move a minion."
      `,
      manaCost: 2,
      canUse: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
      getTargets: (game, card) =>
        singleAllyMinionTargetRules.getTargets({
          game,
          card,
          canCancel: true,
          timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
          aiHints: {
            shouldPick: () => 1
          }
        }),
      async onResolve(game, card, targets) {
        const target = targets.cards[0] as MinionCard;
        if (!target) return;

        if (card.modifiers.has(EquippedModifier)) {
          await card.modifiers.remove(EquippedModifier);
        }

        await card.modifiers.add(
          new EquippedModifier(game, card, {
            attachedTo: target,
            modifiersToAdd: [
              new SimpleAttackBuffModifier('cyclone-mask-atk-buff', game, card, {
                amount: 1
              }),
              new OnMoveModifier(game, card, {
                async handler() {
                  const canMove =
                    singleMinionTargetRules.canPlay(
                      game,
                      card,
                      minion => !minion.equals(target)
                    ) && emptyBoardSpaceTargetRules.canPlay(game);
                  if (!canMove) return;

                  const shouldMove = await askMandatoryYesNoQuestion({
                    game,
                    card,
                    questionId: 'cyclone-mask-on-move',
                    label: 'Do you want to move a minion?',
                    aiChoice: 'no'
                  });

                  if (!shouldMove) return;

                  const targetPredicate = (minion: MinionCard) =>
                    !minion.equals(target) &&
                    emptyBoardSpaceTargetRules.canPlay(game, space =>
                      space.player.equals(target.player)
                    );
                  const targetToMove = await singleMinionTargetRules.getTargets({
                    game,
                    card,
                    canCancel: false,
                    predicate: targetPredicate,
                    timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(
                      game,
                      card,
                      targetPredicate
                    ),
                    aiHints: {
                      shouldPick: () => 1
                    }
                  });
                  if (targetToMove.cancelled) return;
                  const minionToMove = targetToMove.result.cards[0] as MinionCard;
                  if (!minionToMove) return;

                  const destination = await emptyBoardSpaceTargetRules.getTargets({
                    game,
                    card,
                    canCancel: false,
                    predicate: space => space.player.equals(minionToMove.player),
                    label: 'Select a space to move the minion to.'
                  });

                  if (destination.cancelled) return;
                  await minionToMove.moveToSpace(destination.result.spaces[0]);
                }
              })
            ]
          })
        );
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
