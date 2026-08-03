import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  isMinion
} from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { WhileOnBaseModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import type { MinionCard } from '../../../../entities/minion.entity';
import { DefenderModifier } from '../../../../../modifier/modifiers/defender.modifier';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const mosscloakQuartermaster: MinionBlueprint = {
  id: 'mosscloakQuartermaster',
  name: 'Mosscloak Quartermaster',
  description: dedent /*html*/ `
  <rt-location locations="base">In Base</rt-location> Your other minions have <rt-keyword>Defender 1</rt-keyword>.
  <rt-runes runes="focus,resonance"></rt-runes> <rt-trigger>On Score</rt-trigger> Move this minion to your base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.WARRIOR],
  affinities: [AFFINITIES.EARTH],
  manaCost: 2,
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 4,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBaseModifier<MinionCard>(
        'mosscloak-quartermaster-defender',
        game,
        card,
        {
          mixins: [
            new CardAuraModifierMixin(game, card, {
              isElligible(candidate) {
                return (
                  isMinion(candidate) && !candidate.equals(card) && candidate.isOnBoard
                );
              },
              getModifiers() {
                return [new DefenderModifier(game, card, { amount: 1 })];
              }
            })
          ]
        }
      )
    );

    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        mixins: [new RuneCostToggleModifierMixin(game, card, { focus: 1, resonance: 1 })],
        async handler() {
          const hasRoom = emptyBoardSpaceTargetRules.canPlay(
            game,
            space =>
              space.player.equals(card.player) &&
              space.position.zone === CARD_LOCATIONS.BASE
          );
          if (!hasRoom) return;

          const destinationResult = await emptyBoardSpaceTargetRules.getTargets({
            game,
            card,
            label: 'Select a base space to move to',
            canCancel: false,
            predicate: space =>
              space.player.equals(card.player) &&
              space.position.zone === CARD_LOCATIONS.BASE
          });

          const destination = destinationResult.result.spaces[0];
          await card.move(destination.position.zone, destination.position.index);
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
