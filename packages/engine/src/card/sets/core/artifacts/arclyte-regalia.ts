import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { EquippedModifier } from '../../../../modifier/modifiers/equip.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';

export const arclyteRegalia: ArtifactBlueprint = {
  id: 'arclyte-regalia',
  name: 'Arclyte Regalia',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('artifacts/arclyte-regalia'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 3,
  manaSupply: 2,
  durability: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'arclyte-regalia-equip',
      label: 'Equip',
      description: dedent /*html*/ `
      <rt-keyword>Equip</rt-keyword>: Give the equipped minion +1/+0/+0 and "<rt-timing>Start of turn</rt-timing> the next time this takes damage, prevent 2 of that damage.".
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
              new SimpleCommandmentBuffModifier('cyclone-mask-atk-buff', game, card, {
                amount: 1
              }),
              new WhileOnBattlefieldModifier<MinionCard>(
                'arclyte-regalia-damage-absorb',
                game,
                card,
                {
                  mixins: [
                    new GameEventModifierMixin(game, {
                      eventName: GAME_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
                      filter: event => event.data.card.equals(target),
                      frequencyPerGameTurn: 1,
                      async handler(event) {
                        event.data.damage.addFlatModifier(-2);
                      }
                    })
                  ]
                }
              )
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
