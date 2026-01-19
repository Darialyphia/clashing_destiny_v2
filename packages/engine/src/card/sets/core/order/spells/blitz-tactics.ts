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
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { frontlineSkirmisher } from '../minions/frontline-skirmisher';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';

export const blitzTactics: SpellBlueprint = {
  id: 'blitz-tactics',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Blitz Tactics',
  description: dedent`
    @Loyalty 2@.
    The next card you play this turn has Burst speed.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
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
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 3,
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay() {
    return true;
  },
  getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit(game, card) {
    await card.modifiers.add(
      new LoyaltyModifier(game, card, {
        hpAmount: 2
      })
    );
  },
  async onPlay(game, card) {
    await card.player.modifiers.add(
      new Modifier('blitz-tactics-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.player.equals(card.player) && !candidate.equals(card);
            },
            getModifiers() {
              return [
                new Modifier('blitz-tactics-speed-modifier', game, card, {
                  mixins: [
                    new CardInterceptorModifierMixin(game, {
                      key: 'speed',
                      interceptor: () => CARD_SPEED.BURST
                    })
                  ]
                })
              ];
            }
          })
        ]
      })
    );
  }
};
