import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../card.enums';
import { OnMoveModifier } from '../../../../modifier/modifiers/on-move.modifier';
import { RootedModifier } from '../../../../modifier/modifiers/rooted.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const syvrelTheExile: MinionBlueprint = {
  id: 'syvrel-the-exile',
  name: 'Syvrel the Exile',
  description: dedent /*html*/ `
  <rt-trigger>On Engage</rt-trigger> You may move an enemy minion in base to this battlefield and <rt-keyword>Root</rt-keyword> it this turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/syvrel-the-exile'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 4,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnMoveModifier(game, card, {
        location: 'battlefield',
        async handler() {
          const destination = card.battlefield!.opponentBattlefield.spaces.find(
            space => space.isEmpty
          );
          if (!destination) return;

          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === CARD_LOCATIONS.BASE
          );

          if (!hasTarget) return;

          const result = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            label: 'Select an enemy minion in base',
            predicate: minion => minion.location === CARD_LOCATIONS.BASE,
            canCancel: true,
            aiHints: {
              shouldPick: () => 1
            },
            timeoutFallback: []
          });

          if (result.cancelled) return;
          const target = result.result.cards[0];
          await target.moveToSpace(destination);
          await target.modifiers.add(
            new RootedModifier(game, target, {
              mixins: [new UntilEndOfTurnModifierMixin(game)]
            })
          );
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
