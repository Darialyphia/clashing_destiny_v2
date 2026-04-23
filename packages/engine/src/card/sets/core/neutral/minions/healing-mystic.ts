import { TARGETING_TYPES } from '../../../../../aoe/aoe.enums';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { PointAOEShape } from '../../../../../aoe/point.aoe-shape';
import { MinionOnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  defaultMinionPlaySequence,
  singleEnemyTargetRules,
  singleUnitTargetRules
} from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';

export const healingMystic: MinionBlueprint = {
  id: 'healing_mystic',
  name: 'Healing Mystic',
  description: '<rt-trigger>On Enter</rt-trigger>: Heal target minion for 2.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 1,
  tags: [],
  atk: 2,
  retaliation: 1,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        const [target] = await singleUnitTargetRules.getTargets(game, card, {
          required: false,
          getLabel() {
            return `${card.blueprint.name} : Select a minion to heal`;
          },
          canCancel: false,
          timeoutFallback: []
        });
        if (!target) return;
        await target.unit?.heal(card, 2);
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
