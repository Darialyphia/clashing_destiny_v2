import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { singleEmptyAllySlot } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { phoenix } from '../minions/phoenix';

export const immortalFlame: ArtifactBlueprint = {
  id: 'immortal-flame',
  name: 'Immortal Flame',
  cardIconId: 'immortal-flame',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 2,
  abilities: [
    {
      id: 'immortal-flame-ability',
      label: '@[exhaust]@ : +2 Attack',
      description: `@[exhaust]@ -1@[durability]@  : This turn, your hero gain +2@[attack]@.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new Modifier<HeroCard>('firebrand-buff', game, card, {
            name: 'Firebrand',
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
    },
    {
      id: 'immortal-blade-ability2',
      label: 'Summon Phoenix',
      description: `@[mana] 4@ : Banish this card. Summon a @${phoenix.name}@ on your side of the field.`,
      manaCost: 4,
      shouldExhaust: false,
      canUse(game, card) {
        return singleEmptyAllySlot.canPlay(game, card) && card.location === 'board';
      },
      async getPreResponseTargets() {
        return []; // phoenix play method will take card of target selection
      },
      async onResolve(game, card) {
        card.sendToBanishPile();
        const phoenix = await card.player.generateCard(immortalFlame.id);
        await phoenix.play();
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
