import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { isMinion } from '../../../../card-utils';
import { HeroCard } from '../../../../entities/hero.entity';
import type { MinionCard } from '../../../../entities/minion.entity';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';

export const haroldLv3: HeroBlueprint = {
  id: 'harold-scended-seraph',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Harold, Ascended Seraph',
  description:
    'Your minion with @Honor@ have @Burst Attack@ and "@On Death@: draw a card give your Hero +1 Atk this turn".',
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  destinyCost: 3,
  level: 3,
  lineage: 'harold',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 21,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<HeroCard>('harold-lv3-honor-death-trigger', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_DESTROY,
            async handler(event) {
              const destroyedCard = event.data.card;

              if (!isMinion(destroyedCard)) return;
              if (!destroyedCard.player.equals(card.player)) return;
              if (!destroyedCard.modifiers.has(HonorModifier)) return;

              await card.player.cardManager.draw(1);

              const buffTargets = [card, ...card.player.minions];
              for (const ally of buffTargets) {
                if (ally.location !== CARD_LOCATIONS.BOARD) continue;

                await (ally as MinionCard).modifiers.add(
                  new SimpleAttackBuffModifier(
                    'harold-lv3-attack-buff-ally',
                    game,
                    card,
                    {
                      amount: 1,
                      mixins: [new UntilEndOfTurnModifierMixin(game)]
                    }
                  )
                );
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
