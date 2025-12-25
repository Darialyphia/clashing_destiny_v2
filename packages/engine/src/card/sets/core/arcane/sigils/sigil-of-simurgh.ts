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
import type { BoardSlotZone } from '../../../../../board/board.constants';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { SigilCard } from '../../../../entities/sigil.entity';
import dedent from 'dedent';
import { simurgh } from '../minions/simurgh';
import type { MinionCard } from '../../../../entities/minion.entity';

export const sigilOfSimurgh: SigilBlueprint = {
  id: 'sigil-of-simurgh',
  kind: CARD_KINDS.SIGIL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Sigil of Simurgh',
  description: dedent`On Destroyed: Summon a ${simurgh.name} in the same zone this was in.`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
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
  manaCost: 3,
  abilities: [],
  maxCountdown: 3,
  speed: CARD_SPEED.SLOW,
  canPlay: () => true,
  async onInit(game, card) {
    // Tracks the zone the Time Bomb was in when it dies since OnDeath triggers after it has left the board
    let zone: BoardSlotZone | null = null;
    await card.modifiers.add(
      new Modifier<SigilCard>('sigil-of-simurgh-zone-tracker', game, card, {
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
          const simurghCard = await card.player.generateCard<MinionCard>(simurgh.id);
          await simurghCard.playImmediatelyAt(zone!);
        }
      })
    );
  },
  async onPlay() {}
};


