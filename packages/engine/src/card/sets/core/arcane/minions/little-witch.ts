import { MinionInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import type { MinionCard } from '../../../../entities/minion.entity';

export const littleWitch: MinionBlueprint = {
  id: 'little-witch',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Little Witch',
  description: '',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 1,
  runeCost: {
    KNOWLEDGE: 1
  },
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [
    {
      id: 'little-witch-ability-1',
      description:
        'Deal 1 damage to an enemy minion. Increase the cost of this ability by 1.',
      label: 'Deal 1 Damage',
      canUse: singleEnemyMinionTargetRules.canPlay,
      getPreResponseTargets(game, card) {
        return singleEnemyMinionTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          card,
          abilityId: 'little-witch-ability-1'
        });
      },
      manaCost: 1,
      shouldExhaust: true,
      runeCost: {},
      speed: CARD_SPEED.FAST,
      async onResolve(game, card, targets, ability) {
        const target = targets[0] as MinionCard;
        if (!target) return;
        if (target.location !== 'board') return;
        await target.takeDamage(card, new AbilityDamage(1));
        await ability.addInterceptor('manaCost', val => val + 1);
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
