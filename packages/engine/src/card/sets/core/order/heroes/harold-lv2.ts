import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { singleMinionTargetRules } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';

export const haroldLv2: HeroBlueprint = {
  id: 'harold-vowed-crusader',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Harold, Vowed Crusader',
  description: '@On Enter@: If you control a minion with @Honor@, draw a card.',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.EPIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: false,
        gradient: false,
        lightGradient: true,
        scanlines: false,
        goldenGlare: false,
        glitter: true
      },
      dimensions: {
        width: 174,
        height: 140
      },
      bg: 'heroes/erina-lv1-bg',
      main: 'heroes/erina-lv1',
      breakout: 'heroes/erina-lv1-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  level: 2,
  lineage: 'harold',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 15,
  canPlay: () => true,
  abilities: [
    {
      id: 'harold-vowed-crusader-ability-1',
      description:
        'Grant a minion @Honor@ this turn. If it dies this turn, wake up this card and give it +1 Atk this turn.',
      label: 'Grant Honor',
      canUse: singleMinionTargetRules.canPlay,
      getPreResponseTargets(game, card) {
        return singleMinionTargetRules.getPreResponseTargets(game, card, {
          type: 'ability',
          abilityId: 'harold-vowed-crusader-ability-1',
          card
        });
      },
      manaCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      isHiddenOnCard: false,
      async onResolve(game, card, targets) {
        for (const target of targets) {
          if (target.location !== CARD_LOCATIONS.BOARD) continue;

          await target.modifiers.add(
            new HonorModifier(game, card, {
              mixins: [
                new UntilEndOfTurnModifierMixin(game),
                new GameEventModifierMixin(game, {
                  eventName: GAME_EVENTS.CARD_AFTER_DESTROY,
                  async handler(event) {
                    if (!event.data.card.equals(target)) return;

                    await card.player.hero.wakeUp();
                    await card.player.hero.modifiers.add(
                      new SimpleAttackBuffModifier(
                        'harold-lv2-attack-buff',
                        game,
                        card.player.hero,
                        {
                          amount: 1,
                          mixins: [new UntilEndOfTurnModifierMixin(game)]
                        }
                      )
                    );
                  }
                })
              ]
            })
          );
        }
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          if (card.player.allAllies.some(ally => ally.modifiers.has(HonorModifier))) {
            await card.player.cardManager.draw(1);
          }
        }
      })
    );
  },
  async onPlay() {}
};
