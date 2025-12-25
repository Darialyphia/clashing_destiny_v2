import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { MinionInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { isMinion, singleAllyTargetRules } from '../../../../card-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { UntilEventModifierMixin } from '../../../../../modifier/mixins/until-event';

export const manaShield: SpellBlueprint = {
  id: 'mana-shield',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Shield',
  description: dedent`
    The next time target ally would take damage this turn, prevent  1 + Hero level of that damage and add a @Mana Spark@ to your hand equal to the prevented damage.
`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: singleAllyTargetRules.canPlay,
  getPreResponseTargets: (game, card) =>
    singleAllyTargetRules.getPreResponseTargets(game, card, { type: 'card', card }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    const MODIFIER_ID = 'mana-shield-damage-negation';
    await target.modifiers.add(
      new Modifier<MinionCard>(MODIFIER_ID, game, target, {
        mixins: [
          new MinionInterceptorModifierMixin(game, {
            key: 'receivedDamage',
            interceptor: value => {
              const damageToNegate = 1 + card.player.hero.level;
              const newValue = Math.max(0, value - damageToNegate);
              return newValue;
            }
          }),
          new UntilEventModifierMixin(game, {
            eventName: isMinion(target)
              ? GAME_EVENTS.MINION_AFTER_TAKE_DAMAGE
              : GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            filter: event => event.data.card.equals(target)
          })
        ]
      })
    );
  }
};


