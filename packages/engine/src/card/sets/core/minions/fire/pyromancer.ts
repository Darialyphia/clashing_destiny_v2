import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, emptyBoardSpaceTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';
import { askMandatoryYesNoQuestion } from '../../../../card-actions-utils';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-trigger>On Score</rt-trigger> Summon a <rt-card>Will-o-Wisp</rt-card> on the same location as this minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/pyromancer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [],
  manaCost: 4,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  statRequirements: {
    might: 2,
    focus: 1,
    wisdom: 1
  },
  atk: 2,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler() {
          if (!card.isOnBattlefield) return;

          const canSummonWisp = emptyBoardSpaceTargetRules.canPlay(
            game,
            space =>
              space.player.equals(card.player) && space.position.zone === card.location
          );
          if (!canSummonWisp) return;

          const result = await emptyBoardSpaceTargetRules.getTargets({
            game,
            card,
            predicate: space =>
              space.player.equals(card.player) && space.position.zone === card.location,
            label: 'Select a space to summon the Willowisp'
          });

          if (result.cancelled) return;

          const generatedCard = await card.player.generateCard<MinionCard>(
            'willowisp',
            card.isFoil
          );
          await generatedCard.playImmediatelyAt(result.result.spaces[0], {
            shouldExhaust: false
          });

          await generatedCard.wakeUp();
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
