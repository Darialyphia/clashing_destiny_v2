import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { isMinion } from '../../../../card-utils';
import { HeroCard } from '../../../../entities/hero.entity';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { BurstAttackModifier } from '../../../../../modifier/modifiers/burst-attack.modifier';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';

export const haroldLv3: HeroBlueprint = {
  id: 'harold-scended-seraph',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Harold, Ascended Seraph',
  description:
    'Your minions with @Honor@ have @Burst Attack@ and "@On Death@: give your Hero +1 Atk and @Honor@ this turn".',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        lightGradient: true,
        goldenGlare: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'heroes/harold-lv3-bg',
      main: 'heroes/harold-lv3',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 4,
  level: 3,
  lineage: 'harold',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 16,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    const aura = new WhileOnBoardModifier<HeroCard>('harold-lv3-aura', game, card, {
      mixins: [
        new AuraModifierMixin(game, card, {
          isElligible(candidate) {
            return isMinion(candidate) && candidate.modifiers.has(HonorModifier);
          },
          getModifiers() {
            return [
              new BurstAttackModifier(game, card),
              new OnDeathModifier(game, card, {
                async handler() {
                  await card.modifiers.add(
                    new SimpleAttackBuffModifier('harold-lvl3-attack-buff', game, card, {
                      amount: 1,
                      mixins: [new UntilEndOfTurnModifierMixin(game)]
                    })
                  );
                  await card.modifiers.add(
                    new HonorModifier(game, card, {
                      mixins: [new UntilEndOfTurnModifierMixin(game)]
                    })
                  );
                }
              })
            ];
          }
        })
      ]
    });

    await card.modifiers.add(aura);
  },
  async onPlay() {}
};
