import { TARGETING_TYPES } from '../../../../../aoe/aoe.enums';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  defaultCardArt,
  defaultMinionPlaySequence,
  singleEnemyTargetRules
} from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';

export const sample2: MinionBlueprint = {
  id: 'sample2',
  name: 'Sample2',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.RANGED,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 2,
  tags: [],
  atk: 2,
  retaliation: 1,
  maxHp: 3,
  abilities: [
    {
      id: 'sample2-ability1',
      label: 'Deal 1 damage',
      description: 'Deal 1 damage to an enemy minion.',
      manaCost: 1,
      canUse: (game, card) => {
        return (
          card.location === CARD_LOCATIONS.BOARD &&
          singleEnemyTargetRules.canPlay(game, card)
        );
      },
      getAoe: () => new PointAOEShape(TARGETING_TYPES.ENEMY_UNIT, {}),
      getCooldown: () => 0,
      getTargets: (game, card, onCancel) =>
        singleEnemyTargetRules.getTargets(game, card, {
          timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
          canCancel: true,
          onCancel
        }),
      async onResolve(game, card, options) {
        const units = game.unitSystem.getUnitsInAOE(
          options.aoe,
          options.targets,
          card.player
        );
        for (const unit of units) {
          await unit.takeDamage(card, new AbilityDamage(card, 1));
        }
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
