import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { RemoveOnDestroyedMixin } from '../../../../modifier/mixins/remove-on-destroyed';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { ArtifactCard } from '../../../entities/artifact.entity';
import { HeroCard } from '../../../entities/hero.entity';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const rainbowCeremonialSword: ArtifactBlueprint = {
  id: 'rainbow-sword',
  name: 'Rainbow Ceremonial Sword',
  cardIconId: 'artifact-rainbow-blade',
  description: dedent`
  @On Destroyed@ : Draw 1 card.`,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  durability: 4,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'rainbow-ceremonial-sword-ability',
      label: '@[exhaust]@ : +2 @[attack]@, +2 @[spellpower]@',
      description: `@[exhaust]@ -1@[durability]@ : This turn, your hero gain +2@[attack]@ and +2@[spellpower]@.`,
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
          new Modifier<HeroCard>('rainbow-ceremonial-sword-buff', game, card, {
            name: 'Rainbow Ceremonial Sword',
            description: `+2 Attack and +2 Spellpower.`,
            icon: 'keyword-attack-buff',
            mixins: [
              new UntilEndOfTurnModifierMixin<HeroCard>(game),
              new HeroInterceptorModifierMixin(game, {
                key: 'atk',
                interceptor(value) {
                  return value + card.atkBonus;
                }
              }),
              new HeroInterceptorModifierMixin(game, {
                key: 'spellPower',
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
  async onPlay(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(2);
        }
      })
    );
  }
};
