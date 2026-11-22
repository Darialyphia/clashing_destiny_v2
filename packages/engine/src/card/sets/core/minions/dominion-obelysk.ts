import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  isMinion
} from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { windDervish } from './wind-dervish';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../entities/minion.entity';
import { StructureModifier } from '../../../../modifier/modifiers/structure.modifier';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { FACTION_IDS } from '../../../factions/factions';

export const dominionObelysk: MinionBlueprint = {
  id: 'dominion-obelysk',
  name: 'Dominion Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>.
  Your <rt-card>Wind Dervish</rt-card> have +1/+0/+0.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  manaCost: 3,
  manaSupply: 2,
  level: 3,
  exp: 1,
  factionId: FACTION_IDS.VETRUVIAN,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 2,
  commandment: 1,
  canPlay: () => true,
  abilities: [
    {
      id: 'dominion-obelysk-ability',
      label: 'Summon Wind Dervish',
      description: 'Summon a Wind Dervish in your base.',
      shouldExhaust: true,
      canUse: game => emptyBoardSpaceTargetRules.canPlay(game, space => space.isInBase),
      getTargets: (game, card) =>
        emptyBoardSpaceTargetRules.getTargets({
          game,
          card,
          label: 'Select an empty space in your base',
          canCancel: true,
          predicate: space => space.isInBase,
          timeoutFallback: emptyBoardSpaceTargetRules.defaultTimeoutFallback(
            game,
            space => space.isInBase
          )
        }),
      manaCost: 1,
      aiHints: {
        shouldUse: () => 1
      },
      async onResolve(game, card, targets) {
        const space = targets.spaces[0];
        if (!space) return;
        const dervish = await card.player.generateCard<MinionCard>(
          windDervish.id,
          card.isFoil
        );
        await dervish.playImmediatelyAt(space, { shouldExhaust: false });
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(new StructureModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier<MinionCard>('dominion-obelysk-aura', game, card, {
        mixins: [
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.isAlly(card) &&
                isMinion(candidate) &&
                candidate.isOnBoard &&
                candidate.blueprintId === windDervish.id
              );
            },
            getModifiers() {
              return [
                new SimpleStatsBuffModifier('dominion-obelysk-buff', game, card, {
                  cmd: 1,
                  atk: 0,
                  hp: 0
                })
              ];
            }
          })
        ]
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
