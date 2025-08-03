import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { EmberModifier } from '../../../../modifier/modifiers/ember.modifier';
import { DAMAGE_TYPES } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';

export const moltenShield: SpellBlueprint<MinionCard | HeroCard> = {
  id: 'molten-shield',
  name: 'Molten Shield',
  cardIconId: 'spell-molten-shield',
  description:
    'Prevent the next 2 combat damage dealt to your hero this turn. Add stacks of @Ember@ to your hero equal to the damage prevented.\n\n@Echoed Destiny@.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(new EchoedDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('molten-shield', game, card, {
        name: 'Molten Shield',
        description: 'Prevent the 2 combat damage dealt to this.',
        icon: 'keyword-molten-shield',
        mixins: [
          new UntilEndOfTurnModifierMixin(game),
          new UnitInterceptorModifierMixin(game, {
            key: 'receivedDamage',
            interceptor: (value, ctx) => {
              if (ctx.damage.type !== DAMAGE_TYPES.COMBAT) return value;
              const maxMitigation = 2;
              return Math.max(0, value - maxMitigation);
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            handler: async (event, modifier) => {
              if (!event.data.card.equals(card.player.hero)) return;
              if (event.data.damage.type !== DAMAGE_TYPES.COMBAT) return;
              await modifier.target.modifiers.remove(modifier);
              const amountPrevented =
                event.data.damage.baseAmount -
                event.data.damage.getFinalAmount(event.data.card);
              await card.player.hero.modifiers.add(
                new EmberModifier(game, card, amountPrevented)
              );
            }
          })
        ]
      })
    );

    await card.player.cardManager.drawIntoDestinyZone(1);
  }
};
