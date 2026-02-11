import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
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
        height: 133
      },
      bg: 'heroes/harold-lv2-bg',
      main: 'heroes/harold-lv2',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 3,
  level: 2,
  lineage: 'harold',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 16,
  canPlay: () => true,
  abilities: [
    {
      id: 'harold-vowed-crusader-ability-1',
      description:
        'Grant a minion with @Honor@: "@On Death@: Wake up your hero and give it +1 Atk" until the end of the turn.',
      label: 'Buff Honor Minion',
      canUse(game, card) {
        return (
          singleMinionTargetRules.canPlay(game, card) &&
          card.location === CARD_LOCATIONS.BOARD
        );
      },
      getPreResponseTargets(game, card) {
        return singleMinionTargetRules.getPreResponseTargets({
          game,
          card,
          label: 'Select a minion with Honor to buff',
          origin: {
            type: 'ability',
            abilityId: 'harold-vowed-crusader-ability-1',
            card
          },
          timeoutFallback: []
        });
      },
      manaCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      isHiddenOnCard: false,
      async onResolve(game, card, targets) {
        for (const target of targets) {
          if (target.location !== CARD_LOCATIONS.BOARD) continue;

          await target.modifiers.add(
            new Modifier('harold-lv2-on-death', game, card, {
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
