import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS
} from '../../../../card.enums';
import dedent from 'dedent';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { HeroInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { ArtifactCard } from '../../../../entities/artifact.entity';

export const sunArmor: ArtifactBlueprint = {
  id: 'sun-armor',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sun Armor',
  description: dedent`
  The first time your hero takes damage each turn, reduce the damage by 2.
  When your hero takes damage, this loses 1 durability.
  @On Destroyed@: draw a card.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  subKind: ARTIFACT_KINDS.RELIC,
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
  manaCost: 3,
  durability: 3,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(1);
        }
      })
    );

    await card.modifiers.add(
      new WhileOnBoardModifier('sun-armor-aura', game, card, {
        mixins: [
          new TogglableModifierMixin(
            game,
            () => card.player.hero.damageTracker.damageInstancesThisTurn.length === 0
          ),
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.equals(card.player.hero);
            },
            getModifiers() {
              return [
                new Modifier('sun-armor-damage-reduction', game, card, {
                  mixins: [
                    new HeroInterceptorModifierMixin(game, {
                      key: 'receivedDamage',
                      interceptor: damage => {
                        return Math.max(0, damage - 2);
                      }
                    })
                  ]
                })
              ];
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new Modifier<ArtifactCard>('sun-armor-durability-loss', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_TAKE_DAMAGE,
            filter(event) {
              return event.data.card.equals(card.player.hero);
            },
            async handler() {
              await card.loseDurability(1);
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
