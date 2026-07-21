import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
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
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import {
  askMandatoryYesNoQuestion,
  chooseColorlessRune
} from '../../../../card-actions-utils';
import { type Rune } from '../../../../../player/player.enums';
import { EphemeralModifier } from '../../../../../modifier/modifiers/ephemeral.modifier';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-trigger>On Attack</rt-trigger> You may consume <rt-runes runes="colorless"></rt-runes> to summon an <rt-keyword>Ephemeral</rt-keyword> <rt-card>Will-o-Wisp</rt-card> on the same location as this minion
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/pyromancer'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          if (card.isOnBattlefield) return;

          const canSummonWisp =
            card.player.runeManager.runeCount > 0 &&
            emptyBoardSpaceTargetRules.canPlay(
              game,
              space =>
                space.player.equals(card.player) && space.position.zone === card.location
            );
          if (!canSummonWisp) return;

          const shouldGenerateWisp = await askMandatoryYesNoQuestion({
            game,
            card,
            questionId: 'pyromancer-summon-wisp',
            label: 'Consume a rune to summon a Will-o-wisp?',
            timeoutFallback: 'no',
            aiChoice: 'yes'
          });

          if (!shouldGenerateWisp) return;

          const runeResult = await chooseColorlessRune({
            game,
            card,
            questionId: 'pyromancer-rune-choice'
          });

          if (runeResult.cancelled) return;
          await card.player.runeManager.remove([runeResult.result as Rune]);

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
          await generatedCard.playImmediatelyAt(result.result.spaces[0]);
          await generatedCard.wakeUp();
          await generatedCard.modifiers.add(new EphemeralModifier(game, card));
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
