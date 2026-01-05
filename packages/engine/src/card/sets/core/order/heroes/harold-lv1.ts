import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { SimpleMinionStatsModifier } from '../../../../../modifier/modifiers/simple-minion-stats.modifier';
import { scry } from '../../../../card-actions-utils';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const haroldLv1: HeroBlueprint = {
  id: 'harold-knight-of-prophecy',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Harold, Knight of Prophecy',
  description: '@On Enter@: @Scry 2@. Give an allied minion +1/+1.',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: false,
        gradient: false,
        lightGradient: true,
        scanlines: false,
        goldenGlare: false,
        glitter: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv1-bg',
      main: 'heroes/erina-lv1',
      breakout: 'heroes/erina-lv1-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 1,
  level: 1,
  lineage: 'harold',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 15,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await scry(game, card, 2);

          const hasElligible = singleAllyMinionTargetRules.canPlay(game, card);
          if (!hasElligible) return;

          const targets = await singleAllyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );

          for (const target of targets) {
            await target.modifiers.add(
              new SimpleMinionStatsModifier('harold-lv1-stats-buff', game, target, {
                attackAmount: 1,
                healthAmount: 1
              })
            );
          }
        }
      })
    );
  },
  async onPlay() {}
};
