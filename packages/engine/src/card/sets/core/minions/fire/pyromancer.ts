import dedent from 'dedent';
import { RuneCostToggleModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  singleEnemyMinionTargetRules
} from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { AbilityDamage } from '../../../../../utils/damage';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { OnKillModifier } from '../../../../../modifier/modifiers/on-kill.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';

export const pyromancer: MinionBlueprint = {
  id: 'pyromancer',
  name: 'Pyromancer',
  description: dedent /*html*/ `
  <rt-trigger>On Attack</rt-trigger> You may deal 1 damage to an enemy on the same battlefield.
  <rt-runes runes="wisdom,might"></rt-runes> <rt-trigger>On Kill</rt-trigger> summon a <rt-card>Will-o-Wisp</rt-card> exhausted on the same location as this minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.MAGE],
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === card.location
          );

          if (!hasTarget) return;
          const target = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            canCancel: false,
            label: 'Select an enemy minion to deal 1 damage to',
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            },
            predicate: minion => minion.location === card.location
          });
          if (!target) return;
          if (target.cancelled) return;

          await target.result.cards[0]?.takeDamage(card, new AbilityDamage(1));
        }
      })
    );

    await card.modifiers.add(
      new OnKillModifier(game, card, {
        async handler() {
          if (card.isOnBattlefield) return;
          const generatedCard = await card.player.generateCard<MinionCard>(
            'willowisp',
            card.isFoil
          );
          const hasRoom = emptyBoardSpaceTargetRules.canPlay(
            game,
            space =>
              space.player.equals(card.player) && space.position.zone === card.location
          );
          if (!hasRoom) return;

          const result = await emptyBoardSpaceTargetRules.getTargets({
            game,
            card,
            predicate: space =>
              space.player.equals(card.player) && space.position.zone === card.location,
            label: 'Select a space to summon the Willowisp'
          });
          if (!result) return;
          if (result.cancelled) return;
          await generatedCard.playImmediatelyAt(result.result.spaces[0]);
        },
        mixins: [
          new RuneCostToggleModifierMixin(game, card, {
            wisdom: 1,
            might: 1
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
