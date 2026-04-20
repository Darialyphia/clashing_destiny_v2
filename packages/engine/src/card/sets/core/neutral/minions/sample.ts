import { TARGETING_TYPES } from '../../../../../aoe/aoe.enums';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  defaultMinionPlaySequence,
  singleEnemyTargetRules
} from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  JOBS,
  RARITIES
} from '../../../../card.enums';

export const sample: MinionBlueprint = {
  id: 'sample',
  name: 'Sample',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 1,
  tags: [],
  atk: 1,
  retaliation: 1,
  maxHp: 1,
  abilities: [
    {
      id: 'sample-ability1',
      label: 'Draw a card',
      description: 'Draw a card.',
      manaCost: 1,
      canUse: (game, card) => {
        return card.location === CARD_LOCATIONS.BOARD;
      },
      getAoe: () => new NoAOEShape(TARGETING_TYPES.ENEMY_UNIT, {}),
      getCooldown: () => 0,
      getTargets: (game, card, onCancel) =>
        anywhereTargetRules.getTargets({ min: 1, max: 1 })(game, card, {
          canCancel: true,
          onCancel
        }),
      async onResolve(game, card) {
        await card.player.cardManager.drawFromDeck(1);
      }
    },

    {
      id: 'sample-ability2',
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
