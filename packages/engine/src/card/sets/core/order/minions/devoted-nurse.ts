import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { SimpleMinionStatsModifier } from '../../../../../modifier/modifiers/simple-minion-stats.modifier';
import { singleMinionTargetRules } from '../../../../card-utils';
import dedent from 'dedent';

export const devotedNurse: MinionBlueprint = {
  id: 'devoted-nurse',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Devoted Nurse',
  description: dedent`
  @On Enter@: Give another minion -1/+2.
  `,
  faction: FACTIONS.ORDER,
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
      bg: 'minions/devoted-nurse-bg',
      main: 'minions/devoted-nurse',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const hasElligible = singleMinionTargetRules.canPlay(game, card);
          if (!hasElligible) return;

          const targets = await singleMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );

          for (const target of targets) {
            await target.modifiers.add(
              new SimpleMinionStatsModifier(`${card.id}-buff`, game, card, {
                attackAmount: -1,
                healthAmount: 2
              })
            );
          }
        }
      })
    );
  },
  async onPlay() {}
};
