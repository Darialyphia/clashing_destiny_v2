import dedent from 'dedent';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { VigilantModifier } from '../../../../modifier/modifiers/vigilant.modifier';
import type { HeroBlueprint } from '../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { HeroCard } from '../../../entities/hero.entity';
import { SimpleMinionStatsModifier } from '../../../../modifier/modifiers/simple-minion-stats.modifier';

export const aidenLv2: HeroBlueprint = {
  id: 'aiden-lv2',
  name: "Aiden, Crown's Vanguard",
  description: dedent`
  @Aiden Lineage@
  @On Enter@: Give a friendly minion +1@[attack]@ and +1@[health]@.
  `,
  cardIconId: 'heroes/aiden-lv2',
  kind: CARD_KINDS.HERO,
  level: 2,
  destinyCost: 2,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.WARRIOR],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  collectable: true,
  unique: false,
  lineage: 'aiden',
  spellPower: 0,
  atk: 1,
  maxHp: 21,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'aiden-lv2-ability-1',
      canUse: (game, card) => card.location === 'board',
      label: '@[mana] 1@ : gain @Vigilant@.',
      description: '@[mana] 1@ : Aiden gains @Vigilant@ this turn.',
      manaCost: 1,
      shouldExhaust: false,
      speed: CARD_SPEED.FLASH,
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.modifiers.add(
          new VigilantModifier<HeroCard>(game, card, {
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (!singleAllyMinionTargetRules.canPlay(game, card)) return;
          const [target] = await singleAllyMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card }
          );
          await target.modifiers.add(
            new SimpleMinionStatsModifier('aiden-lv2-buff', game, card, {
              name: "Aiden, Crown's Vanguard",
              attackAmount: 1,
              healthAmount: 1
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
