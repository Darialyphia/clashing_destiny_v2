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
import { singleAllyTargetRules } from '../../../../card-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { UntilEventModifierMixin } from '../../../../../modifier/mixins/until-event';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { getEmpowerStacks } from '../../../../card-actions-utils';

export const manaShield: SpellBlueprint = {
  id: 'mana-shield',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Shield',
  description: dedent`
    The next time target ally would take damage this turn, prevent 2 + @Empowered@ stacks of that damage and draw a card into your Destiny Zone.
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
      bg: 'spells/mana-shield-bg',
      main: 'spells/mana-shield',
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
              const damageToNegate = 2 + getEmpowerStacks(card);
              const newValue = Math.max(0, value - damageToNegate);
              return newValue;
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
            async handler(event) {
              if (event.data.card.equals(target)) {
                await card.player.cardManager.drawIntoDestinyZone(1);
              }
            }
          }),
          new UntilEndOfTurnModifierMixin(game),
          new UntilEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
            filter: event => event.data.card.equals(target)
          })
        ]
      })
    );
  }
};
