import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';

export const rustyBlade: ArtifactBlueprint = {
  id: 'rusty-blade',
  name: 'Rusty Blade',
  cardIconId: 'artifacts/rusty-blade',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: null,
  durability: 1,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 2,
  abilities: [
    {
      id: 'rusty-blade-ability',
      label: '@[exhaust]@ : +2 Attack',
      description: `@[exhaust]@ -1@[durability]@ : This turn, your hero gain +2@[attack]@.`,
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
            name: 'Rusty Blade',
            description: `+2 Attack.`,
            icon: 'keyword-attack-buff',
            mixins: [
              new UntilEndOfTurnModifierMixin<HeroCard>(game),
              new HeroInterceptorModifierMixin(game, {
                key: 'atk',
                interceptor(value) {
                  return value + card.atkBonus;
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
  async onInit() {},
  async onPlay() {}
};
