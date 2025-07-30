import { GAME_EVENTS } from '../../../../game/game.events';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import type { ArtifactCard } from '../../../entities/artifact.entity';
import type { HeroCard } from '../../../entities/hero.entity';

export const firebrand: ArtifactBlueprint = {
  id: 'firebrand',
  name: 'Firebrand',
  cardIconId: 'artifact-firebrand',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 2,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.FIRE,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  abilities: [
    {
      id: 'firebrand-ability',
      label: '+1 Attack and Burn',
      description: `@[exhaust]@ -1@[durability]@  : This turn, your hero gains +1@[attack]@ and has @On Minion Hit@ : Inflicts @Burn@ to the target.`,
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
            description: `+1 Attack. Inflicts Burn on hit.`,
            mixins: [
              new UntilEndOfTurnModifierMixin<HeroCard>(game),
              new HeroInterceptorModifierMixin(game, {
                key: 'atk',
                interceptor(value) {
                  return value + 1;
                }
              }),
              new GameEventModifierMixin(game, {
                eventName: GAME_EVENTS.HERO_AFTER_DEAL_COMBAT_DAMAGE,
                handler: async event => {
                  if (!event.data.card.equals(card.player.hero)) return;
                  if (!isMinion(event.data.target)) return;
                  await event.data.target.modifiers.add(new BurnModifier(game, card));
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
