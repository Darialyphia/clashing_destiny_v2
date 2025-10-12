import dedent from 'dedent';
import {
  HeroInterceptorModifierMixin,
  MinionInterceptorModifierMixin
} from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { singleMinionTargetRules } from '../../../card-utils';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const arbitersMaul: ArtifactBlueprint = {
  id: 'arbiter-maul',
  name: "Arbiter's Maul",
  cardIconId: 'artifacts/arbiters-maul',
  description: dedent`
  @On Enter@: Set the @[attack]@ and @[health]@ of a minion to 3.
  @Paladin Affinity@: +2 @[attack]@.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 1,
  abilities: [
    {
      id: 'cleansing-hammer-ability',
      label: '@[exhaust]@ : Grant hero Attack',
      description: `-1@[durability]@ @[exhaust]@ : @Equip Weapon@.`,
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.FLASH,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new Modifier<HeroCard>('rusty-blades-buff', game, card, {
            name: 'Cleansing Hammer',
            description: `+1 Attack.`,
            icon: 'keyword-attack-buff',
            mixins: [
              new UntilEndOfTurnModifierMixin<HeroCard>(game),
              new HeroInterceptorModifierMixin(game, {
                key: 'atk',
                interceptor(value) {
                  return value + card.atkBonus!;
                }
              })
            ]
          })
        );
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const hasTarget = singleMinionTargetRules.canPlay(game, card);
          if (!hasTarget) return;
          const [target] = await singleMinionTargetRules.getPreResponseTargets(
            game,
            card,
            {
              type: 'card',
              card
            }
          );
          target.resetDamageTaken();
          await target.modifiers.add(
            new Modifier('arbiters-maul-buff', game, card, {
              mixins: [
                new MinionInterceptorModifierMixin(game, {
                  key: 'atk',
                  interceptor: () => 3
                }),
                new MinionInterceptorModifierMixin(game, {
                  key: 'maxHp',
                  interceptor: () => 3
                })
              ]
            })
          );
        }
      })
    );
  },
  async onPlay() {}
};
