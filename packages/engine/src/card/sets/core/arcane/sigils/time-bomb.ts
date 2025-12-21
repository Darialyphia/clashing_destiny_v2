import type { SigilBlueprint } from '../../../../card-blueprint';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { AbilityDamage } from '../../../../../utils/damage';
import type { BoardSlotZone } from '../../../../../board/board.constants';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { RemoveOnDestroyedMixin } from '../../../../../modifier/mixins/remove-on-destroyed';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { SigilCard } from '../../../../entities/sigil.entity';

export const timeBomb: SigilBlueprint = {
  id: 'time-bomb',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sigil of Wisdom',
  description:
    '@On Destroyed@: deal 1 damage to all enemy minions in the same zone as this. If There is another Time Bomb in the same zone, exhaust them as well.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
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
  manaCost: 1,
  runeCost: {
    RESONANCE: 1
  },
  abilities: [],
  maxCountdown: 1,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    let zone: BoardSlotZone | null = null;

    await card.modifiers.add(
      new Modifier<SigilCard>('time-bomb-zone-tracker', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_DESTROY,
            filter: event => event.data.card.equals(card),
            handler: async () => {
              zone = card.zone;
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          const enemyMinions = card.player.enemyMinions.filter(
            minion => minion.zone === zone
          );

          const hasOtherTimeBomb = card.player.boardSide
            .getZone(card.zone!)
            .sigils.some(sigil => {
              sigil.blueprintId === 'time-bomb' && !sigil.equals(card);
            });
          for (const minion of enemyMinions) {
            await minion.takeDamage(card, new AbilityDamage(1));
            if (hasOtherTimeBomb) {
              await minion.exhaust();
            }
          }
        }
      })
    );
  },
  async onPlay() {}
};
