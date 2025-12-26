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
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { SigilCard } from '../../../../entities/sigil.entity';
import dedent from 'dedent';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const timeBomb: SigilBlueprint = {
  id: 'time-bomb',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Time Bomb',
  description: dedent`
  @On Destroyed@: deal 1 damage to all enemy minions in the same zone as this. If There is another Time Bomb in the same zone, exhaust them as well.
  
  @[lvl] 2 Bonus@: @Echo@.
  `,
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
  manaCost: 2,
  abilities: [],
  maxCountdown: 1,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    const levelMod = (await card.modifiers.add(
      new LevelBonusModifier(game, card, 2)
    )) as LevelBonusModifier<SigilCard>;

    await card.modifiers.add(
      new EchoModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => levelMod.isActive)]
      })
    );

    // Tracks the zone the Time Bomb was in when it dies since OnDeath triggers after it has left the board
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
